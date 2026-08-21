"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { profile } from "@/lib/data/profile";
import {
  DIAL_NUDGE_DELAY_MS,
  ENTRANCE_MS,
  ICONS_DELAY_MS,
  MOBILE_DIAL_NUDGE_DELAY_MS,
  MOBILE_ICONS_DELAY_MS,
  MOBILE_SIDEBAR_STAGE_DELAYS,
  SIDEBAR_STAGE_DELAYS as STAGE_DELAYS,
  SOCIALS_STAGGER_MS,
} from "@/lib/entrance-timing";
import { Copyright } from "./Copyright";
import { CopyLinkIcon } from "./CopyLinkIcon";
import { DialNav } from "./DialNav";
import { DevpostIcon, GithubIcon, InstagramIcon, LinkedinIcon } from "./icons";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { RoleReveal } from "./RoleReveal";
import { SearchModal } from "./SearchModal";
import { SoundToggle } from "./SoundToggle";
import { ThemeToggle } from "./ThemeToggle";

const socialIcons = {
  GitHub: GithubIcon,
  LinkedIn: LinkedinIcon,
  Instagram: InstagramIcon,
  Devpost: DevpostIcon,
};

function stageClass(reached: boolean) {
  return `transition-all ease-out ${
    reached ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
  }`;
}

// Shared by both icon rows (top-left utility icons, sidebar-bottom social
// links) so they read as the same visual language: each icon fades/slides
// up individually, staggered by index — rather than transition-all (which
// would also apply the entrance's slow, staggered duration to each icon's
// hover background-color change).
function iconEntranceStyle(index: number) {
  const delay = `${index * SOCIALS_STAGGER_MS}ms`;
  return {
    transition: `opacity ${ENTRANCE_MS}ms ease-out ${delay}, transform ${ENTRANCE_MS}ms ease-out ${delay}, background-color 150ms ease`,
  };
}

