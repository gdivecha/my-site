export function StubSection({
  eyebrow,
  heading,
  body,
}: {
  eyebrow: string;
  heading: string;
  body: string;
}) {
  return (
    <>
      <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-4xl font-bold text-ink sm:text-5xl">
        {heading}
      </h2>

      <div className="mt-8 max-w-lg rounded-2xl border border-dashed border-line bg-panel/60 p-10">
        <p className="text-sm leading-relaxed text-ink-soft">{body}</p>
        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-ink-faint">
          Real content to follow
        </p>
      </div>
    </>
  );
}
