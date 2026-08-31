import { AlertTriangle, Copy, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PIX_MERCHANT_NAME } from "@/lib/contact";
import { BRL } from "@/lib/iphones";
import { pixPayload } from "@/lib/pix";
import { toast } from "sonner";

/**
 * Pix da taxa de análise. O código é um BR Code real, montado a partir da chave
 * configurada em `lib/contact.ts` — se a chave não estiver preenchida a tela
 * avisa, em vez de mostrar um código que o banco recusaria.
 */
export function PixCheckout({
  amount,
  reference,
  affiliate,
}: {
  amount: number;
  reference: string;
  affiliate?: string | null;
}) {
  const payload = pixPayload({ amount, reference });

  if (!payload) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-5">
        <p className="flex items-center gap-2 font-semibold text-destructive">
          <AlertTriangle className="size-5" /> Pix não configurado
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Preencha <span className="font-mono text-foreground">PIX_KEY</span> em{" "}
          <span className="font-mono text-foreground">src/lib/contact.ts</span> com a chave da loja
          para que o código de pagamento seja gerado.
        </p>
      </div>
    );
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=${encodeURIComponent(payload)}`;

  return (
    <div className="rounded-2xl border border-border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <QrCode className="size-4 text-primary" />
          Pagamento via Pix
        </div>
        <p className="text-2xl font-bold">{BRL(amount)}</p>
      </div>

      <div className="mt-5 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="mx-auto w-fit rounded-2xl bg-white p-3">
          <img
            src={qrUrl}
            alt="QR Code do Pix da taxa de análise"
            width={200}
            height={200}
            loading="lazy"
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Pix copia e cola</p>
          <div className="max-h-24 overflow-auto rounded-xl border border-border bg-secondary/60 p-3 font-mono text-[11px] leading-relaxed break-all text-muted-foreground">
            {payload}
          </div>
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={() => {
              navigator.clipboard
                ?.writeText(payload)
                .then(() => toast.success("Código Pix copiado!"))
                .catch(() => toast.error("Não foi possível copiar — use o QR Code"));
            }}
          >
            <Copy /> Copiar código Pix
          </Button>
          <p className="text-xs text-muted-foreground">
            Recebedor: <span className="font-semibold text-foreground">{PIX_MERCHANT_NAME}</span> —
            é a empresa que faz a intermediação da análise, por isso o nome no seu banco é diferente
            do nome da loja.
          </p>
          <p className="text-xs text-muted-foreground">
            Identificador <span className="font-mono text-foreground">{reference}</span> — ele vem
            junto no comprovante e ajuda a localizar seu pedido.
          </p>
          {affiliate && (
            <p className="text-xs text-muted-foreground">
              Indicação de <span className="text-primary">{affiliate}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
