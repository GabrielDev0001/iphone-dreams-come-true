
create table if not exists public.meta_checkout_contexto (
  token text primary key,
  em_hash text,
  ph_hash text,
  fn_hash text,
  ln_hash text,
  external_id_hash text,
  fbp text,
  fbc text,
  client_ip text,
  user_agent text,
  event_source_url text,
  event_id_lead text,
  event_id_purchase text not null,
  valor numeric not null default 0,
  currency text not null default 'BRL',
  enviado_purchase boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint meta_checkout_token_formato check (token ~ '^[A-Za-z0-9._~-]{8,255}$')
);

alter table public.meta_checkout_contexto enable row level security;
revoke all on public.meta_checkout_contexto from anon, authenticated;

create or replace function public.meta_salvar_contexto(
  p_token text,
  p_em_hash text,
  p_ph_hash text,
  p_fn_hash text,
  p_ln_hash text,
  p_external_id_hash text,
  p_fbp text,
  p_fbc text,
  p_client_ip text,
  p_user_agent text,
  p_event_source_url text,
  p_event_id_lead text,
  p_event_id_purchase text,
  p_valor numeric,
  p_currency text default 'BRL'
)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_token is null or p_token !~ '^[A-Za-z0-9._~-]{8,255}$' then
    return 'token_invalido';
  end if;
  if p_event_id_purchase is null or length(p_event_id_purchase) < 8 then
    return 'event_id_invalido';
  end if;

  insert into public.meta_checkout_contexto as c
    (token, em_hash, ph_hash, fn_hash, ln_hash, external_id_hash,
     fbp, fbc, client_ip, user_agent, event_source_url,
     event_id_lead, event_id_purchase, valor, currency)
  values (
    p_token, p_em_hash, p_ph_hash, p_fn_hash, p_ln_hash, p_external_id_hash,
    p_fbp, p_fbc, p_client_ip, p_user_agent, p_event_source_url,
    p_event_id_lead, p_event_id_purchase, coalesce(p_valor, 0), coalesce(p_currency, 'BRL')
  )
  on conflict (token) do update set
    em_hash = coalesce(excluded.em_hash, c.em_hash),
    ph_hash = coalesce(excluded.ph_hash, c.ph_hash),
    fn_hash = coalesce(excluded.fn_hash, c.fn_hash),
    ln_hash = coalesce(excluded.ln_hash, c.ln_hash),
    external_id_hash = coalesce(excluded.external_id_hash, c.external_id_hash),
    fbp = coalesce(excluded.fbp, c.fbp),
    fbc = coalesce(excluded.fbc, c.fbc),
    client_ip = coalesce(excluded.client_ip, c.client_ip),
    user_agent = coalesce(excluded.user_agent, c.user_agent),
    event_source_url = coalesce(excluded.event_source_url, c.event_source_url),
    event_id_lead = coalesce(excluded.event_id_lead, c.event_id_lead),
    -- Não troca o event_id do Purchase se já foi enviado (dedup).
    event_id_purchase = case
      when c.enviado_purchase then c.event_id_purchase
      else excluded.event_id_purchase end,
    valor = coalesce(excluded.valor, c.valor),
    currency = coalesce(excluded.currency, c.currency),
    atualizado_em = now();

  return 'ok';
end;
$$;

-- Reserva o Purchase: devolve o contexto e marca enviado_purchase.
-- Retorna null se já foi enviado ou se o token não existe.
create or replace function public.meta_claim_purchase(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.meta_checkout_contexto%rowtype;
begin
  if p_token is null or p_token !~ '^[A-Za-z0-9._~-]{8,255}$' then
    return null;
  end if;

  update public.meta_checkout_contexto
  set enviado_purchase = true, atualizado_em = now()
  where token = p_token and enviado_purchase = false
  returning * into rec;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'token', rec.token,
    'em_hash', rec.em_hash,
    'ph_hash', rec.ph_hash,
    'fn_hash', rec.fn_hash,
    'ln_hash', rec.ln_hash,
    'external_id_hash', rec.external_id_hash,
    'fbp', rec.fbp,
    'fbc', rec.fbc,
    'client_ip', rec.client_ip,
    'user_agent', rec.user_agent,
    'event_source_url', rec.event_source_url,
    'event_id_purchase', rec.event_id_purchase,
    'valor', rec.valor,
    'currency', rec.currency
  );
end;
$$;

revoke all on function public.meta_salvar_contexto(
  text, text, text, text, text, text, text, text, text, text, text, text, text, numeric, text
) from public;
revoke all on function public.meta_claim_purchase(text) from public;
grant execute on function public.meta_salvar_contexto(
  text, text, text, text, text, text, text, text, text, text, text, text, text, numeric, text
) to anon, authenticated;
grant execute on function public.meta_claim_purchase(text) to anon, authenticated;
