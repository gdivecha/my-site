import type { ReactNode } from "react";

export function Pill({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-3.5 py-1.5 text-xs text-ink-soft">
      {icon}
      {children}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-panel-alt px-3 py-1 text-[11px] font-medium tracking-wide text-accent-soft">
      {children}
    </span>
  );
}
