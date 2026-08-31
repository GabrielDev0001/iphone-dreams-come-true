import { useEffect, useState } from "react";
import { IphoneArt } from "@/components/IphoneArt";
import { photoFor, phoneShape, type PhoneColor, type PhoneModel } from "@/lib/iphones";

/**
 * Mostra a foto real do aparelho na cor escolhida. Enquanto a loja não tiver
 * a foto daquela combinação em `public/produtos/`, cai na ilustração vetorial —
 * assim a vitrine nunca fica com espaço vazio.
 */
export function PhonePhoto({
  model,
  color,
  className,
}: {
  model: PhoneModel;
  color: PhoneColor;
  className?: string;
}) {
  const src = photoFor(model, color);
  const [failed, setFailed] = useState(false);

  // Trocar de cor/modelo precisa dar nova chance à foto.
  useEffect(() => setFailed(false), [src]);

  if (failed) {
    return <IphoneArt color={color.hex} shape={phoneShape(model.name)} className={className} />;
  }

  return (
    <img
      src={src}
      alt={`${model.name} na cor ${color.name}`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-contain ${className ?? ""}`}
    />
  );
}
