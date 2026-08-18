"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";

/** Pulls itself up by its own height (plus a fixed 24px gap) via a
 * negative margin-top, the same trick PageHeading's own invisible
 * eyebrow uses to keep the heading directly under it landing exactly at
 * the top of PageShell's padded box. PageHeading's "heading bottom =
 * sidebar name bottom" math assumes nothing with real height precedes
 * the eyebrow+heading pair — without this, this visible back-link's own
 * height silently pushed the heading that many pixels too low. */
export function ProjectBackLink() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const height = el.getBoundingClientRect().height;
    el.style.marginTop = `-${height + 24}px`;
  }, []);

  return (
    <div ref={ref} style={{ marginBottom: "24px" }}>
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-xs text-ink-faint transition-colors hover:text-ink-soft"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Projects
      </Link>
    </div>
  );
}
