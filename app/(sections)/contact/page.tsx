import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import { profile } from "@/lib/data/profile";
import { CopyEmailButton } from "./copy-email-button";

// Standing in for the form (see contact-form.tsx) until that has a real
// backend to send to — a form that looks like it works but silently goes
// nowhere is worse than no form at all, so this is direct contact info
// instead: a one-click-to-copy email. No socials here — those already
// live at the bottom of the sidebar on every page.
export default function ContactPage() {
  return (
    <PageShell watermark="CONTACT">
      <PageHeading eyebrow="Contact">Let&apos;s talk</PageHeading>

      <div className="mt-8 max-w-xl rounded-2xl border border-line bg-card-tint p-6 backdrop-blur-[3.8px] md:p-8">
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
