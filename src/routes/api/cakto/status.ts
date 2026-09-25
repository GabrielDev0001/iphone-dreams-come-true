import { createFileRoute } from "@tanstack/react-router";
import { chamarRpc } from "@/lib/cakto-db.server";

/** Consulta do navegador: `GET /api/cakto/status?token=...` → `{ status, refId }` ou `null`. */
export const Route = createFileRoute("/api/cakto/status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const token = new URL(request.url).searchParams.get("token") ?? "";
        if (!/^[A-Za-z0-9._~-]{8,255}$/.test(token)) {
          return Response.json({ erro: "token inválido" }, { status: 400 });
        }

        try {
          const resultado = await chamarRpc("cakto_status", { p_token: token });
          return Response.json(resultado ?? null, { headers: { "cache-control": "no-store" } });
        } catch (error) {
          console.error(error);
          return Response.json({ erro: "indisponível" }, { status: 502 });
        }
      },
    },
  },
});
