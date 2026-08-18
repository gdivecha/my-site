"use client";

import { useEffect, useState } from "react";
import { CheckIcon, CopyIcon } from "./icons";
import { ENTRANCE_MS, ICONS_DELAY_MS } from "@/lib/entrance-timing";

/** Copies the current page's URL — sits top-right on every page,
 * mirroring the utility icon row's top-left position (Sidebar.tsx),
 * so a recruiter forwarding a specific project/experience page (or
 * any page) has an obvious, one-click way to grab that exact link
 * rather than copying from the address bar. Same icon-swap-on-copy
 * language as CopyEmailButton on the Contact page.
 *
 * Entrance timing matches those left-side icons exactly (same
 * ICONS_DELAY_MS, same fade/slide) rather than just appearing
 * instantly on mount — this button and Sidebar both live in the
 * persistent (sections) layout, so both mount at the same moment on a
 * genuine first load and never remount on later tab switches, which
 * is what makes a plain mirrored setTimeout (not an elapsed-time
 * calculation like PageShell's, which has to account for mounting at
 * arbitrary points per-navigation) the correct match here. */
export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const timer = setTimeout(() => setVisible(true), ICONS_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (older browser, permissions, etc.) —
      // nothing reasonable to fall back to here, so this just no-ops
      // rather than pretending it worked.
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={copied ? "Link copied" : "Copy link to this page"}
      style={{ transitionDuration: `${ENTRANCE_MS}ms` }}
      className={`absolute right-8 top-8 z-20 flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-icon-btn text-ink-soft transition-all hover:bg-icon-btn-hover hover:text-ink md:right-12 md:top-10 lg:right-16 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <span className="relative flex h-4 w-4 items-center justify-center">
        <CopyIcon
          className={`absolute h-4 w-4 transition-all duration-200 ${
            copied ? "scale-50 opacity-0" : "scale-100 opacity-100"
          }`}
        />
        <CheckIcon
          className={`absolute h-4 w-4 transition-all duration-200 ${
            copied ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        />
      </span>
    </button>
  );
}
