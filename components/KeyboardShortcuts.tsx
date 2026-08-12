"use client";

import { useEffect, useState } from "react";
import { CloseIcon } from "./icons";

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["⌘", "↑"], label: "Previous tab" },
  { keys: ["⌘", "↓"], label: "Next tab" },
  { keys: ["↑", "↓"], label: "Scroll page content" },
  { keys: ["Space"], label: "Page down" },
  { keys: ["⇧", "Space"], label: "Page up" },
];

export function KeyboardShortcuts({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Keyboard shortcuts"
        className={`flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-panel text-ink-soft transition-colors hover:text-ink ${className}`}
      >
        <span className="text-[15px] leading-none">⌘</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-base/70 p-6 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
            className="w-full max-w-sm rounded-2xl border border-line bg-panel p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">
                Keyboard Shortcuts
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-ink-faint transition-colors hover:text-ink"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <ul className="mt-5 flex flex-col gap-3">
              {SHORTCUTS.map((shortcut) => (
                <li
                  key={shortcut.label}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="text-ink-soft">{shortcut.label}</span>
                  <span className="flex shrink-0 gap-1">
                    {shortcut.keys.map((key, i) => (
                      <kbd
                        key={i}
                        className="rounded-md border border-line bg-panel-alt px-2 py-1 text-xs font-semibold text-ink"
                      >
                        {key}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
