import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { chamarRpc } from "@/lib/cakto-db.server";
import {
  enviarEventosMeta,
  hashMeta,
  metaCredenciais,
  montarUserDataHasheado,
  normalizarCpf,
  normalizarEmail,
  normalizarNome,
  normalizarTelefone,
  type MetaEvento,
} from "@/lib/meta-capi.server";
import { ANALYSIS_FEE } from "@/lib/iphones";

const bodySchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9._~-]{8,255}$/),
  eventIdLead: z.string().min(8).max(255),
  eventIdPurchase: z.string().min(8).max(255),
  nome: z.string().min(2).max(200),
  email: z.string().email().max(200),
  telefone: z.string().min(8).max(30),
  cpf: z.string().min(11).max(20),
  fbp: z.string().max(255).nullable().optional(),
  fbc: z.string().max(255).nullable().optional(),
  eventSourceUrl: z.string().url().max(2000).optional(),
  valor: z.number().positive().optional(),
});

function clientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") || request.headers.get("cf-connecting-ip");
}

/**
 * Recebe o lead do formulário: grava contexto para o Purchase futuro e envia
 * Lead pela Conversions API (deduplicado com o Pixel via eventIdLead).
 */
export const Route = createFileRoute("/api/meta/lead")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let json: unknown;
        try {
          json = await request.json();
        } catch {
          return Response.json({ ok: false, erro: "json inválido" }, { status: 400 });
        }

        const parsed = bodySchema.safeParse(json);
        if (!parsed.success) {
          return Response.json({ ok: false, erro: "payload inválido" }, { status: 400 });
        }

        const data = parsed.data;
        const ip = clientIp(request);
        const ua = request.headers.get("user-agent");
        const valor = data.valor ?? ANALYSIS_FEE;

        const em = hashMeta(normalizarEmail(data.email));
        const phNorm = normalizarTelefone(data.telefone);
        const ph = phNorm ? hashMeta(phNorm) : null;
        const { fn, ln } = normalizarNome(data.nome);
        const fnHash = fn ? hashMeta(fn) : null;
        const lnHash = ln ? hashMeta(ln) : null;
        const cpfNorm = normalizarCpf(data.cpf);
        const externalId = cpfNorm.length === 11 ? hashMeta(cpfNorm) : null;

        try {
          const salvo = await chamarRpc("meta_salvar_contexto", {
            p_token: data.token,
            p_em_hash: em,
            p_ph_hash: ph,
            p_fn_hash: fnHash,
            p_ln_hash: lnHash,
            p_external_id_hash: externalId,
            p_fbp: data.fbp ?? null,
            p_fbc: data.fbc ?? null,
            p_client_ip: ip,
            p_user_agent: ua,
            p_event_source_url: data.eventSourceUrl ?? null,
            p_event_id_lead: data.eventIdLead,
            p_event_id_purchase: data.eventIdPurchase,
            p_valor: valor,
            p_currency: "BRL",
          });

          if (salvo !== "ok") {
            return Response.json({ ok: false, erro: String(salvo) }, { status: 400 });
          }
        } catch (error) {
          console.error("meta_salvar_contexto:", error);
          return Response.json({ ok: false, erro: "falha ao salvar contexto" }, { status: 502 });
        }

        if (metaCredenciais()) {
          const user_data = montarUserDataHasheado({
            email: data.email,
            telefone: data.telefone,
            nome: data.nome,
            cpf: data.cpf,
            fbp: data.fbp ?? null,
            fbc: data.fbc ?? null,
            clientIp: ip,
            userAgent: ua,
          });

          const evento: MetaEvento = {
            event_name: "Lead",
            event_time: Math.floor(Date.now() / 1000),
            event_id: data.eventIdLead,
            action_source: "website",
            user_data,
            custom_data: { value: valor, currency: "BRL" },
          };
          if (data.eventSourceUrl) evento.event_source_url = data.eventSourceUrl;

          const resultado = await enviarEventosMeta([evento]);

          if (!resultado.ok) {
            // Contexto já salvo; Purchase ainda funciona. Lead CAPI falhou.
            console.error("Lead CAPI falhou:", resultado.body);
          }
        }

        return Response.json({ ok: true });
      },
    },
  },
});
