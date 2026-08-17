import type { ReactNode } from "react";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import type { Certification } from "@/lib/data/certifications";
import { hasIssuerBadge, IssuerBadge } from "./issuer-badge";

/** One uniform card shape for every certification, major or standard —
 * everything (name, issuer, date, credential ID, category, verify link)
 * is visible at rest, no hover/flip/reveal required to read it. Two
 * rows instead of one (badge+name/issuer on top, a meta row below a
 * divider) — taller than the single-row version this used before, but
 * that row was truncating longer cert names to one line and had no room
 * for category. "Major" is reduced to a border/badge treatment rather
 * than a different shape or size, so the grid keeps reflowing cleanly
 * whether it holds 6 entries or 60. */
export function CertificationCard({
  cert,
  icon,
  categoryLabel,
}: {
  cert: Certification;
  icon: ReactNode;
  categoryLabel: string;
}) {
  const major = cert.tier === "major";
  const Wrapper = cert.credentialUrl ? "a" : "div";
  const linkProps = cert.credentialUrl
    ? { href: cert.credentialUrl, target: "_blank", rel: "noreferrer" }
    : {};

  return (
    <Wrapper
      {...linkProps}
      className={`group flex flex-col gap-3 rounded-2xl border p-6 text-left backdrop-blur-[6px] transition-all duration-200 hover:-translate-y-0.5 hover:bg-card-tint-hover hover:shadow-lg hover:shadow-accent/10 ${
        major
          ? "border-accent/30 bg-card-tint hover:border-accent/60"
          : "border-line bg-card-tint hover:border-accent/40"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          {hasIssuerBadge(cert.issuer) ? (
            <IssuerBadge
              issuer={cert.issuer}
              className="h-14 w-14 transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full p-1 transition-transform duration-200 group-hover:scale-105"
              style={{
                background:
                  "conic-gradient(from 180deg, var(--color-accent-soft), var(--color-accent-deep), var(--color-accent-soft))",
              }}
            >
              <div className="flex h-full w-full items-center justify-center rounded-full bg-panel text-accent-soft">
                {icon}
              </div>
            </div>
          )}
          {major && (
            <span
              className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-panel bg-accent text-[var(--color-base)]"
              aria-hidden="true"
            >
              <CheckIcon className="h-2.5 w-2.5" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
            {cert.name}
          </p>
          <p className="mt-0.5 truncate text-xs text-accent-soft">
            {cert.issuer}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-3 text-[11px] text-ink-faint">
        {cert.date && <span>{cert.date}</span>}
        {cert.credentialId && <span>ID: {cert.credentialId}</span>}
        <span className="ml-auto uppercase tracking-widest">
          {categoryLabel}
        </span>
      </div>

      {cert.credentialUrl && (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-soft">
          View credential
          <ArrowRightIcon
            className="h-3.5 w-3.5 -translate-x-1 transition-transform duration-150 group-hover:translate-x-0"
            aria-hidden="true"
          />
        </span>
      )}
    </Wrapper>
  );
}
