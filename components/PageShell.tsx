"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Watermark } from "./Watermark";
import { APP_LOADED_AT } from "@/lib/app-load-time";
import {
  ENTRANCE_MS,
  REASONABLE_LOAD_WAIT_MS,
  SIDEBAR_CASCADE_DONE_MS,
} from "@/lib/entrance-timing";
import { notifyPageReady } from "@/lib/page-ready";

/** Must match .watermark-plane--bright's animation-duration in
 * globals.css — used to let an in-progress sweep finish its current
 * cycle rather than cutting off mid-sweep once the page is actually
 * ready (see below). */
const WAVE_CYCLE_MS = 6000;

export function PageShell({
  watermark,
  children,
  simulateDelayMs,
}: {
  watermark: string;
  children: ReactNode;
  /** Adds an artificial delay on top of the normal reveal timing —
   * exists purely so /loading-demo can make a page genuinely, honestly
   * slow to load (not a re-implemented mockup) and let DialNav's real
   * lock and this component's real shimmer both react to it for real.
   * No real page passes this. */
  simulateDelayMs?: number;
}) {
  // Deliberately two separate states, not one: the watermark itself
  // must always appear at or before the content, never after — so its
  // own timing (watermarkVisible) only ever reflects the entrance
  // choreography's own base wait, while contentVisible additionally
  // waits on simulateDelayMs. On ordinary navigation the base wait is
  // already ~0, so in practice the watermark shows right when a tab is
  // selected; only a genuinely slow page's *content* lags behind it.
  const [watermarkVisible, setWatermarkVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [waving, setWaving] = useState(false);
  // Timestamp the shimmer actually started at, so its release can be
  // aligned to a genuine loop boundary instead of an arbitrary moment
  // mid-sweep — null whenever it isn't showing.
  const waveStartedAt = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setWatermarkVisible(true);
      setContentVisible(true);
      notifyPageReady();
      return;
    }

    // How long until the watermark itself appears — the sidebar's own
    // entrance cascade on a genuine first load, ~0 on ordinary
    // navigation (real elapsed time already exceeds it by then), and
    // never anything more than that: this is the one timer
    // simulateDelayMs deliberately does NOT touch.
    const baseRemaining = Math.max(
      0,
      SIDEBAR_CASCADE_DONE_MS - (Date.now() - APP_LOADED_AT)
    );
    // How long until the actual *content* is ready — same base wait,
    // plus whatever this specific page adds on top.
    const contentRemaining = baseRemaining + (simulateDelayMs ?? 0);

    const watermarkTimer = setTimeout(
      () => setWatermarkVisible(true),
      baseRemaining
    );

    // The shimmer only actually shows if content is still not ready
    // REASONABLE_LOAD_WAIT_MS after the watermark itself appeared — a
    // normal load resolves long before this fires and it never appears
    // at all.
    const waveStartTimer = setTimeout(() => {
      waveStartedAt.current = performance.now();
      setWaving(true);
    }, baseRemaining + REASONABLE_LOAD_WAIT_MS);

    let waveEndTimer: ReturnType<typeof setTimeout> | null = null;
    const contentTimer = setTimeout(() => {
      setContentVisible(true);
      // The one real "this page is ready" signal — DialNav's own lock
      // waits on this instead of guessing from paint timing.
      notifyPageReady();
      if (waveStartedAt.current === null) {
        // Shimmer never started — nothing to finish, just cancel its
        // timer so it doesn't fire after we're already done.
        clearTimeout(waveStartTimer);
        return;
      }
      // Shimmer is already mid-sweep: let it complete its current loop
      // rather than snapping off, so it settles back to normal at the
      // same point it would seamlessly repeat anyway.
      const elapsed = performance.now() - waveStartedAt.current;
      const remainder = WAVE_CYCLE_MS - (elapsed % WAVE_CYCLE_MS);
      waveEndTimer = setTimeout(() => {
        setWaving(false);
        waveStartedAt.current = null;
      }, remainder);
    }, contentRemaining);

    return () => {
      clearTimeout(watermarkTimer);
      clearTimeout(waveStartTimer);
      clearTimeout(contentTimer);
      if (waveEndTimer) clearTimeout(waveEndTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="relative isolate min-h-screen overflow-hidden px-6 pb-12 sm:px-10 md:px-16 md:pb-16"
      style={{ paddingTop: "var(--sidebar-title-top, 3rem)" }}
    >
      <div
        className={`transition-opacity ease-out ${watermarkVisible ? "opacity-100" : "opacity-0"}`}
        style={{ transitionDuration: `${ENTRANCE_MS}ms` }}
      >
        <Watermark text={watermark} waving={waving} />
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
          painted at all until `contentVisible` flips, at which point
          the transform transition animates normally from its earlier,
          already-rendered translate-y-2 starting position. */}
      <div
        className={`relative z-10 transition-transform ease-out ${
          contentVisible ? "translate-y-0" : "translate-y-2 invisible"
        }`}
        style={{ transitionDuration: `${ENTRANCE_MS}ms` }}
      >
        {children}
      </div>
    </div>
  );
}
