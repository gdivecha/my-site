/** Client-only — `navigator` doesn't exist during SSR, so callers that use
 * this for rendered text (not just event handling) should compute it in a
 * useEffect and accept one client-side correction render, same pattern as
 * the matchMedia-driven isCompact flags elsewhere in this codebase. */
export function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform ?? navigator.userAgent);
}
