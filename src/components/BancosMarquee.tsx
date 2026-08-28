import { BANCOS } from "@/lib/bancos";

/** Faixa dos bancos parceiros, no mesmo formato da faixa de clientes. */
export function BancosMarquee() {
  return (
    <section className="pb-14">
      <p className="px-4 text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        Bancos e financeiras parceiras
      </p>

      <div className="marquee relative mt-5 overflow-hidden">
        <div className="marquee-track flex w-max gap-3" style={{ animationDuration: "32s" }}>
          {[...BANCOS, ...BANCOS].map((banco, i) => (
            <div
              key={`${banco.id}-${i}`}
              className="grid h-16 w-36 shrink-0 place-items-center rounded-xl bg-white px-4 sm:h-20 sm:w-44"
            >
              <img
                src={banco.logo}
                alt={banco.nome}
                loading="lazy"
                decoding="async"
                aria-hidden={i >= BANCOS.length}
                className="max-h-9 w-auto max-w-full object-contain sm:max-h-11"
              />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent sm:w-24" />
      </div>
    </section>
  );
}
