"use client";

import { useEffect, useState } from "react";

type Stat = { value: string; label: string };

// Long enough to actually read a number and its label, short enough that
// six stats don't feel like a wait — same "a few seconds" pacing brief
// this was built to.
const ROTATE_INTERVAL_MS = 2800;

export function StatsBar({ stats }: { stats: Stat[] }) {
  const [index, setIndex] = useState(0);
  // Starts false (matches the animated path) so server and client agree
  // on the first render — window/matchMedia don't exist during SSR, so
  // this can only be decided after mount, same pattern as every other
  // isMobile/reduced-motion check in this codebase.
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const update = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Auto-advance is exactly the kind of motion prefers-reduced-motion
  // exists for, and it's also unpausable/unstoppable content someone
  // would otherwise have no way to freeze — skipping it entirely (see the
  // static all-stats-at-once fallback below) rather than just cutting the
  // fade transition is the same call this codebase already makes for
  // DialNav's load-time nudge and RoleReveal.
  useEffect(() => {
    if (reducedMotion || stats.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % stats.length);
    }, ROTATE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [reducedMotion, stats.length]);

  return (
    <div className="mt-6 max-w-2xl overflow-hidden rounded-2xl border border-line bg-card-tint backdrop-blur-[6px]">
      {/* Desktop: the original full grid, unchanged. */}
      <div className="hidden flex-wrap divide-x divide-line md:flex">
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-[5.5rem] flex-1 px-4 py-4 text-center">
            <p className="font-display text-3xl font-bold tabular-nums text-accent-soft">
              {stat.value}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-wide text-ink-faint">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Mobile, reduced motion: same grid as desktop, just at the
          smaller sizing the old single responsive layout used — no
          auto-advancing content at all. */}
      {reducedMotion && (
        <div className="flex flex-wrap divide-x divide-line md:hidden">
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-[5.5rem] flex-1 px-2 py-4 text-center">
              <p className="font-display text-xl font-bold tabular-nums text-accent-soft">
                {stat.value}
              </p>
              <p className="mt-1 text-[9px] uppercase tracking-wide text-ink-faint">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Mobile, motion allowed: one stat at a time, auto-advancing —
          `key={index}` forces React to remount the text block on every
          switch, which is what actually restarts the CSS animation each
          time (a class staying constant across renders never replays
          its animation on its own). Dot indicators are purely a position
          cue (aria-hidden) — the stat's own text is what a screen reader
          announces via the live region below. */}
      {!reducedMotion && (
        <div className="flex flex-col items-center gap-4 px-4 py-7 md:hidden">
          {/* text-6xl, not the grid's own text-3xl — a full-width card
              showing one short number/word at a time reads as mostly
              empty margin at that smaller size (confirmed: it visibly
              looked like dead space on either side). A much bigger
              number is what actually gives a single stat enough presence
              to justify the card's own width, rather than shrinking the
              card down to fit a small piece of text. */}
          <div
            key={index}
            className="text-center [animation:role-reveal-fade_0.4s_ease-out]"
            aria-live="polite"
          >
            <p className="font-display text-6xl font-bold tabular-nums text-accent-soft">
              {stats[index].value}
            </p>
            <p className="mt-2 text-sm uppercase tracking-wide text-ink-faint">
              {stats[index].label}
            </p>
          </div>
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {stats.map((stat, i) => (
              <span
                key={stat.label}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-4 bg-accent-soft" : "w-1.5 bg-ink-faint/40"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
