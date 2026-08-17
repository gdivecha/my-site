import { profile } from "./data/profile";

/** Shared constants and math for the page-load entrance choreography.
 *
 * Deliberately lives here rather than inside Sidebar.tsx or RoleReveal.tsx
 * (which is where this math used to live) — this file only imports plain
 * data (lib/data/profile), never a React component. PageShell needs
 * SIDEBAR_CASCADE_DONE_MS on every single page, and importing it from a
 * component file would drag that component's entire module graph into
 * every page's bundle along with it. That's exactly what happened when
 * PageShell imported it from "./Sidebar": every page ended up
 * transitively bundling DialNav, RoleReveal, icons, ThemeToggle,
 * SearchModal, and KeyboardShortcuts too, just to read one number. */

/** Fade/slide duration for every entrance group except RoleReveal (which
 * runs its own multi-phase animation) and DialNav's nudge (which is a
 * scroll animation, not a fade). */
export const ENTRANCE_MS = 500;

/** Stagger between each social icon's entrance within its group. */
export const SOCIALS_STAGGER_MS = 70;

/** How long, once visible, DialNav waits before starting its load-time
 * nudge (also used as its default nudgeDelayMs when not overridden). */
export const NUDGE_START_DELAY_MS = 900;

/** Extra pause after the right-side page content has fully finished
 * fading in before the dial's nudge fires — it comes last, once
 * everything else has settled. */
export const DIAL_POST_CONTENT_DELAY_MS = 1200;

/** Total wall-clock time from RoleReveal's mount to fully settled — it's
 * a single plain fade now (see RoleReveal.tsx), same duration as
 * ENTRANCE_MS, kept as its own export since TAGLINE_DELAY_MS below needs
 * to chain off it. */
export const ROLE_REVEAL_DURATION_MS = ENTRANCE_MS;

// Sidebar's own cascade: each stage's delay is the previous stage's delay
// plus how long that stage's own animation actually takes to finish, so
// the next group only starts once the one before it has genuinely
// settled. Reading/priority order: name, roles, tagline, nav, socials.
// The utility icons (search/theme/shortcuts) are deliberately *not* part
// of this chain — they appear later, at the same moment as the page's
// right-side content and watermark, see ICONS_DELAY_MS below.
const NAME_DELAY_MS = 0;
const ROLES_DELAY_MS = NAME_DELAY_MS + ENTRANCE_MS;
const TAGLINE_DELAY_MS = ROLES_DELAY_MS + ROLE_REVEAL_DURATION_MS;
const NAV_DELAY_MS = TAGLINE_DELAY_MS + ENTRANCE_MS;
const SOCIALS_DELAY_MS = NAV_DELAY_MS + ENTRANCE_MS;

export const SIDEBAR_STAGE_DELAYS = [
  NAME_DELAY_MS,
  ROLES_DELAY_MS,
  TAGLINE_DELAY_MS,
  NAV_DELAY_MS,
  SOCIALS_DELAY_MS,
] as const;

/** Wall-clock time (from page load) until the sidebar's own cascade above
 * has finished — the last social icon is the last thing in it, staggered
 * by SOCIALS_STAGGER_MS per icon. PageShell waits for this before
 * revealing page content, rather than that content appearing alongside
 * (or before) the sidebar mid-cascade. */
export const SIDEBAR_CASCADE_DONE_MS =
  SOCIALS_DELAY_MS +
  (profile.socials.length - 1) * SOCIALS_STAGGER_MS +
  ENTRANCE_MS;

/** The utility icons in the top-left corner appear at the same moment as
 * the page's right-side content and watermark — both of those are gated
 * on SIDEBAR_CASCADE_DONE_MS too (PageShell reads it directly; the icons
 * use this alias for clarity at the call site). */
export const ICONS_DELAY_MS = SIDEBAR_CASCADE_DONE_MS;

/** How long something (a newly selected dial tab, a page's own content)
 * gets to become available before any "still loading" cue shows at all
 * — normal, fast loads never reach this and show nothing; it's only for
 * a genuine stall. Shared between DialNav's lock icon and PageShell's
 * watermark wave so both agree on what "reasonable" means. */
export const REASONABLE_LOAD_WAIT_MS = 200;

/** The dial itself appears on schedule, in the cascade above — but its
 * load-time nudge is deferred until the page's own content (which waits
 * for SIDEBAR_CASCADE_DONE_MS, then takes ENTRANCE_MS to fade in) has
 * fully settled, plus a deliberate pause, so the nudge motion doesn't
 * compete with the right side still animating in. */
export const DIAL_NUDGE_DELAY_MS =
  SIDEBAR_CASCADE_DONE_MS + ENTRANCE_MS + DIAL_POST_CONTENT_DELAY_MS;
