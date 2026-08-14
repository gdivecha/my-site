/** Captured once, when this module is first evaluated — essentially at
 * page load, before any component mounts. Sidebar (for its entrance
 * cascade) and PageShell (to know once that cascade has finished, so page
 * content can wait for it) both reference this same timestamp, so neither
 * depends on which of them happens to run its effect first. */
export const APP_LOADED_AT = typeof window !== "undefined" ? Date.now() : 0;
