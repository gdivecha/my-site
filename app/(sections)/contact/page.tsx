import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import { MailIcon } from "@/components/icons";
import { profile } from "@/lib/data/profile";

// Standing in for the form (see contact-form.tsx) until that has a real
// backend to send to — a form that looks like it works but silently goes
// nowhere is worse than no form at all, so this is direct contact info
// instead: an actual mailto link. No socials here — those already live
// at the bottom of the sidebar on every page.
export default function ContactPage() {
  return (
    <PageShell watermark="CONTACT">
      <PageHeading eyebrow="Contact">Let&apos;s talk</PageHeading>

      <div className="mt-8 max-w-xl rounded-2xl border border-line bg-card-tint p-6 backdrop-blur-[3.8px] md:p-8">
        <p className="text-sm leading-relaxed text-ink-soft">
          Open to full-time roles, freelance work, or just talking shop
          about something you&apos;re building. Reach out directly:
        </p>

        <a
          href={`mailto:${profile.email}`}
          className="group mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-panel px-4 py-2.5 text-sm text-ink transition-colors hover:border-accent/40 hover:text-accent-soft"
        >
          <MailIcon className="h-4 w-4 shrink-0 text-accent-soft" />
          {profile.email}
        </a>

        <p className="mt-3 text-xs text-ink-faint">
          Based in {profile.location}. Usually replies within a day or two.
        </p>
      </div>
    </PageShell>
  );
}
