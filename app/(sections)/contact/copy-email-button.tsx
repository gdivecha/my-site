"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon, MailIcon } from "@/components/icons";

export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (older browser, permissions, etc.) —
      // fall back to a plain mailto so the button is never a dead end.
      window.location.href = `mailto:${email}`;
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      // Styled like a copyable snippet (a divider before the action
      // glyph) rather than a plain pill button — a familiar "click to
      // copy" pattern from developer tools — but in the site's normal
      // typeface, not monospace, to stay consistent with everything else.
      className={`group mt-5 inline-flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-all duration-200 ${
        copied
          ? "border-accent/50 bg-accent/10 text-accent-soft"
          : "border-line bg-input-bg text-ink hover:border-accent/40"
      }`}
    >
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
        <MailIcon
          className={`absolute h-4 w-4 text-accent-soft transition-all duration-200 ${
            copied ? "scale-50 opacity-0" : "scale-100 opacity-100"
          }`}
        />
        <CheckIcon
          className={`absolute h-4 w-4 transition-all duration-200 ${
            copied ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        />
      </span>
      {copied ? "Copied to clipboard!" : email}
      {!copied && (
        <>
          <span className="h-4 w-px shrink-0 bg-line" aria-hidden="true" />
          {/* Always visible, not hover-gated — the gentle idle bob is
              what signals "clickable" without anyone needing to find it
              first. motion-reduce: disables the loop but leaves the icon
              itself (and the hint it gives) in place. */}
          <CopyIcon className="h-3.5 w-3.5 shrink-0 text-accent-soft [animation:copy-hint-bob_2.4s_ease-in-out_infinite] motion-reduce:[animation:none] group-hover:text-accent" />
        </>
      )}
    </button>
  );
}
