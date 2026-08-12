export function Watermark({ text }: { text: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      <span className="watermark">{text}</span>
    </div>
  );
}
