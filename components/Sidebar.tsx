"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { profile } from "@/lib/data/profile";
import { DialNav } from "./DialNav";
import { DevpostIcon, GithubIcon, InstagramIcon, LinkedinIcon } from "./icons";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { SearchModal } from "./SearchModal";
import { ThemeToggle } from "./ThemeToggle";

const socialIcons = {
  GitHub: GithubIcon,
  LinkedIn: LinkedinIcon,
  Instagram: InstagramIcon,
  Devpost: DevpostIcon,
};

export function Sidebar() {
  const nameRef = useRef<HTMLHeadingElement>(null);

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
        <SearchModal />
        <ThemeToggle />
        <KeyboardShortcuts />
      </div>
      <div className="flex h-full flex-col justify-center gap-8 px-8 py-12 md:px-12 md:py-16 lg:px-16">
        <div>
          <h1 ref={nameRef} className="font-display text-[30px] font-bold leading-tight md:text-[36px] lg:text-[48px]">
            <Link href="/about" className="text-gradient">
              {profile.name}
            </Link>
          </h1>
          <p className="relative mt-4 text-base leading-relaxed text-roles-text md:text-lg">
            {profile.roles.join(" • ")}
          </p>
        </div>

        <p className="text-sm leading-relaxed text-ink-soft md:text-[15px]">
          {profile.tagline}
        </p>

        <DialNav />

        <div className="flex gap-2.5">
          {profile.socials.map((social) => {
            const Icon = socialIcons[social.label];
            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-accent text-[var(--color-base)] transition-all hover:-translate-y-0.5 hover:bg-accent-deep"
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
