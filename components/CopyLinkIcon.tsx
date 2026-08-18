"use client";

import { useState, type CSSProperties } from "react";
import { CheckIcon, CopyIcon } from "./icons";

/** Copies a link to the site's home page. Lives in the sidebar's
 * utility icon row (search/sound/theme/shortcuts) — same boxed
 * icon-button styling as its neighbors there (ThemeToggle/SoundToggle),
 * and takes the same className/style props so it drops straight into
 * that row's shared map/entrance-animation. Last in the row: it's a
 * sharing action, not a page-navigation or display-preference one like
 * the others, so it reads as the "extra" utility rather than being
 * mixed in among them. */
export function CopyLinkIcon({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/home`);
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
      aria-label={copied ? "Link copied" : "Copy link to this site"}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-icon-btn text-ink-soft transition-colors hover:bg-icon-btn-hover hover:text-ink ${className}`}
      style={style}
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
