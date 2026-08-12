"use client";

import { ArrowDownIcon } from "@/components/icons";

export function ScrollIndicator() {
  return (
    <button
      type="button"
      onClick={() =>
        window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" })
      }
      aria-label="Scroll down"
      className="flex h-12 w-12 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-accent/50 hover:text-accent"
    >
      <ArrowDownIcon className="h-5 w-5" />
    </button>
  );
}
