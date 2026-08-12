"use client";

import { useLayoutEffect, useRef } from "react";
import { profile } from "@/lib/data/profile";
import { DialNav } from "./DialNav";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "./icons";

const socialIcons = {
  GitHub: GithubIcon,
  LinkedIn: LinkedinIcon,
  Instagram: InstagramIcon,
};

export function Sidebar() {
  const nameRef = useRef<HTMLHeadingElement>(null);

  // Keeps each page's header in sync with wherever the (vertically centered,
  // viewport-height-dependent) name ends up — see PageShell's paddingTop.
  useLayoutEffect(() => {
    const el = nameRef.current;
    if (!el) return;

    const sync = () => {
      // Sidebar is only `md:fixed` (viewport-relative); below that it sits
      // in normal flow above the content, so a measured offset wouldn't be
      // meaningful — fall back to PageShell's default padding instead.
      if (window.innerWidth < 768) {
        document.documentElement.style.removeProperty("--sidebar-title-top");
        return;
      }
      const top = el.getBoundingClientRect().top;
      document.documentElement.style.setProperty(
        "--sidebar-title-top",
        `${top}px`
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
    <aside className="border-b border-line md:fixed md:inset-y-0 md:left-0 md:w-[clamp(360px,40vw,640px)] md:border-b-0 md:overflow-y-auto">
      <div className="flex h-full flex-col justify-center gap-10 px-8 py-12 md:px-12 md:py-16 lg:px-16">
        <div>
          <h1
            ref={nameRef}
            className="relative inline-block font-display text-3xl font-bold leading-tight md:text-4xl lg:text-5xl"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[-3%] bottom-0 h-[0.55em] rounded-sm bg-accent/20"
            />
            <span className="relative text-gradient">{profile.name}</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft md:text-base">
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
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-ink transition-transform hover:-translate-y-0.5 hover:bg-accent-deep"
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
