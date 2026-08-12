import type { ReactNode } from "react";
import { Watermark } from "./Watermark";

export function PageShell({
  watermark,
  children,
}: {
  watermark: string;
  children: ReactNode;
}) {
  return (
    <div
      className="relative isolate min-h-screen overflow-hidden px-6 pb-12 sm:px-10 md:px-16 md:pb-16"
      style={{ paddingTop: "var(--sidebar-title-top, 3rem)" }}
    >
      <Watermark text={watermark} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
