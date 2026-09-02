import { WHATSAPP_NUMERO, WHATSAPP_URL } from "@/lib/contact";

/**
 * Link de conversa com a mensagem já preenchida.
 *
 * Com o número configurado usamos o formato oficial `wa.me/<numero>?text=`.
 * Sem ele sobra o link curto da loja: ele até costuma aceitar `?text=`, mas isso
 * não é documentado pelo WhatsApp — preencher `WHATSAPP_NUMERO` é o caminho
 * confiável para o cliente chegar com os dados prontos na conversa.
 */
export function linkWhatsapp(mensagem: string): string {
  const texto = encodeURIComponent(mensagem);
  const numero = WHATSAPP_NUMERO.replace(/\D/g, "");
  return numero ? `https://wa.me/${numero}?text=${texto}` : `${WHATSAPP_URL}?text=${texto}`;
}
