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
      // gap/padding/text all tighten on the smallest screens specifically
      // (not just an even scale-down) — the icons and divider are fixed-
      // size chrome around the email text, so on a narrow phone they were
      // what pushed a perfectly reasonable-length address past one line
      // and into an awkward mid-word break (see the email span's
      // break-all below). Unchanged from sm: up, where there's already
      // enough room.
      className={`group mt-5 inline-flex max-w-full items-center gap-1 rounded-lg border px-3 py-2.5 text-xs transition-all duration-200 sm:gap-3 sm:px-4 sm:text-sm ${
        copied
          ? "border-accent/50 bg-accent/10 text-accent-soft"
          : "border-line bg-input-bg text-ink hover:border-accent/40"
      }`}
    >
      <span className="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center sm:h-4 sm:w-4">
        <MailIcon
          className={`absolute h-3.5 w-3.5 text-accent-soft transition-all duration-200 sm:h-4 sm:w-4 ${
            copied ? "scale-50 opacity-0" : "scale-100 opacity-100"
          }`}
        />
        <CheckIcon
          className={`absolute h-3.5 w-3.5 transition-all duration-200 sm:h-4 sm:w-4 ${
            copied ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        />
      </span>
      {/* break-all, not the default nowrap an unbroken string like an
          email address would otherwise get inside a flex child — on a
          narrow phone the button's other content (icon, divider, copy
          glyph) plus this in one unbreakable line is wider than the
          viewport itself. */}
      <span className="break-all">
        {copied ? "Copied to clipboard!" : email}
      </span>
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
