"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { profile } from "@/lib/data/profile";
import {
  DIAL_NUDGE_DELAY_MS,
  ENTRANCE_MS,
  ICONS_DELAY_MS,
  SIDEBAR_STAGE_DELAYS as STAGE_DELAYS,
  SOCIALS_STAGGER_MS,
} from "@/lib/entrance-timing";
import { DialNav } from "./DialNav";
import { DevpostIcon, GithubIcon, InstagramIcon, LinkedinIcon } from "./icons";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { RoleReveal } from "./RoleReveal";
import { SearchModal } from "./SearchModal";
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

  // Drives the entrance cascade below. Skips straight to the end under
  // prefers-reduced-motion so nothing is gated behind a delay.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage(STAGE_DELAYS.length);
      setIconsVisible(true);
      return;
    }
    const timers = STAGE_DELAYS.map((delay, i) =>
      setTimeout(() => setStage((s) => Math.max(s, i + 1)), delay)
    );
    // Deliberately separate from the cascade above — these appear at the
    // same moment as the page's right-side content and watermark, not on
    // their own turn in the sidebar's own sequence.
    const iconsTimer = setTimeout(() => setIconsVisible(true), ICONS_DELAY_MS);
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

  return (
    <aside className="relative z-20 border-b border-line md:fixed md:inset-y-0 md:left-0 md:w-[clamp(360px,40vw,640px)] md:border-b-0 md:overflow-y-auto">
      <div className="absolute left-8 top-8 flex gap-2 md:left-12 md:top-10 lg:left-16">
        {[SearchModal, ThemeToggle, KeyboardShortcuts].map((Icon, i) => (
          <Icon
            key={i}
            className={
              iconsVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0"
            }
            style={iconEntranceStyle(i)}
          />
        ))}
      </div>
      <div className="flex h-full flex-col justify-center gap-8 px-8 py-12 md:px-12 md:py-16 lg:px-16">
        <div>
          {/* The entrance animation lives on the inner span, not the h1
              itself — the h1 is what nameRef measures for the page-heading
              bottom-alignment sync above, and that only runs once on
              mount, so an animated transform directly on the h1 would get
              measured mid-slide instead of at its settled position. */}
          <h1
            ref={nameRef}
            className="font-display text-[30px] font-bold leading-tight md:text-[36px] lg:text-[48px]"
          >
            <span
              className={`inline-block ${stageClass(stage >= 1)}`}
              style={{ transitionDuration: `${ENTRANCE_MS}ms` }}
            >
              <Link
                href="/about"
                className="text-gradient inline-block transition-transform duration-200 hover:-translate-y-0.5"
              >
                {profile.name}
              </Link>
            </span>
          </h1>
          {/* Grid-stacks an invisible placeholder under the real content so
              this line always reserves its final height, even before
              RoleReveal has mounted — otherwise the empty paragraph
              collapses to 0px, and since the whole block above is
              vertically centered, that missing height shifts the name
              itself once RoleReveal appears, breaking the one-time
              nameRef measurement the page-heading alignment depends on. */}
          <p className="relative mt-4 grid text-base leading-relaxed text-roles-text md:text-lg">
            <span className="invisible col-start-1 row-start-1" aria-hidden="true">
              {profile.roles[0]}
            </span>
            <span className="col-start-1 row-start-1">
              {stage >= 2 && <RoleReveal />}
            </span>
          </p>
        </div>

        <p
          className={`text-sm leading-relaxed text-ink-soft md:text-[15px] ${stageClass(stage >= 3)}`}
          style={{ transitionDuration: `${ENTRANCE_MS}ms` }}
        >
          {profile.tagline}
        </p>

        <div
          className={stageClass(stage >= 4)}
          style={{ transitionDuration: `${ENTRANCE_MS}ms` }}
        >
          <DialNav nudgeDelayMs={DIAL_NUDGE_DELAY_MS} />
        </div>

        <div className="flex gap-2.5">
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
    </aside>
  );
}
