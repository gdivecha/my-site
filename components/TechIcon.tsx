"use client";

import { useState } from "react";
import type { SimpleIcon } from "simple-icons";
import {
  siC,
  siPython,
  siJavascript,
  siTypescript,
  siNodedotjs,
  siExpress,
  siDotnet,
  siGraphql,
  siReact,
  siNextdotjs,
  siTailwindcss,
  siHtml5,
  siCss,
  siPostgresql,
  siMongodb,
  siMysql,
  siRedis,
  siDocker,
  siVercel,
  siPytorch,
  siTensorflow,
  siScikitlearn,
  siJest,
  siCypress,
  siPostman,
  siJunit5,
  siGit,
  siFigma,
  siJira,
  siLinux,
  siDavinciresolve,
  siInstagram,
  siTiktok,
  siYoutube,
  siGoogleanalytics,
} from "simple-icons";
import type { SkillTag } from "@/lib/data/skills";

const iconMap: Record<string, SimpleIcon> = {
  C: siC,
  Python: siPython,
  Javascript: siJavascript,
  Typescript: siTypescript,
  Nodedotjs: siNodedotjs,
  Express: siExpress,
  Dotnet: siDotnet,
  Graphql: siGraphql,
  React: siReact,
  Nextdotjs: siNextdotjs,
  Tailwindcss: siTailwindcss,
  Html5: siHtml5,
  Css: siCss,
  Postgresql: siPostgresql,
  Mongodb: siMongodb,
  Mysql: siMysql,
  Redis: siRedis,
  Docker: siDocker,
  Vercel: siVercel,
  Pytorch: siPytorch,
  Tensorflow: siTensorflow,
  Scikitlearn: siScikitlearn,
  Jest: siJest,
  Cypress: siCypress,
  Postman: siPostman,
  Junit5: siJunit5,
  Git: siGit,
  Figma: siFigma,
  Jira: siJira,
  Linux: siLinux,
  Davinciresolve: siDavinciresolve,
  Instagram: siInstagram,
  Tiktok: siTiktok,
  Youtube: siYoutube,
  Googleanalytics: siGoogleanalytics,
};

function TechLogo({ skill }: { skill: SkillTag }) {
  const icon = skill.icon ? iconMap[skill.icon] : undefined;

  if (icon) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill={skill.monochrome ? "currentColor" : `#${icon.hex}`}
      >
        <path d={icon.path} />
      </svg>
    );
  }

  return (
    <span
      className="flex h-full w-full items-center justify-center rounded-md text-[10px] font-bold text-white"
      style={{ background: skill.color ?? "var(--color-accent)" }}
    >
      {skill.abbr}
    </span>
  );
}

export function TechIcon({ skill }: { skill: SkillTag }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
    >
      <span
        role="tooltip"
        className={`absolute -top-9 z-20 whitespace-nowrap rounded-md border border-line bg-panel-alt px-2 py-1 text-[11px] font-semibold tracking-wide text-ink shadow-sm transition-opacity duration-150 ${
          hovered ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {skill.name.toUpperCase()}
      </span>
      <div
        className={`text-ink-soft flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-panel-alt p-2 transition-colors duration-150 hover:border-accent/40 ${
          skill.monochrome ? "hover:text-accent" : ""
        }`}
      >
        <TechLogo skill={skill} />
      </div>
    </div>
  );
}
