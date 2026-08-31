/**
 * Validação de CPF pelos dígitos verificadores (algoritmo da Receita Federal).
 * Só garante que o número é bem formado — não diz nada sobre quem é o titular.
 */
export function isValidCPF(input: string): boolean {
  const d = input.replace(/\D/g, "");
  if (d.length !== 11) return false;

  // 000.000.000-00, 111.111.111-11 … passam no cálculo mas não existem.
  if (/^(\d)\1{10}$/.test(d)) return false;

  const digit = (upTo: number) => {
    let sum = 0;
    for (let i = 0; i < upTo; i++) {
      sum += Number(d[i]) * (upTo + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return digit(9) === Number(d[9]) && digit(10) === Number(d[10]);
}
