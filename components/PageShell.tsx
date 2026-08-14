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
  // Every page mount plays the entrance — on a genuine first load, this
  // wait is what makes content appear only once the sidebar's own
  // cascade has finished; on ordinary navigation (real elapsed time
  // already exceeds SIDEBAR_CASCADE_DONE_MS), `remaining` resolves to 0,
  // so the timer fires next tick and the animation plays immediately —
  // still a real slide-in, just with no artificial extra wait in front
  // of it.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const remaining = Math.max(
      0,
      SIDEBAR_CASCADE_DONE_MS - (Date.now() - APP_LOADED_AT)
    );
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
        style={{ transitionDuration: `${ENTRANCE_MS}ms` }}
      >
        <Watermark text={watermark} />
      </div>
      {/* Slides up via transform only — deliberately never opacity.
          Practically every card on every page uses backdrop-blur, and
          animating the OPACITY of an ancestor of a backdrop-filter
          element is a real Chromium rendering limitation: the blur can't
          correctly sample what's behind it while this wrapper is mid
          cross-fade, so cards render as plain unblurred text (watermark
          clearly readable through them) for the whole transition.
          Confirmed by extracting actual video frames of a hard reload.
          A pure transform doesn't have this problem — it repositions an
          already fully-rendered, already-blurred layer rather than
          blending two paint passes — so the slide is safe to keep.
          `invisible` (not opacity) hides it pre-reveal so it isn't
          painted at all until `visible` flips, at which point the
          transform transition animates normally from its earlier,
          already-rendered translate-y-2 starting position. */}
      <div
        className={`relative z-10 transition-transform ease-out ${
          visible ? "translate-y-0" : "translate-y-2 invisible"
        }`}
        style={{ transitionDuration: `${ENTRANCE_MS}ms` }}
      >
        {children}
      </div>
    </div>
  );
}
