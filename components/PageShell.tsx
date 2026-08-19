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
const WAVE_CYCLE_MS = 5000;

export function PageShell({
  watermark,
  children,
  ready = true,
}: {
  watermark: string;
  children: ReactNode;
  /** Set this false while a page has real async work in flight that its
   * content genuinely depends on (a client-side fetch, etc.), then flip
   * it true once that resolves — DialNav's real lock and this
   * component's real shimmer react to it exactly like they'd react to
   * any other genuinely slow load. Defaults to true: every page's
   * content today is already resolved by the time this mounts, so by
   * default content follows the same base entrance schedule it always
   * has. */
  ready?: boolean;
}) {
  // Deliberately two separate states, not one: the watermark itself
  // must always appear at or before the content, never after — so its
  // own timing (watermarkVisible) only ever reflects the entrance
  // choreography's own base wait, while contentVisible additionally
  // waits on `ready`. On ordinary navigation the base wait is already
  // ~0, so in practice the watermark shows right when a tab is
  // selected; only a genuinely slow page's *content* lags behind it.
  const [watermarkVisible, setWatermarkVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [waving, setWaving] = useState(false);
  // Timestamp the shimmer actually started at, so its release can be
  // aligned to a genuine loop boundary instead of an arbitrary moment
  // mid-sweep — null whenever it isn't showing. Lives across renders of
  // the effect below (not reset when `ready` flips), since the
  // ready-again run needs to know how long ago the not-ready run armed
  // it in order to compute that same remainder.
  const waveStartedAt = useRef<number | null>(null);

  // The watermark's own reveal — the sidebar's entrance cascade on a
  // genuine first load, ~0 on ordinary navigation. Independent of
  // `ready`: this is the one timer a slow page's content deliberately
  // does NOT get to push out further.
  //
  // Also gated on document.fonts.ready, not just the timer: the
  // watermark's font (Poppins, weight 300) is already preloaded at max
  // priority, so in the overwhelming majority of loads it's long done by
  // the time baseRemaining elapses and this resolves on the very next
  // microtask — no perceptible change. It only actually waits longer on
  // a genuinely cold fetch (e.g. a brand-new domain's very first request,
  // nothing cached anywhere yet), which is exactly the case where the
  // fixed timer alone isn't a reliable guarantee — this way the watermark
  // can never paint in a mismatched fallback font, on any connection.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setWatermarkVisible(true);
      return;
    }
    const baseRemaining = Math.max(
      0,
      SIDEBAR_CASCADE_DONE_MS - (Date.now() - APP_LOADED_AT)
    );
    let cancelled = false;
    const timer = setTimeout(() => {
      document.fonts.ready.then(() => {
        if (!cancelled) setWatermarkVisible(true);
      });
    }, baseRemaining);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // A second, independent trigger for the exact same shimmer — plays
  // once, for one full sweep, on every ordinary page mount (i.e. every
  // tab change, since PageShell itself remounts per route) rather than
  // only during a genuine loading stall. The `ready`-driven effect
  // below is untouched by this; the two are deliberately not
  // coordinated with each other, since no page passes ready={false}
  // today, so only one of them ever actually fires in practice.
  //
  // Starts at the same instant the watermark itself begins fading in
  // (baseRemaining), not once that fade has finished — deliberately
  // overlapping the two rather than sequencing them. On a tab change
  // baseRemaining is already ~0, so this was barely noticeable there.
  // On a genuine cold page load, baseRemaining is the sidebar's own
  // multi-second staggered cascade (name, roles, tagline, nav,
  // socials) — waiting for that to *fully* finish, plus the watermark's
  // own fade on top, meant the shimmer only ever appeared once the
  // entire page had already gone still, reading as its own separate,
  // unexplained event rather than part of the same entrance. Starting
  // it alongside the watermark's fade instead folds it into that same
  // burst of motion, the same way it already reads on a tab change.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const baseRemaining = Math.max(
      0,
      SIDEBAR_CASCADE_DONE_MS - (Date.now() - APP_LOADED_AT)
    );
    let endTimer: ReturnType<typeof setTimeout> | null = null;
    const startTimer = setTimeout(() => {
      setWaving(true);
      endTimer = setTimeout(() => setWaving(false), WAVE_CYCLE_MS);
    }, baseRemaining);
    return () => {
      clearTimeout(startTimer);
      if (endTimer) clearTimeout(endTimer);
    };
  }, []);

  // Content readiness — reruns whenever `ready` itself changes, so a
  // real async resolution (not just mount) can drive this.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setContentVisible(true);
      notifyPageReady();
      return;
    }

    const baseRemaining = Math.max(
      0,
      SIDEBAR_CASCADE_DONE_MS - (Date.now() - APP_LOADED_AT)
    );

    if (!ready) {
      // Not ready yet: the shimmer only actually shows if content is
      // still not ready REASONABLE_LOAD_WAIT_MS after the watermark
      // itself appeared — a normal load resolves (ready flips true)
      // long before this fires and it never appears at all.
      const waveStartTimer = setTimeout(() => {
        waveStartedAt.current = performance.now();
        setWaving(true);
      }, baseRemaining + REASONABLE_LOAD_WAIT_MS);
      return () => clearTimeout(waveStartTimer);
    }

    // Ready: reveal content once the base entrance wait has elapsed —
    // ~immediately if `ready` only just turned true after that wait
    // already passed, since baseRemaining recomputes fresh above.
    let waveEndTimer: ReturnType<typeof setTimeout> | null = null;
    const contentTimer = setTimeout(() => {
      setContentVisible(true);
      // The one real "this page is ready" signal — DialNav's own lock
      // waits on this instead of guessing from paint timing.
      notifyPageReady();
      if (waveStartedAt.current === null) {
        // Shimmer never started — nothing to finish.
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
    }, baseRemaining);

    return () => {
      clearTimeout(contentTimer);
      if (waveEndTimer) clearTimeout(waveEndTimer);
    };
  }, [ready]);

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
        data-page-content
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
