import Image from "next/image";
import { LinkedinIcon } from "@/components/icons";

/** Real logo files for every issuer currently in the data. Toronto
 * Metropolitan University gets its own copy
 * (public/logos/ryerson-university.png) rather than reusing Academics'
 * /logos/tmu.jpg — same institution (issued as "Ryerson University" at
 * the time, since renamed), but that asset is specifically Academics'
 * school-logo image and shouldn't be repurposed here. */
const IMAGE_BADGES: Record<
  string,
  { src: string; background?: string; contain?: boolean }
> = {
  HackerRank: { src: "/logos/hackerrank.png" },
  DataCamp: { src: "/logos/datacamp.png" },
  Pluralsight: { src: "/logos/pluralsight.jpg" },
  "Tech Stewardship": { src: "/logos/tech-stewardship.jpeg" },
  "Toronto Metropolitan University": {
    src: "/logos/ryerson-university.png",
    background: "#ffffff",
    contain: true,
  },
  Sololearn: {
    src: "/logos/sololearn.webp",
    background: "#ffffff",
    contain: true,
  },
  Google: {
    src: "/logos/google.jpg",
    background: "#ffffff",
    contain: true,
  },
  Udemy: {
    src: "/logos/udemy.jpg",
    background: "#ffffff",
    contain: true,
  },
};

/** Solid-color monogram chips, for any future issuer added to the data
 * before a real logo asset is on hand — not attempts at pixel-accurate
 * trademark reproductions, just an initial in the issuer's approximate
 * brand color. Empty for now since every current issuer has a real
 * logo (see IMAGE_BADGES above). */
const MONOGRAMS: Record<string, { bg: string; label: string }> = {};

/** So callers can decide up front whether to render IssuerBadge at all
 * versus falling back to the generic category medallion. */
export function hasIssuerBadge(issuer: string) {
  return issuer === "LinkedIn" || issuer in IMAGE_BADGES || issuer in MONOGRAMS;
}

export function IssuerBadge({
  issuer,
  className = "",
}: {
  issuer: string;
  className?: string;
}) {
  if (issuer === "LinkedIn") {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-[#0A66C2] ${className}`}
      >
        <LinkedinIcon className="h-[55%] w-[55%] text-white" />
      </div>
    );
  }

  const image = IMAGE_BADGES[issuer];
  if (image) {
    return (
      <div
        className={`relative overflow-hidden rounded-full ${className}`}
        style={{ background: image.background }}
      >
        <Image
          src={image.src}
          alt={`${issuer} logo`}
          fill
          sizes="56px"
          // These are tiny local files (a few KB, from /public/logos) —
          // lazy-loading them buys nothing and meant a fast scroll could
          // outrun the browser's load trigger, leaving a card's badge
          // blank for a moment. Loading all of them eagerly on mount
          // fixes that.
          loading="eager"
          className={image.contain ? "object-contain p-2" : "object-cover"}
        />
      </div>
    );
  }

  const mono = MONOGRAMS[issuer];
  if (!mono) return null;

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white ${className}`}
      style={{ background: mono.bg }}
    >
      <span className="text-sm font-bold tracking-tight">{mono.label}</span>
    </div>
  );
}
