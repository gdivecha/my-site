"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CloseIcon, SearchIcon } from "./icons";
import { searchIndex } from "@/lib/search-index";

export function SearchModal({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return searchIndex;
    return searchIndex.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.group.toLowerCase().includes(q) ||
        r.keywords?.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    setHighlighted(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  // Cmd+K opens search from anywhere on the site.
  useEffect(() => {
    function handleGlobalKeydown(event: KeyboardEvent) {
      if (!event.metaKey || event.key.toLowerCase() !== "k") return;
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      event.preventDefault();
      setOpen(true);
    }
    window.addEventListener("keydown", handleGlobalKeydown);
    return () => window.removeEventListener("keydown", handleGlobalKeydown);
  }, []);

  function navigateTo(href: string) {
    router.push(href);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlighted((i) => Math.min(i + 1, results.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlighted((i) => Math.max(i - 1, 0));
      } else if (event.key === "Enter") {
        const result = results[highlighted];
        if (result) navigateTo(result.href);
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, results, highlighted]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className={`flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-panel text-ink-soft transition-colors hover:bg-panel-alt hover:text-ink ${className}`}
      >
        <SearchIcon className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-base/70 p-6 pt-24 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="w-full max-w-md rounded-2xl border border-line bg-panel shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <SearchIcon className="h-4 w-4 shrink-0 text-ink-faint" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the site..."
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="shrink-0 text-ink-faint transition-colors hover:text-ink"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <ul className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-ink-faint">
                  No results for &ldquo;{query}&rdquo;
                </li>
              ) : (
                results.map((result, i) => {
                  const active = i === highlighted;
                  return (
                    <li key={result.id}>
                      <button
                        type="button"
                        onClick={() => navigateTo(result.href)}
                        onMouseEnter={() => setHighlighted(i)}
                        className={`flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          active ? "bg-accent text-white" : "text-ink-soft hover:bg-panel-alt"
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium">
                            {result.label}
                          </span>
                          {result.description && (
                            <span
                              className={`block truncate text-xs ${
                                active ? "text-white/75" : "text-ink-faint"
                              }`}
                            >
                              {result.description}
                            </span>
                          )}
                        </span>
                        <span
                          className={`shrink-0 text-[10px] uppercase tracking-wide ${
                            active ? "text-white/70" : "text-ink-faint"
                          }`}
                        >
                          {result.group}
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
