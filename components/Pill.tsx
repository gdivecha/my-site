import type { ReactNode } from "react";

export function Pill({
  children,
  icon,
  className = "",
}: {
  children: ReactNode;
  icon?: ReactNode;
  /** Appended after the defaults, so it can override them (e.g.
   * whitespace-normal in place of the default nowrap, for a pill sitting
   * in a narrow grid cell rather than a free-flowing row where nowrap
   * is what keeps it from breaking awkwardly). */
  className?: string;
}) {
  return (
    <span
      // whitespace-normal (mobile) — a real overflow, not just cramped:
      // the pills column is now a fixed 4/9 share of the intro row (see
      // intro-hero.tsx/.home-intro-grid), and "Toronto, ON, CA" at the
      // nowrap default rendered its text past the pill's own rounded
      // edge instead of respecting it. Allowing wrap is the graceful
      // fallback for whichever label doesn't fit on one line, rather
      // than reducing the font further and further to chase every
      // possible label length. text-[13px], not text-sm — the bumped-up
      // padding/gap below already reads as "larger" than before; the
      // font itself only needed to come back down slightly from that
      // same earlier bump to stop contributing to the overflow.
      // sm:whitespace-nowrap/sm:text-xs revert to the original desktop
      // sizing, unaffected either way (already confirmed fitting fine
      // there).
      // justify-end (mobile) — text-align only positions text within a
      // node, it doesn't move the icon+text flex group itself; on a
      // w-full pill (wider than that group's own content) the group was
      // still clustering at the box's start, leaving the "right-indent"
      // read as empty space on the right instead of an actual shift.
      // justify-content is the actual lever for a flex container's own
      // child positioning. sm:justify-start reverts for desktop, where
      // pills are max-content-sized to their own content anyway (no
      // spare width for this to visibly matter either way).
      className={`inline-flex items-center justify-end gap-1.5 whitespace-normal rounded-full border border-line bg-card-tint px-2.5 py-1 text-right text-[13px] text-ink-soft backdrop-blur-[6px] sm:justify-start sm:gap-1.5 sm:whitespace-nowrap sm:px-3.5 sm:py-1.5 sm:text-left sm:text-xs ${className}`}
    >
      {/* order-2 on the icon (mobile only) — puts it after the text
          instead of before, matching the site's usual mobile
          right-anchored-icon convention. sm:order-none reverts to plain
          DOM order (icon first) for desktop, unchanged from before. */}
      <span className="order-2 sm:order-none">{icon}</span>
      {children}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-tag-bg px-3 py-1 text-xs font-medium tracking-wide text-accent-soft">
      {children}
    </span>
  );
}
