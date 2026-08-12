import { PageHeading } from "./PageHeading";

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
      <PageHeading eyebrow={eyebrow}>{heading}</PageHeading>

      <div className="mt-8 max-w-lg rounded-2xl border border-dashed border-line bg-panel/60 p-10">
        <p className="text-sm leading-relaxed text-ink-soft">{body}</p>
        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-ink-faint">
          Real content to follow
        </p>
      </div>
    </>
  );
}
