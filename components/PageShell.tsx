import type { ReactNode } from "react";
import { DecorShapes } from "./DecorShapes";
import { Watermark } from "./Watermark";

export function PageShell({
  variant = "default",
  watermark,
  children,
}: {
  variant?: string;
  watermark: string;
  children: ReactNode;
}) {
  return (
    <div className="relative isolate min-h-screen overflow-hidden px-6 py-12 sm:px-10 md:px-16 md:py-16">
      <DecorShapes variant={variant} />
      <Watermark text={watermark} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
