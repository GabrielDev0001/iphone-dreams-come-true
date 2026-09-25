import { createFileRoute } from "@tanstack/react-router";
import { chamarRpc } from "@/lib/cakto-db.server";

/**
 * Endpoint cadastrado no painel da Cakto (Webhooks → URL).
 *
 * Repassa o corpo inteiro para `cakto_webhook` no banco, que valida o `secret`
 * e grava o status do pedido pelo token que foi no `?callback=` do checkout.
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
