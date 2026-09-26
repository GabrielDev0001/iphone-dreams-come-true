import { useState } from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRL } from "@/lib/iphones";
import { linkCheckoutCakto, type StatusPagamento } from "@/lib/cakto";
import { novoEventId, trackInitiateCheckout } from "@/lib/meta-pixel";

/** Status que significam que o dinheiro voltou para o cliente. */
const ESTORNADO = new Set(["refunded", "chargeback", "chargedback", "in_protest", "canceled"]);

/**
 * Pagamento da taxa de análise pelo checkout da Cakto. O checkout abre em outra
 * aba; esta tela fica esperando a confirmação chegar pelo webhook.
 */
export function CaktoCheckout({
  amount,
  token,
  pagamento,
}: {
  amount: number;
  token: string;
  pagamento: StatusPagamento;
}) {
  const [abriu, setAbriu] = useState(false);
  const status = pagamento?.status;

  if (status === "paid") {
    return (
      <div className="rounded-2xl border border-[var(--success)]/40 bg-[var(--success)]/10 p-5">
        <p className="flex items-center gap-2 font-semibold">
          <CheckCircle2 className="size-5 text-[var(--success)]" /> Pagamento confirmado
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Recebemos a taxa de análise de {BRL(amount)}
          {pagamento?.refId ? (
            <>
              {" "}
              — pedido Cakto <span className="font-mono text-foreground">{pagamento.refId}</span>
            </>
          ) : null}
          . Agora é só enviar seus dados no WhatsApp.
        </p>
      </div>
    );
  }

  if (status && ESTORNADO.has(status)) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-5">
        <p className="flex items-center gap-2 font-semibold text-destructive">
          <AlertTriangle className="size-5" /> Pagamento estornado
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Esse pagamento foi reembolsado ou contestado. Fale com a gente no WhatsApp para seguir.
        </p>
      </div>
    );
  }

  const aguardando = abriu || status === "waiting_payment" || status === "processing";

  return (
    <div className="rounded-2xl border border-border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ShieldCheck className="size-4 text-primary" />
          Pagamento seguro via Cakto
        </div>
        <p className="text-2xl font-bold">{BRL(amount)}</p>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        Pague com Pix ou cartão no checkout da Cakto, que abre em outra aba. Depois de pagar, volte
        para esta página: a confirmação aparece aqui sozinha.
      </p>

      <Button variant="hero" size="lg" className="mt-5 w-full" asChild>
        <a
          href={linkCheckoutCakto(token)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            setAbriu(true);
            trackInitiateCheckout(amount, novoEventId());
          }}
        >
          <ExternalLink /> Pagar taxa de {BRL(amount)}
        </a>
      </Button>

      {status === "refused" ? (
        <p className="mt-4 text-sm text-destructive" role="status">
          O pagamento foi recusado. Tente de novo no checkout.
        </p>
      ) : (
        aguardando && (
          <p
            className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="size-4 animate-spin text-primary" />
            Aguardando a confirmação do pagamento…
          </p>
        )
      )}
    </div>
  );
}
