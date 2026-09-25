/**
 * Acesso ao banco do Lovable Cloud (Supabase) pelas funções SQL da Cakto.
 *
 * Usa só a URL e a chave pública do projeto: `cakto_webhook` confere o segredo
 * do webhook dentro do banco e `cakto_status` devolve apenas o status de um
 * token, então nenhuma chave de serviço precisa morar no site.
 */

function env(nome: string): string | undefined {
  const doProcesso =
    typeof process !== "undefined" ? (process.env?.[nome] as string | undefined) : undefined;
  const doBuild = (import.meta.env as Record<string, string | undefined>)[`VITE_${nome}`];
  return doProcesso || doBuild || undefined;
}

export async function chamarRpc(funcao: string, args: Record<string, unknown>): Promise<unknown> {
  const url = env("SUPABASE_URL");
  const chave = env("SUPABASE_PUBLISHABLE_KEY") ?? env("SUPABASE_ANON_KEY");
  if (!url || !chave) {
    throw new Error("Lovable Cloud não configurado: faltam SUPABASE_URL e a chave pública");
  }

  const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rpc/${funcao}`, {
    method: "POST",
    headers: { apikey: chave, "content-type": "application/json" },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    throw new Error(`RPC ${funcao} falhou: ${res.status} ${await res.text()}`);
  }
  return res.json();
}