export function Sidebar() {
  const nameRef = useRef<HTMLHeadingElement>(null);
  const [stage, setStage] = useState(0);
  const [iconsVisible, setIconsVisible] = useState(false);
  // Starts false (desktop timing) so server and client agree on the
  // first render, same SSR-safety pattern used throughout this codebase
  // (window doesn't exist yet during the server render) — corrected
  // before paint via useLayoutEffect, which is what DialNav's own
  // nudgeDelayMs prop below needs to pick the right (mobile vs desktop)
  // timeline with.
  const [isMobile, setIsMobile] = useState(false);
  useLayoutEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Drives the entrance cascade below. Skips straight to the end under
  // prefers-reduced-motion so nothing is gated behind a delay. Mobile
  // uses its own compressed timeline (MOBILE_SIDEBAR_STAGE_DELAYS/
  // MOBILE_ICONS_DELAY_MS) — the desktop one waits through two stages
  // (tagline, inline dial) that don't render anything on mobile at all
  // (both `hidden md:block` below), so reusing it as-is just added ~1s
  // of dead time before socials/icons/page content ever appeared.
  // Checked once at mount, matching every other one-time viewport check
  // in this file (e.g. the nameRef sync effect below) — an animation
  // this short-lived isn't worth reacting to a mid-cascade resize for.
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const stageDelays = isMobile ? MOBILE_SIDEBAR_STAGE_DELAYS : STAGE_DELAYS;
    const iconsDelayMs = isMobile ? MOBILE_ICONS_DELAY_MS : ICONS_DELAY_MS;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage(stageDelays.length);
      setIconsVisible(true);
      return;
    }
    const timers = stageDelays.map((delay, i) =>
      setTimeout(() => setStage((s) => Math.max(s, i + 1)), delay)
    );
    // Deliberately separate from the cascade above — these appear at the
    // same moment as the page's right-side content and watermark, not on
    // their own turn in the sidebar's own sequence.
    const iconsTimer = setTimeout(() => setIconsVisible(true), iconsDelayMs);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(iconsTimer);
    };
  }, []);

  // Publishes wherever the (vertically centered, viewport-height-dependent)
  // name's *bottom* edge ends up — PageHeading reads this to line up each
  // page's heading bottom-to-bottom with the name, not top-to-top (the two
  // sit at different font sizes, so top-aligning them left the bottoms
  // uneven).
  useLayoutEffect(() => {
    const el = nameRef.current;
    if (!el) return;

    const sync = () => {
      // Sidebar is only `md:fixed` (viewport-relative); below that it sits
      // in normal flow above the content, so a measured offset wouldn't be
      // meaningful — fall back to PageShell's default padding instead.
      if (window.innerWidth < 768) {
        document.documentElement.style.removeProperty(
          "--sidebar-title-bottom"
        );
        return;
      }
      const bottom = el.getBoundingClientRect().bottom;
      document.documentElement.style.setProperty(
        "--sidebar-title-bottom",
        `${bottom}px`
      );
    };

    sync();
    window.addEventListener("resize", sync);
    const resizeObserver = new ResizeObserver(sync);
    resizeObserver.observe(document.documentElement);
    return () => {
      window.removeEventListener("resize", sync);
      resizeObserver.disconnect();
    };
  }, []);

  // How far through the page the visitor has scrolled, 0-1 — drives the
  // thin progress bar drawn along the sticky mobile header's own bottom
  // edge (see the aside's border-b below). Mobile only in effect: this
  // header is only sticky (with something to track scrolling under it)
  // below md; at md+ the sidebar is a fixed full-height column with
  // nothing analogous to show progress against.
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    function updateProgress() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(
        scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0
      );
    }
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  // sticky top-0 below md: without this, this whole block (name, role,
  // socials, and — most usefully for actually navigating — the utility
  // icons) scrolls away with the page on mobile, same as any other
  // content. md+ is unaffected — md:fixed already anchors it to the
  // viewport there, which just overrides this. The card-tint/blur
  // background is new too, matching how every other card on the site
  // (ExperienceCard, etc.) reads as its own frosted surface rather than
  // plain page background — needed here now that content actually
  // scrolls underneath it instead of the sidebar just sitting on a
  // static background above everything. md+ resets both back to none,
  // since the fixed sidebar there already has nothing scrolling behind
  // it to separate itself from.
  return (
    <aside className="sticky top-0 z-20 border-b border-line bg-sidebar-sticky-bg backdrop-blur-[6px] md:fixed md:inset-y-0 md:left-0 md:w-[clamp(360px,40vw,640px)] md:border-b-0 md:bg-transparent md:backdrop-blur-none md:overflow-y-auto">
      {/* scaleX, not width — transform is GPU-composited and doesn't
          trigger layout on every scroll event the way animating width
          would, same reasoning PageShell's own entrance animation uses
          for preferring transform. origin-right (matching the site's
          mobile right-to-left convention) keeps the growing edge
          anchored on the right and fills leftward as progress
          increases, rather than growing outward from the left. Drawn
          over the aside's own border-b (same accent gradient the
          sidebar name's hover underline uses) — at 0 scroll it's fully
          collapsed and the plain border shows through untouched. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-right bg-[linear-gradient(90deg,var(--color-accent-soft),var(--color-accent-deep))] md:hidden"
        style={{ transform: `scaleX(${scrollProgress})` }}
        aria-hidden="true"
      />
      <div className="absolute right-6 top-8 flex gap-1.5 md:right-auto md:left-12 md:top-10 md:gap-2 lg:left-16">
        {[
          { Icon: SearchModal, mobile: true },
          { Icon: SoundToggle, mobile: true },
          { Icon: ThemeToggle, mobile: true },
          // Keyboard-shortcut reference is meaningless without a
          // keyboard — there's nothing to bind these to on a touch
          // device, so the button itself is just dead weight there.
          { Icon: KeyboardShortcuts, mobile: false },
          { Icon: CopyLinkIcon, mobile: true },
        ].map(({ Icon, mobile }, i) => (
          <span key={i} className={mobile ? undefined : "hidden md:block"}>
            <Icon
              className={
                iconsVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-2 opacity-0"
              }
              style={iconEntranceStyle(i)}
            />
          </span>
        ))}
      </div>
      {/* pt-24 (not the plain py-12 pt below md) clears the utility icon
          row above — those are absolutely positioned at top-8 with h-9
          (36px) icons, so their bottom edge sits at 68px; md+ doesn't
          need this since that layout vertically centers this whole
          column in a full-height column instead of stacking it directly
          under the icons. */}
      <div className="flex h-full flex-col justify-center gap-2 px-6 pb-5 pt-19 text-right md:gap-8 md:px-12 md:py-16 md:text-left lg:px-16">
        <div>
          {/* Not an h1 — it's identical on every route, so the page's own
              PageHeading (or equivalent) is the real h1 per route instead.
              The entrance animation lives on the inner span, not this
              element itself — this is what nameRef measures for the
              page-heading bottom-alignment sync above, and that only runs
              once on mount, so an animated transform directly on it would
              get measured mid-slide instead of at its settled position. */}
          <p
            ref={nameRef}
            className="font-display text-[30px] font-bold leading-tight md:text-[36px] lg:text-[48px]"
          >
            <span
              className={`inline-block ${stageClass(stage >= 1)}`}
              style={{ transitionDuration: `${ENTRANCE_MS}ms` }}
            >
              <Link
                href="/home"
                className="text-gradient inline-block transition-transform duration-200 hover:-translate-y-0.5"
              >
                {profile.name}
              </Link>
            </span>
          </p>
          {/* Grid-stacks an invisible placeholder under the real content so
              this line always reserves its final height, even before
              RoleReveal has mounted — otherwise the empty paragraph
              collapses to 0px, and since the whole block above is
              vertically centered, that missing height shifts the name
              itself once RoleReveal appears, breaking the one-time
              nameRef measurement the page-heading alignment depends on. */}
          <p className="relative mt-0.5 grid text-base leading-relaxed text-roles-text md:mt-4 md:text-lg">
            <span className="invisible col-start-1 row-start-1" aria-hidden="true">
              {profile.roles[0]}
            </span>
            <span className="col-start-1 row-start-1">
              {stage >= 2 && <RoleReveal />}
            </span>
          </p>
        </div>

        <p
          className={`hidden text-sm leading-relaxed text-ink-soft md:block md:text-[15px] ${stageClass(stage >= 3)}`}
          style={{ transitionDuration: `${ENTRANCE_MS}ms` }}
        >
          {profile.tagline}
        </p>

        {/* DialNav renders itself as a fixed bottom bar (portaled to
            document.body) below md — this wrapper would otherwise still
            be an empty flex child there, adding a second gap-8 on top of
            the one before the social icons and throwing off the
            otherwise-even vertical rhythm between the icon row, name
            block, and socials. */}
        <div
          className={`hidden md:block ${stageClass(stage >= 4)}`}
          style={{ transitionDuration: `${ENTRANCE_MS}ms` }}
        >
          <DialNav
            nudgeDelayMs={isMobile ? MOBILE_DIAL_NUDGE_DELAY_MS : DIAL_NUDGE_DELAY_MS}
          />
        </div>

        <div className="flex justify-end gap-2.5 md:justify-start">
          {profile.socials.map((social, i) => {
            const Icon = socialIcons[social.label];
            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-accent text-[var(--color-base)] hover:bg-accent-deep ${
                  stage >= 5
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0"
                }`}
                style={iconEntranceStyle(i)}
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
        </div>
      </div>

      {/* Absolutely positioned, not a flex child of the centered column
          above — that column is centered via justify-center, so a normal
          child here would grow its height and shift everything else in
          it upward to stay centered. This sits independently at the
          bottom instead, same left offsets as the top utility icons —
          and gated on the same iconsVisible flag as those icons (not the
          sidebar's own earlier cascade), so both appear together with
          the page's right-side content rather than the copyright line
          showing up early alongside the social icons above it.

          md+ only: below md the sidebar isn't a fixed full-height
          column, it's stacked in normal flow right above the page's own
          content — so bottom-8 there would anchor to the bottom of this
          short block instead of the page, putting the copyright right
          under the social icons near the top of the screen rather than
          at the bottom of whatever's actually on the page. See
          SectionsLayout for the mobile copyright that replaces it,
          placed after each page's own content instead. */}
      <Copyright
        data-copyright
        className={`hidden text-xs text-ink-faint transition-all ease-out md:absolute md:bottom-10 md:left-12 md:block lg:left-16 ${
          iconsVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
        style={{ transitionDuration: `${ENTRANCE_MS}ms` }}
      />
    </aside>
  );
}
