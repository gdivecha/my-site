import type { ReactNode } from "react";

export function Pill({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-card-tint px-3.5 py-1.5 text-xs text-ink-soft backdrop-blur-[6px]">
      {icon}
      {children}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-tag-bg px-3 py-1 text-xs font-medium tracking-wide text-accent-soft">
      {children}
    </span>
  );
}
