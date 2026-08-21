import { useEffect, useMemo, useState } from "react";
import { Copy, QrCode, RefreshCw, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRL } from "@/lib/iphones";
import { toast } from "sonner";

function fakePixPayload(seed: string, amount: number) {
  const base = `00020126BR.GOV.BCB.PIX0136${seed.replace(/\W/g, "").padEnd(32, "0").slice(0, 32)}5204000053039865802BR5915GORILLAPHONEBH6009SAOPAULO54${String(
    amount.toFixed(2),
  ).padStart(7, "0")}6304`;
  let h = 0;
  for (const c of base) h = (h * 31 + c.charCodeAt(0)) % 65535;
  return base + h.toString(16).toUpperCase().padStart(4, "0");
}

export function PixCheckout({
  amount,
  seed,
  affiliate,
}: {
  amount: number;
  seed: string;
  affiliate?: string | null;
}) {
  const [attempt, setAttempt] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(120);

  const payload = useMemo(
    () => fakePixPayload(seed + attempt + (affiliate ?? ""), amount),
    [seed, attempt, amount, affiliate],
  );

  useEffect(() => {
    setSecondsLeft(120);
    const id = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [attempt]);

  const expired = secondsLeft === 0;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=${encodeURIComponent(payload)}`;

  return (
    <div className="card-elevated p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <QrCode className="size-4 text-primary" />
          Pagamento via Pix
        </div>
        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
            expired ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-primary"
          }`}
        >
          <Timer className="size-4" />
          {expired ? "Pix expirado" : `${mm}:${ss}`}
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold">{BRL(amount)}</p>
      <p className="text-sm text-muted-foreground">
        Custo de análise de crédito — obrigatório para dar continuidade na aprovação.
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="relative mx-auto w-fit rounded-2xl bg-foreground p-3">
          <img
            src={qrUrl}
            alt="QR Code do Pix para o custo de análise"
            width={220}
            height={220}
            loading="lazy"
            className={expired ? "opacity-20 blur-sm" : ""}
          />
          {expired && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button variant="hero" size="sm" onClick={() => setAttempt((a) => a + 1)}>
                <RefreshCw /> Gerar novo Pix
              </Button>
            </div>
          )}
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
            disabled={expired}
            onClick={() => {
              navigator.clipboard?.writeText(payload);
              toast.success("Código Pix copiado!");
            }}
          >
            <Copy /> Copiar código Pix
          </Button>
          {affiliate && (
            <p className="text-xs text-muted-foreground">
              Venda atribuída ao afiliado <span className="text-primary">{affiliate}</span>
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            O código expira em 2 minutos. Após o pagamento, a análise é concluída em até 10
            minutos e você recebe o retorno por WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}
