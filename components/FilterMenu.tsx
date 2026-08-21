"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";

export type FilterMenuOption<T extends string> = {
  id: T;
  label: string;
  count?: number;
};

/** Collapses a row of filter pills into one tappable control on mobile —
 * the pills themselves (see each page's own `hidden md:flex` row) stay
 * the real desktop UI; this is a same-data alternative for a viewport
 * too narrow to show every option at once without wrapping across
 * several lines. Desktop never renders this (the component's own root is
 * `md:hidden`) so nothing here touches desktop layout. */
export function FilterMenu<T extends string>({
  options,
  activeId,
  onSelect,
  label,
  className = "",
}: {
  options: readonly FilterMenuOption<T>[];
  activeId: T;
  onSelect: (id: T) => void;
  /** Accessible name for the trigger button, e.g. "Filter by category". */
  label: string;
  /** Extra classes merged onto the root (e.g. `order-*` for callers that
   * reorder it relative to a sibling control). */
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = options.find((o) => o.id === activeId) ?? options[0];

  // Closes on an outside click/tap or Escape — the same dismissal model
  // as any other transient popover on this site (SearchModal,
  // KeyboardShortcuts), so it doesn't linger open once someone's
  // attention has clearly moved elsewhere.
  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative md:hidden ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium tracking-wide transition-colors ${
          open
            ? "border-accent/50 bg-accent text-white"
            : "border-line bg-panel text-ink-soft hover:text-ink"
        }`}
      >
        {active.label}
        {active.count !== undefined && (
          <sup className="text-[11px] font-semibold">{active.count}</sup>
        )}
        <ChevronDownIcon
          className={`h-3 w-3 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute right-0 top-full z-20 mt-2 min-w-[10rem] overflow-hidden rounded-xl border border-line bg-panel py-1 shadow-lg"
        >
          {options.map((option) => {
            const isActive = option.id === activeId;
            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  onSelect(option.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left text-xs font-medium tracking-wide transition-colors ${
                  isActive
                    ? "bg-accent/15 text-accent-soft"
                    : "text-ink-faint hover:bg-panel-alt hover:text-ink"
                }`}
              >
                {option.label}
                {option.count !== undefined && (
                  <sup className="text-[11px] font-semibold">{option.count}</sup>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
