const FOTOS = [1, 2, 3, 4, 5, 6].map((n) => `/clientes/cliente-${n}.jpg`);

/**
 * Fotos de clientes rolando na horizontal em loop contínuo.
 * A lista é renderizada duas vezes: quando a primeira metade sai da tela
 * (translateX(-50%)), a segunda já está no lugar dela e a emenda não aparece.
 */
export function ClientesMarquee() {
  return (
    <section className="pb-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">
          Quem já saiu com o <span className="text-gradient-brand">iPhone novo</span>
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Clientes da Gorillaphone recebendo o aparelho.
        </p>
      </div>

      <div className="marquee group relative mt-6 overflow-hidden">
        <div className="marquee-track flex w-max gap-4">
          {[...FOTOS, ...FOTOS].map((src, i) => (
            <figure
              key={`${src}-${i}`}
              className="h-56 shrink-0 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] sm:h-72"
            >
              <img
                src={src}
                alt="Cliente da Gorillaphone com a sacola da loja e o iPhone"
                loading="lazy"
                decoding="async"
                aria-hidden={i >= FOTOS.length}
                className="h-full w-auto object-cover"
              />
            </figure>
          ))}
        </div>

        {/* Esfuma as pontas para a faixa não "cortar" na borda da tela */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent sm:w-24" />
      </div>
    </section>
  );
}
