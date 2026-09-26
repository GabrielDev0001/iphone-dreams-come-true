import { createFileRoute } from "@tanstack/react-router";
import { chamarRpc } from "@/lib/cakto-db.server";
import {
  enviarEventosMeta,
  metaCredenciais,
  type MetaEvento,
  type MetaUserData,
} from "@/lib/meta-capi.server";

type ContextoPurchase = {
  token: string;
  em_hash: string | null;
  ph_hash: string | null;
  fn_hash: string | null;
  ln_hash: string | null;
  external_id_hash: string | null;
  fbp: string | null;
  fbc: string | null;
  client_ip: string | null;
  user_agent: string | null;
  event_source_url: string | null;
  event_id_purchase: string;
  valor: number;
  currency: string;
};

function tokensPagos(payload: unknown): string[] {
  if (!payload || typeof payload !== "object") return [];
  const data = (payload as { data?: unknown }).data;
  const pedidos = Array.isArray(data) ? data : data && typeof data === "object" ? [data] : [];
  const tokens: string[] = [];
  for (const pedido of pedidos) {
    if (!pedido || typeof pedido !== "object") continue;
    const p = pedido as Record<string, unknown>;
    if (p["status"] !== "paid") continue;
    const callback = p["callback"];
    const sck = p["sck"];
    const tok =
      (typeof callback === "string" && callback) || (typeof sck === "string" && sck) || "";
    if (/^[A-Za-z0-9._~-]{8,255}$/.test(tok)) tokens.push(tok);
  }
  return tokens;
}

function userDataDoContexto(ctx: ContextoPurchase): MetaUserData {
  const user: MetaUserData = {};
  if (ctx.em_hash) user.em = ctx.em_hash;
  if (ctx.ph_hash) user.ph = ctx.ph_hash;
  if (ctx.fn_hash) user.fn = ctx.fn_hash;
  if (ctx.ln_hash) user.ln = ctx.ln_hash;
  if (ctx.external_id_hash) user.external_id = ctx.external_id_hash;
  if (ctx.fbp) user.fbp = ctx.fbp;
  if (ctx.fbc) user.fbc = ctx.fbc;
  if (ctx.client_ip) user.client_ip_address = ctx.client_ip;
  if (ctx.user_agent) user.client_user_agent = ctx.user_agent;
  return user;
}

async function enviarPurchaseMeta(token: string) {
  if (!metaCredenciais()) return;
  try {
    const ctx = (await chamarRpc("meta_claim_purchase", { p_token: token })) as ContextoPurchase | null;
    if (!ctx?.event_id_purchase) return;

    const evento: MetaEvento = {
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: ctx.event_id_purchase,
      action_source: "website",
      user_data: userDataDoContexto(ctx),
      custom_data: {
        value: Number(ctx.valor) || 0,
        currency: ctx.currency || "BRL",
      },
    };
    if (ctx.event_source_url) evento.event_source_url = ctx.event_source_url;

    const resultado = await enviarEventosMeta([evento]);

    if (!resultado.ok) {
      console.error("Purchase CAPI falhou:", token, resultado.body);
    }
  } catch (error) {
    console.error("Purchase CAPI erro:", token, error);
  }
}

/**
 * Endpoint cadastrado no painel da Cakto (Webhooks → URL).
 *
 * Repassa o corpo inteiro para `cakto_webhook` no banco, que valida o `secret`
 * e grava o status do pedido pelo token que foi no `?callback=` do checkout.
 * Em pagamentos `paid`, dispara Purchase na Conversions API da Meta.
 */
export const Route = createFileRoute("/api/cakto/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ ok: false, erro: "json inválido" }, { status: 400 });
        }

        try {
          const resultado = await chamarRpc("cakto_webhook", { payload });
          if (resultado === "unauthorized") {
            return Response.json({ ok: false }, { status: 401 });
          }

          // Fire-and-forget: não atrasa a resposta da Cakto se a Meta falhar.
          const pagos = tokensPagos(payload);
          if (pagos.length > 0) {
            void Promise.all(pagos.map((tok) => enviarPurchaseMeta(tok)));
          }

          return Response.json({ ok: true, resultado });
        } catch (error) {
          // A Cakto não reenvia respostas de erro sozinha; o evento fica no
          // histórico do painel para reenvio manual.
          console.error(error);
          return Response.json({ ok: false }, { status: 502 });
        }
      },
    },
  },
});
