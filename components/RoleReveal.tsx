"use client";

import { useEffect, useState } from "react";
import { profile } from "@/lib/data/profile";

type Phase = "first" | "second" | "both";

const HOLD_FIRST = 900;
const HOLD_SECOND = 900;
const WORD_FADE_MS = 400;
const BOTH_FADE_MS = 500;

/** Total wall-clock time from mount to fully settled — exported so callers
 * (Sidebar's entrance cascade) can chain the next thing to start exactly
 * when this finishes, instead of guessing at a fixed delay. Mirrors the
 * actual timeline below: the first word's fade-in happens inside the
 * HOLD_FIRST window, the second's inside HOLD_SECOND, then the final
 * "both" state fades in over BOTH_FADE_MS. */
export const ROLE_REVEAL_DURATION_MS = HOLD_FIRST + HOLD_SECOND + BOTH_FADE_MS;

/** Choreographed one-time reveal: the first role appears alone, is
 * replaced by the second role, then both settle into their final combined
 * display together. A one-time sequence, not a loop, so it never competes
 * for attention after the page has already loaded. Skips straight to the
 * combined display under prefers-reduced-motion. */
export function RoleReveal() {
  const [phase, setPhase] = useState<Phase>("first");
  const [wordEntered, setWordEntered] = useState(false);
  const [bothEntered, setBothEntered] = useState(false);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAnimate(false);
      setPhase("both");
      setBothEntered(true);
      return;
    }
    if (profile.roles.length < 2) {
      setPhase("both");
      requestAnimationFrame(() => setBothEntered(true));
      return;
    }

    let raf2: number;
    let raf3: number;
    let t2: ReturnType<typeof setTimeout>;

    const raf1 = requestAnimationFrame(() => setWordEntered(true));

    const t1 = setTimeout(() => {
      // First role is replaced by the second — no crossfade, just a clean
      // swap so the second role gets its own fresh entrance.
      setWordEntered(false);
      setPhase("second");
      raf2 = requestAnimationFrame(() => setWordEntered(true));

      t2 = setTimeout(() => {
        // Settle into the final combined display for good.
        setPhase("both");
        raf3 = requestAnimationFrame(() => setBothEntered(true));
      }, HOLD_SECOND);
    }, HOLD_FIRST);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      cancelAnimationFrame(raf3);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === "both") {
    return (
      <span>
        {profile.roles.map((role, i) => (
          <span key={role}>
            <span
              className={
                animate ? "inline-block transition-all ease-out" : "inline-block"
              }
              style={
                animate
                  ? {
                      transitionDuration: `${BOTH_FADE_MS}ms`,
                      opacity: bothEntered ? 1 : 0,
                      transform: bothEntered
                        ? "translateY(0) scale(1)"
                        : "translateY(6px) scale(0.94)",
                    }
                  : undefined
              }
            >
              {role}
            </span>
            {i < profile.roles.length - 1 && (
              <span
                className={
                  animate
                    ? "mx-2 inline-block text-ink-faint transition-opacity"
                    : "mx-2 inline-block text-ink-faint"
                }
                style={
                  animate
                    ? {
                        transitionDuration: `${BOTH_FADE_MS}ms`,
                        opacity: bothEntered ? 1 : 0,
                      }
                    : undefined
                }
              >
                •
              </span>
            )}
          </span>
        ))}
      </span>
    );
  }

  const word = phase === "first" ? profile.roles[0] : profile.roles[1];

  return (
    <span
      key={phase}
      className="inline-block transition-all ease-out"
      style={{
        transitionDuration: `${WORD_FADE_MS}ms`,
        opacity: wordEntered ? 1 : 0,
        transform: wordEntered
          ? "translateY(0) scale(1)"
          : "translateY(6px) scale(0.94)",
      }}
    >
      {word}
    </span>
  );
}
