import { useId } from "react";
import type { PhoneShape } from "@/lib/iphones";

function Lens({ cx, cy, r = 8 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#101215" stroke="rgba(255,255,255,.35)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={r * 0.55} fill="#2b3a4d" />
      <circle cx={cx - r * 0.25} cy={cy - r * 0.25} r={r * 0.18} fill="#dbe6f2" opacity=".8" />
    </g>
  );
}

/**
 * Ilustração vetorial do aparelho (vista traseira) pintada na cor escolhida —
 * evita depender de uma foto por modelo/cor.
 */
export function IphoneArt({
  color,
  shape,
  className,
}: {
  color: string;
  shape: PhoneShape;
  className?: string | undefined;
}) {
  const uid = useId().replace(/:/g, "");
  const gloss = `gloss-${uid}`;

  return (
    <svg viewBox="0 0 140 220" className={className} role="presentation">
      <defs>
        <linearGradient id={gloss} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity=".45" />
          <stop offset="45%" stopColor="#fff" stopOpacity=".05" />
          <stop offset="100%" stopColor="#000" stopOpacity=".12" />
        </linearGradient>
      </defs>

      <ellipse cx="70" cy="209" rx="42" ry="6" fill="#000" opacity=".12" />

      <rect x="27" y="10" width="86" height="192" rx="19" fill={color} />
      <rect x="27" y="10" width="86" height="192" rx="19" fill={`url(#${gloss})`} />
      <rect
        x="27.6"
        y="10.6"
        width="84.8"
        height="190.8"
        rx="18.4"
        fill="none"
        stroke="#000"
        strokeOpacity=".22"
        strokeWidth="1.2"
      />
      <rect
        x="30.5"
        y="13.5"
        width="79"
        height="185"
        rx="16"
        fill="none"
        stroke="#fff"
        strokeOpacity=".3"
      />

      {shape === "pro" && (
        <g>
          <rect x="35" y="19" width="52" height="52" rx="16" fill="#000" opacity=".08" />
          <rect
            x="35"
            y="19"
            width="52"
            height="52"
            rx="16"
            fill={color}
            stroke="#000"
            strokeOpacity=".2"
          />
          <Lens cx={50} cy={34} />
          <Lens cx={72} cy={34} />
          <Lens cx={50} cy={56} />
          <circle cx="72" cy="56" r="4" fill="#f6efd8" opacity=".9" />
        </g>
      )}

      {shape === "base" && (
        <g>
          <rect x="35" y="19" width="32" height="54" rx="16" fill="#000" opacity=".08" />
          <rect
            x="35"
            y="19"
            width="32"
            height="54"
            rx="16"
            fill={color}
            stroke="#000"
            strokeOpacity=".2"
          />
          <Lens cx={51} cy={34} r={9} />
          <Lens cx={51} cy={58} r={9} />
        </g>
      )}

      {shape === "air" && (
        <g>
          <rect x="27" y="17" width="86" height="28" rx="11" fill="#000" opacity=".07" />
          <rect
            x="27"
            y="17"
            width="86"
            height="28"
            rx="11"
            fill={color}
            stroke="#000"
            strokeOpacity=".18"
          />
          <Lens cx={45} cy={31} r={9} />
          <circle cx="66" cy="31" r="4" fill="#f6efd8" opacity=".9" />
        </g>
      )}
    </svg>
  );
}
