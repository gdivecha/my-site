import type { Metadata } from "next";
import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import { profile } from "@/lib/data/profile";
import { CopyEmailButton } from "./copy-email-button";

export const metadata: Metadata = {
  title: "Contact",
  description: `Reach out to ${profile.name} directly — open to full-time roles, freelance work, or just talking shop.`,
};

// Standing in for the form (see contact-form.tsx) until that has a real
// backend to send to — a form that looks like it works but silently goes
// nowhere is worse than no form at all, so this is direct contact info
// instead: a one-click-to-copy email. No socials here — those already
// live at the bottom of the sidebar on every page.
export default function ContactPage() {
  return (
    <PageShell watermark="CONTACT">
      <PageHeading eyebrow="Contact">Let&apos;s talk</PageHeading>

      {/* p-5, not p-6, specifically below sm: the copy-email button's own
          text needs every spare pixel of the card's content width on a
          narrow phone to fit the email on one line (see
          copy-email-button.tsx) — a couple of reclaimed padding pixels
          on each side is what closes that gap. */}
      <div className="mt-8 max-w-xl rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[6px] sm:p-6 md:p-8">
        <p className="text-sm leading-relaxed text-ink-soft">
          Open to full-time roles, freelance work, or just talking shop
          about something you&apos;re building. Reach out directly:
        </p>

        <CopyEmailButton email={profile.email} />

        <p className="mt-3 text-xs text-ink-faint">
          Based in {profile.location}. Usually replies within a day or two.
        </p>
      </div>
    </PageShell>
  );
}
