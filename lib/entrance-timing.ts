/** Shared constants for the page-load entrance choreography, so Sidebar,
 * PageShell, and DialNav agree on the same numbers instead of duplicating
 * (and risking drifting) magic values across files. */

/** Fade/slide duration for every entrance group except RoleReveal (which
 * runs its own multi-phase animation) and DialNav's nudge (which is a
 * scroll animation, not a fade). */
export const ENTRANCE_MS = 500;

/** Stagger between each social icon's entrance within its group. */
export const SOCIALS_STAGGER_MS = 70;

/** How long, once visible, DialNav waits before starting its load-time
 * nudge. */
export const NUDGE_START_DELAY_MS = 900;

/** Extra pause after the right-side page content has fully finished
 * fading in before the dial appears — the dial deliberately comes last,
 * once everything else has settled. */
export const DIAL_POST_CONTENT_DELAY_MS = 1200;
