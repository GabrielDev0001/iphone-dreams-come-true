-- Confirmação de pagamento da taxa de análise pela Cakto.
--
-- O webhook da Cakto chega em /api/cakto/webhook, que repassa o corpo para
-- cakto_webhook(). O site consulta cakto_status() até o pedido ficar "paid".
-- As duas funções ficam expostas à chave pública, por isso o segredo do
-- webhook é conferido aqui dentro e a tabela não tem acesso direto.
--
-- Depois de rodar, cadastre o segredo (Cakto → Webhooks → "Chave secreta"):
--   insert into private.config (chave, valor)
--   values ('cakto_webhook_secret', '<chave secreta do webhook>')
--   on conflict (chave) do update set valor = excluded.valor;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.config (
  chave text primary key,
  valor text not null
);
revoke all on private.config from public, anon, authenticated;

create table if not exists public.cakto_pagamentos (
  token text primary key,
  status text not null,
  evento text not null,
  pedido_id text,
  ref_id text,
  valor numeric,
  metodo text,
  pago_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
alter table public.cakto_pagamentos enable row level security;
revoke all on public.cakto_pagamentos from anon, authenticated;

-- Registro de tudo que chegou, para depurar entregas (sem o segredo).
create table if not exists private.cakto_eventos (
  id bigserial primary key,
  recebido_em timestamptz not null default now(),
  evento text,
  token text,
  resultado text not null,
  payload jsonb
);
revoke all on private.cakto_eventos from public, anon, authenticated;

create or replace function public.cakto_webhook(payload jsonb)
returns text
language plpgsql
security definer
set search_path = public, private
as $$
declare
  esperado text;
  evento text := payload->>'event';
  pedidos jsonb;
  pedido jsonb;
  tok text;
  novo text;
  gravados int := 0;
begin
  select valor into esperado from private.config where chave = 'cakto_webhook_secret';
  if esperado is null or coalesce(payload->>'secret', '') <> esperado then
    insert into private.cakto_eventos (evento, resultado) values (evento, 'segredo_invalido');
    return 'unauthorized';
  end if;

  -- Webhook V2 manda "data" como lista; V1 como objeto.
  pedidos := case jsonb_typeof(payload->'data')
               when 'array' then payload->'data'
               when 'object' then jsonb_build_array(payload->'data')
               else '[]'::jsonb end;

  for pedido in select * from jsonb_array_elements(pedidos) loop
    tok := nullif(coalesce(pedido->>'callback', pedido->>'sck'), '');
    novo := pedido->>'status';

    if tok is null or novo is null or tok !~ '^[A-Za-z0-9._~-]{8,255}$' then
      insert into private.cakto_eventos (evento, token, resultado, payload)
      values (evento, tok, 'sem_token', payload - 'secret');
      continue;
    end if;

    insert into public.cakto_pagamentos as p
      (token, status, evento, pedido_id, ref_id, valor, metodo, pago_em)
    values (
      tok, novo, evento, pedido->>'id', pedido->>'refId',
      nullif(pedido->>'amount', '')::numeric, pedido->>'paymentMethod',
      nullif(pedido->>'paidAt', '')::timestamptz
    )
    on conflict (token) do update set
      -- Eventos chegam fora de ordem: um "pix_gerado" atrasado não pode
      -- desfazer um pagamento já aprovado. Só reembolso/chargeback tiram o "paid".
      status = case
        when p.status = 'paid' and excluded.status in ('waiting_payment', 'processing', 'authorized', 'refused')
          then p.status
        else excluded.status end,
      evento = case
        when p.status = 'paid' and excluded.status in ('waiting_payment', 'processing', 'authorized', 'refused')
          then p.evento
        else excluded.evento end,
      pedido_id = coalesce(excluded.pedido_id, p.pedido_id),
      ref_id = coalesce(excluded.ref_id, p.ref_id),
      valor = coalesce(excluded.valor, p.valor),
      metodo = coalesce(excluded.metodo, p.metodo),
      pago_em = coalesce(excluded.pago_em, p.pago_em),
      atualizado_em = now();

    insert into private.cakto_eventos (evento, token, resultado, payload)
    values (evento, tok, 'ok:' || novo, payload - 'secret');
    gravados := gravados + 1;
  end loop;

  return 'ok:' || gravados;
end;
$$;

-- Consulta do site: devolve só status e refId do token (ou null).
drop function if exists public.cakto_status(text);
create function public.cakto_status(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object('status', status, 'refId', ref_id)
  from public.cakto_pagamentos where token = p_token;
$$;

revoke all on function public.cakto_webhook(jsonb) from public;
revoke all on function public.cakto_status(text) from public;
grant execute on function public.cakto_webhook(jsonb) to anon, authenticated;
grant execute on function public.cakto_status(text) to anon, authenticated;
