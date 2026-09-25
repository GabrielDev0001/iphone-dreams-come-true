/**
 * Checkout da Cakto para a taxa de análise.
 *
 * Cada pedido do site ganha um token aleatório que vai no link como
 * `?callback=`. A Cakto grava esse valor no pedido e devolve no webhook — é
 * assim que o servidor sabe qual cliente pagou, sem depender de nome ou CPF.
 */
export const CAKTO_CHECKOUT_URL = "https://pay.cakto.com.br/k4n9a2c_1139636";

/** Token opaco do pagamento. A Cakto aceita letras, números e `. _ ~ -`. */
export function novoTokenPagamento(): string {
  return crypto.randomUUID();
}

export function linkCheckoutCakto(token: string): string {
  const url = new URL(CAKTO_CHECKOUT_URL);
  url.searchParams.set("callback", token);
  return url.toString();
}

/** Status do pedido como a Cakto informa (`paid`, `waiting_payment`, `refunded`...). */
export type StatusPagamento = { status: string; refId: string | null } | null;
