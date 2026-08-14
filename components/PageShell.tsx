"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Watermark } from "./Watermark";
import { APP_LOADED_AT } from "@/lib/app-load-time";
import { ENTRANCE_MS, SIDEBAR_CASCADE_DONE_MS } from "@/lib/entrance-timing";

export function PageShell({
  watermark,
  children,
}: {
  watermark: string;
  children: ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  // Only a genuine first-load wait (before the sidebar's own cascade has
  // finished) gets the slow cinematic fade. Every ordinary navigation
  // after that gets an instant reveal (0ms) — the actual bug wasn't a
  // backdrop-filter rendering delay at all: the CSS transition duration
  // was hardcoded to ENTRANCE_MS (500ms) for every single page switch,
  // not just the first, so cards (translucent tint + blur together)
  // visibly ramped up from invisible on every tab change. That ramp is
  // what read as "the blur has a delay" — confirmed by extracting actual
  // video frames of a switch: the card is already fully opaque and
  // blurred by the second frame (~33ms in), it's just that the preceding
  // 500ms transition made getting there visibly gradual.
  const [durationMs, setDurationMs] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const remaining = Math.max(
      0,
      SIDEBAR_CASCADE_DONE_MS - (Date.now() - APP_LOADED_AT)
    );
    setDurationMs(remaining > 0 ? ENTRANCE_MS : 0);
    const timer = setTimeout(() => setVisible(true), remaining);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="relative isolate min-h-screen overflow-hidden px-6 pb-12 sm:px-10 md:px-16 md:pb-16"
      style={{ paddingTop: "var(--sidebar-title-top, 3rem)" }}
    >
      <div
        className={`transition-opacity ease-out ${visible ? "opacity-100" : "opacity-0"}`}
        style={{ transitionDuration: `${durationMs > 0 ? 150 : 0}ms` }}
      >
        <Watermark text={watermark} />
      </div>
      <div
        className={`relative z-10 transition-all ease-out ${
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
        style={{ transitionDuration: `${durationMs}ms` }}
      >
        {children}
      </div>
    </div>
  );
}
