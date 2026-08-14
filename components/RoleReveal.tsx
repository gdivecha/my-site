"use client";

import { useEffect, useState } from "react";
import { profile } from "@/lib/data/profile";
import {
  ROLE_REVEAL_BOTH_FADE_MS as BOTH_FADE_MS,
  ROLE_REVEAL_HOLD_FIRST_MS as HOLD_FIRST,
  ROLE_REVEAL_HOLD_SECOND_MS as HOLD_SECOND,
  ROLE_REVEAL_WORD_FADE_MS as WORD_FADE_MS,
} from "@/lib/entrance-timing";

type Phase = "first" | "second" | "both";

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
