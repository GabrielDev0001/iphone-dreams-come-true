import { BANCOS } from "@/lib/bancos";

/**
 * Mostra quais financeiras a equipe vai consultar na análise.
 *
 * Os logos entram de forma escalonada — é uma animação de apresentação, não de
 * progresso: nada está sendo consultado enquanto essa tela aparece, então não
 * há spinner, barra de progresso nem marcação de "concluído" por banco.
 */
export function ConsultaBancos() {
  return (
    <div className="mt-5 rounded-2xl border border-border bg-secondary/40 p-5">
      <h4 className="font-display text-base font-bold">Vamos consultar estas financeiras</h4>
      <p className="mt-1 text-sm text-muted-foreground">
        Assim que o pagamento for confirmado, nossa equipe leva seu CPF para análise nestas
        instituições e volta com a melhor condição que sair.
      </p>

      <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {BANCOS.map((banco, i) => (
          <li
            key={banco.id}
            className="rise-in grid h-14 place-items-center rounded-xl bg-white px-3"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <img
              src={banco.logo}
              alt={banco.nome}
              loading="lazy"
              decoding="async"
              className="max-h-8 w-auto max-w-full object-contain"
            />
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-muted-foreground">
        A consulta é feita por uma pessoa da nossa equipe, não por um sistema automático — por isso
        o retorno não é instantâneo.
      </p>
    </div>
  );
}
