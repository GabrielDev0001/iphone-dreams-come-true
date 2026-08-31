import { PIX_KEY, PIX_MERCHANT_CITY, PIX_MERCHANT_NAME } from "@/lib/contact";

/**
 * Gerador de BR Code (Pix "copia e cola") conforme o manual do Banco Central.
 *
 * O payload é uma sequência de campos TLV — dois dígitos de ID, dois de
 * comprimento e o valor — fechada por um CRC16-CCITT. Um checksum errado faz o
 * app do banco recusar o código, então ele é calculado de verdade aqui.
 */

/** Monta um campo TLV: id + comprimento em 2 dígitos + valor. */
function campo(id: string, valor: string): string {
  return id + String(valor.length).padStart(2, "0") + valor;
}

/**
 * CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF) — o mesmo que o Banco
 * Central exige no campo 63 do BR Code.
 */
export function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Remove acentos e caracteres que o BR Code não aceita, e limita o tamanho. */
function limpar(valor: string, max: number): string {
  return valor
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()
    .slice(0, max);
}

/** O txid aceita apenas letras e números, com no máximo 25 caracteres. */
function txid(referencia: string): string {
  const limpo = referencia.replace(/[^A-Za-z0-9]/g, "").slice(0, 25);
  return limpo || "***";
}

/**
 * Monta o Pix copia e cola. Retorna `null` quando a chave ainda não foi
 * configurada — é melhor a tela avisar do que exibir um código inválido.
 */
export function pixPayload({
  amount,
  reference,
}: {
  amount: number;
  reference: string;
}): string | null {
  const chave = PIX_KEY.trim();
  if (!chave) return null;

  const merchantAccount = campo("00", "BR.GOV.BCB.PIX") + campo("01", chave);

  const semCrc =
    campo("00", "01") +
    campo("01", "11") + // código estático, ligado a uma chave fixa
    campo("26", merchantAccount) +
    campo("52", "0000") +
    campo("53", "986") +
    campo("54", amount.toFixed(2)) +
    campo("58", "BR") +
    campo("59", limpar(PIX_MERCHANT_NAME, 25)) +
    campo("60", limpar(PIX_MERCHANT_CITY, 15)) +
    campo("62", campo("05", txid(reference))) +
    "6304";

  return semCrc + crc16(semCrc);
}
