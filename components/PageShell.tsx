"use client";

import { useEffect, useState, type ReactNode } from "react";
import { SIDEBAR_CASCADE_DONE_MS } from "./Sidebar";
import { Watermark } from "./Watermark";
import { APP_LOADED_AT } from "@/lib/app-load-time";
import { ENTRANCE_MS } from "@/lib/entrance-timing";

export function PageShell({
  watermark,
  children,
}: {
  watermark: string;
  children: ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  // Waits for the sidebar's own entrance cascade to finish before revealing
  // page content, so the two don't compete for attention — the dial's own
  // load-time nudge, in turn, waits for *this* to finish (see Sidebar's
  // DIAL_NUDGE_DELAY_MS). This part only matters on the very first page
  // load of a session — PageShell remounts on every navigation, but
  // APP_LOADED_AT is fixed at module-load time, so on later navigations
  // the remaining wait is already 0 and content shows immediately. The
  // watermark below, by contrast, is gated on `visible` itself (not
  // APP_LOADED_AT), so it fades in alongside content on *every* page open,
  // not just the first.
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
      {/* Fades in alongside content, on every page open (not just the
          first) — gated on `visible` itself rather than the session-wide
          APP_LOADED_AT timer above, so it re-plays for each tab. */}
      <div
        className={`transition-opacity ease-out ${visible ? "opacity-100" : "opacity-0"}`}
        style={{ transitionDuration: `${ENTRANCE_MS}ms` }}
      >
        <Watermark text={watermark} />
      </div>
      <div
        className={`relative z-10 transition-all ease-out ${
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
        style={{ transitionDuration: `${ENTRANCE_MS}ms` }}
      >
        {children}
      </div>
    </div>
  );
}
