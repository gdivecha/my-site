"use client";

import { profile } from "@/lib/data/profile";
import { DialNav } from "./DialNav";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "./icons";

const socialIcons = {
  GitHub: GithubIcon,
  LinkedIn: LinkedinIcon,
  Instagram: InstagramIcon,
};

export function Sidebar() {
  return (
    <aside className="border-b border-line md:fixed md:inset-y-0 md:left-0 md:w-80 md:border-b-0 md:border-r md:overflow-y-auto">
      <div className="flex h-full flex-col gap-8 px-8 py-10 md:px-9">
        <div>
          <h1 className="font-display text-2xl font-bold leading-tight">
            <span className="text-gradient">{profile.name}</span>
          </h1>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
            {profile.roles.join(" • ")}
          </p>
        </div>

        <p className="text-sm leading-relaxed text-ink-soft">
          {profile.tagline}
        </p>

        <DialNav />

        <div className="mt-auto flex gap-2.5 pt-2">
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
