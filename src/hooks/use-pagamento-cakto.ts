import { useEffect, useState } from "react";
import type { StatusPagamento } from "@/lib/cakto";

const INTERVALO_CONSULTA_MS = 4000;

/**
 * Acompanha o pagamento do token consultando o servidor, que por sua vez lê o
 * que o webhook da Cakto gravou. Para de consultar quando o pagamento aprova e
 * enquanto a aba está em segundo plano — o cliente costuma sair para o app do
 * banco e voltar, e a volta dispara uma consulta na hora.
 */
export function usePagamentoCakto(token: string): StatusPagamento {
  const [pagamento, setPagamento] = useState<StatusPagamento>(null);
  const pago = pagamento?.status === "paid";

  useEffect(() => {
    if (!token || pago) return;
    let ativo = true;

    async function consultar() {
      if (document.visibilityState === "hidden") return;
      try {
        const res = await fetch(`/api/cakto/status?token=${encodeURIComponent(token)}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const dados = (await res.json()) as StatusPagamento;
        if (ativo && dados) setPagamento(dados);
      } catch {
        // Rede instável: a próxima rodada tenta de novo.
      }
    }

    void consultar();
    const id = setInterval(() => void consultar(), INTERVALO_CONSULTA_MS);
    document.addEventListener("visibilitychange", consultar);
    return () => {
      ativo = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", consultar);
    };
  }, [token, pago]);

  return pagamento;
}
