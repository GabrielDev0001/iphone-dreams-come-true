/** Canais oficiais da loja — usados no header, no rodapé e nos CTAs. */
export const INSTAGRAM_HANDLE = "@gorillaphonebh";
export const INSTAGRAM_URL = "https://www.instagram.com/gorillaphonebh/";
export const WHATSAPP_URL = "https://wa.me/message/SRFGDFFUSSFRE1";

/** Dados da loja exibidos no cabeçalho e no rodapé. */
export const CNPJ = "66.842.793/0001-02";
export const ENDERECO = "Av. Raja Gabaglia, 2708 — Estoril";

/**
 * Chave Pix que recebe a taxa de análise (chave aleatória / EVP).
 *
 * Se ficar vazia, a tela de pagamento avisa que o Pix não está configurado em
 * vez de mostrar um código que não funciona.
 */
export const PIX_KEY = "4ea4e165-3b3c-41b7-8c25-f8d9ff3a8651";

/**
 * Titular da conta que recebe, como aparece no app do banco do cliente.
 *
 * Atenção: é diferente do nome da loja. Quem paga vê "MENDES INTERMEDIACOES",
 * não "Gorillaphonebh" — por isso a tela de pagamento mostra o recebedor de
 * forma explícita, para o cliente não achar que errou o destino.
 */
export const PIX_MERCHANT_NAME = "MENDES INTERMEDIACOES";
export const PIX_MERCHANT_CITY = "SAO PAULO";
