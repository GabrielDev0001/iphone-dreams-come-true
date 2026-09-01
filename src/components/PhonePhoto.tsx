import { photoFor, type PhoneColor, type PhoneModel } from "@/lib/iphones";

/**
 * Foto do aparelho. É uma foto por modelo — a mesma em todas as cores, já que a
 * loja só tem a variante escura fotografada. A ilustração vetorial não é mais
 * usada aqui; para voltar a ter foto por cor, ver `public/produtos/README.md`.
 */
export function PhonePhoto({
  model,
  color,
  className,
}: {
  model: PhoneModel;
  color: PhoneColor;
  className?: string | undefined;
}) {
  return (
    <img
      src={photoFor(model)}
      alt={`${model.name} na cor ${color.name}`}
      loading="lazy"
      decoding="async"
      className={`object-contain ${className ?? ""}`}
    />
  );
}
