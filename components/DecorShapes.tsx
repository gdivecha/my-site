type Shape = {
  kind: "circle" | "square" | "triangle" | "venn";
  top: string;
  left: string;
  size: number;
  rotate?: number;
  opacity?: number;
  accent?: boolean;
};

const VARIANTS: Record<string, Shape[]> = {
  about: [
    { kind: "circle", top: "8%", left: "62%", size: 120, opacity: 0.1 },
    { kind: "triangle", top: "70%", left: "8%", size: 90, rotate: 12, opacity: 0.08 },
    { kind: "square", top: "20%", left: "12%", size: 60, rotate: -8, opacity: 0.07 },
  ],
  skills: [
    { kind: "venn", top: "12%", left: "70%", size: 140, opacity: 0.09, accent: true },
    { kind: "square", top: "75%", left: "18%", size: 70, rotate: 18, opacity: 0.08 },
  ],
  experience: [
    { kind: "circle", top: "18%", left: "8%", size: 100, opacity: 0.08 },
    { kind: "triangle", top: "68%", left: "72%", size: 110, rotate: -14, opacity: 0.09 },
  ],
  projects: [
    { kind: "square", top: "10%", left: "16%", size: 80, rotate: 22, opacity: 0.08 },
    { kind: "circle", top: "72%", left: "68%", size: 130, opacity: 0.1, accent: true },
  ],
  portfolio: [
    { kind: "triangle", top: "14%", left: "74%", size: 90, rotate: 8, opacity: 0.08 },
    { kind: "circle", top: "78%", left: "10%", size: 70, opacity: 0.07 },
  ],
  recommendations: [
    { kind: "venn", top: "10%", left: "10%", size: 120, opacity: 0.09, accent: true },
    { kind: "square", top: "70%", left: "76%", size: 60, rotate: -12, opacity: 0.08 },
  ],
  contact: [
    { kind: "circle", top: "14%", left: "16%", size: 90, opacity: 0.08, accent: true },
    { kind: "triangle", top: "72%", left: "70%", size: 100, rotate: 10, opacity: 0.08 },
  ],
  default: [
    { kind: "circle", top: "16%", left: "72%", size: 110, opacity: 0.08 },
    { kind: "square", top: "72%", left: "12%", size: 70, rotate: 14, opacity: 0.07 },
  ],
};

function ShapeSvg({ shape }: { shape: Shape }) {
  const stroke = shape.accent ? "var(--color-accent)" : "var(--color-ink-faint)";
  const common = { stroke, strokeWidth: 1.4, fill: "none" as const };

  if (shape.kind === "circle") {
    return (
      <svg width={shape.size} height={shape.size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" {...common} />
      </svg>
    );
  }
  if (shape.kind === "square") {
    return (
      <svg width={shape.size} height={shape.size} viewBox="0 0 100 100">
        <rect x="6" y="6" width="88" height="88" rx="12" {...common} />
      </svg>
    );
  }
  if (shape.kind === "triangle") {
    return (
      <svg width={shape.size} height={shape.size} viewBox="0 0 100 100">
        <path d="M50 8 L92 88 L8 88 Z" strokeLinejoin="round" {...common} />
      </svg>
    );
  }
  return (
    <svg width={shape.size} height={shape.size * 0.62} viewBox="0 0 100 62">
      <circle cx="38" cy="31" r="28" {...common} />
      <circle cx="62" cy="31" r="28" {...common} />
    </svg>
  );
}

export function DecorShapes({ variant = "default" }: { variant?: string }) {
  const shapes = VARIANTS[variant] ?? VARIANTS.default;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {shapes.map((shape, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: shape.top,
            left: shape.left,
            transform: `rotate(${shape.rotate ?? 0}deg)`,
            opacity: shape.opacity ?? 0.08,
          }}
        >
          <ShapeSvg shape={shape} />
        </div>
      ))}
    </div>
  );
}
