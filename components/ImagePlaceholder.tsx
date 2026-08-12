export function ImagePlaceholder({
  label,
  className = "",
  bare = false,
}: {
  label: string;
  className?: string;
  /** Omit the rounded corners + border (e.g. when it sits flush at the top of a card). */
  bare?: boolean;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-panel-alt ${
        bare ? "" : "rounded-xl border border-line"
      } ${className}`}
    >
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, var(--color-accent) 0, var(--color-accent) 1px, transparent 1px, transparent 14px)",
        }}
      />
      <span className="relative px-4 text-center text-[11px] font-medium uppercase tracking-widest text-ink-faint">
        {label}
      </span>
    </div>
  );
}
