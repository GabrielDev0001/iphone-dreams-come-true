import { createHash } from "node:crypto";

function envPublico(nome: string): string | undefined {
  const doProcesso =
    typeof process !== "undefined" ? (process.env?.[nome] as string | undefined) : undefined;
  const doBuild = (import.meta.env as Record<string, string | undefined>)[`VITE_${nome}`];
  return doProcesso || doBuild || undefined;
}

/** Segredo: só process.env — nunca VITE_ (iria para o bundle do browser). */
function envSecreto(nome: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env?.[nome] as string | undefined;
}

export function metaCredenciais(): {
  pixelId: string;
  accessToken: string;
  testCode?: string;
} | null {
  const pixelId = envPublico("META_PIXEL_ID");
  const accessToken = envSecreto("META_CAPI_ACCESS_TOKEN");
  if (!pixelId || !accessToken) return null;
  const testCode = envSecreto("META_TEST_EVENT_CODE");
  if (testCode) return { pixelId, accessToken, testCode };
  return { pixelId, accessToken };
}

/** SHA-256 hex lowercase, como a Meta exige para user_data. */
export function hashMeta(valor: string): string {
  return createHash("sha256").update(valor).digest("hex");
}

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Telefone E.164 sem +: Brasil assume 55 se vier só DDD+número. */
export function normalizarTelefone(telefone: string): string {
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.startsWith("55") && digitos.length >= 12) return digitos;
  if (digitos.length >= 10 && digitos.length <= 11) return `55${digitos}`;
  return digitos;
}

export function normalizarNome(nome: string): { fn?: string; ln?: string } {
  const partes = nome.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return {};
  const primeiro = partes[0];
  if (!primeiro) return {};
  if (partes.length === 1) return { fn: primeiro };
  return { fn: primeiro, ln: partes.slice(1).join(" ") };
}

export function normalizarCpf(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

export type MetaUserData = {
  em?: string;
  ph?: string;
  fn?: string;
  ln?: string;
  external_id?: string;
  fbp?: string;
  fbc?: string;
  client_ip_address?: string;
  client_user_agent?: string;
};

export type MetaCustomData = {
  value?: number;
  currency?: string;
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
};

export type MetaEvento = {
  event_name: string;
  event_time: number;
  event_id: string;
  event_source_url?: string;
  action_source: "website";
  user_data: MetaUserData;
  custom_data?: MetaCustomData;
};

export function montarUserDataHasheado(input: {
  email?: string;
  telefone?: string;
  nome?: string;
  cpf?: string;
  fbp?: string | null;
  fbc?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
}): MetaUserData {
  const user: MetaUserData = {};
  if (input.email) user.em = hashMeta(normalizarEmail(input.email));
  if (input.telefone) {
    const ph = normalizarTelefone(input.telefone);
    if (ph) user.ph = hashMeta(ph);
  }
  if (input.nome) {
    const { fn, ln } = normalizarNome(input.nome);
    if (fn) user.fn = hashMeta(fn);
    if (ln) user.ln = hashMeta(ln);
  }
  if (input.cpf) {
    const ext = normalizarCpf(input.cpf);
    if (ext.length === 11) user.external_id = hashMeta(ext);
  }
  if (input.fbp) user.fbp = input.fbp;
  if (input.fbc) user.fbc = input.fbc;
  if (input.clientIp) user.client_ip_address = input.clientIp;
  if (input.userAgent) user.client_user_agent = input.userAgent;
  return user;
}

export async function enviarEventosMeta(eventos: MetaEvento[]): Promise<{ ok: boolean; body: string }> {
  const cred = metaCredenciais();
  if (!cred) {
    return { ok: false, body: "meta não configurado" };
  }
  if (eventos.length === 0) {
    return { ok: false, body: "sem eventos" };
  }

  const url = new URL(`https://graph.facebook.com/v21.0/${cred.pixelId}/events`);
  url.searchParams.set("access_token", cred.accessToken);

  const payload: Record<string, unknown> = { data: eventos };
  if (cred.testCode) payload["test_event_code"] = cred.testCode;

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.text();
  if (!res.ok) {
    console.error("Meta CAPI erro:", res.status, body);
  }
  return { ok: res.ok, body };
}
