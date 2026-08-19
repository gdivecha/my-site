"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "./icons";
import { isMac } from "@/lib/platform";

function getShortcuts(mac: boolean): { keys: string[]; label: string }[] {
  const mod = mac ? "⌘" : "Ctrl";
  return [
    { keys: ["?"], label: "Show this menu" },
    { keys: [mod, "K"], label: "Search" },
    { keys: [mod, "↑"], label: "Previous tab" },
    { keys: [mod, "↓"], label: "Next tab" },
    { keys: ["↑", "↓"], label: "Scroll page content" },
    { keys: ["Space"], label: "Page down" },
    { keys: ["PageUp"], label: "Page up" },
  ];
}

export function KeyboardShortcuts({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  // Defaults to Mac (⌘) so the very first paint matches this component's
  // long-standing hardcoded assumption; corrects to Ctrl on the next render
  // if the client turns out not to be Mac — same one-frame-correction
  // pattern as the matchMedia-driven isCompact flags elsewhere.
  const [mac, setMac] = useState(true);
  useEffect(() => {
    setMac(isMac());
  }, []);
  const shortcuts = getShortcuts(mac);

  useEffect(() => {
    if (!open) return;

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open]);

  // "?" opens this modal from anywhere — not while typing, and not paired
  // with a modifier (so it doesn't fire as a side effect of some other combo).
  useEffect(() => {
    function handleGlobalKeydown(event: KeyboardEvent) {
      if (event.key !== "?") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      event.preventDefault();
      setOpen(true);
    }

    window.addEventListener("keydown", handleGlobalKeydown);
    return () => window.removeEventListener("keydown", handleGlobalKeydown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Keyboard shortcuts"
        className={`flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-icon-btn text-ink-soft transition-colors hover:bg-icon-btn-hover hover:text-ink ${className}`}
        style={style}
      >
        <span className={mac ? "text-[15px] leading-none" : "text-[10px] font-semibold leading-none"}>
          {mac ? "⌘" : "Ctrl"}
        </span>
      </button>

      {open &&
        createPortal(
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
                {shortcuts.map((shortcut) => (
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
          </div>,
          document.body
        )}
    </>
  );
}
