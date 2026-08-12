import Image from "next/image";
import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import { Pill } from "@/components/Pill";
import { profile } from "@/lib/data/profile";

export default function AboutPage() {
  return (
    <PageShell watermark="ABOUT">
      <PageHeading eyebrow="About">Hi there...</PageHeading>

      <div className="mt-10 flex w-full max-w-2xl flex-col items-start gap-10">
        <div className="flex items-end gap-5">
          <div
            className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl border border-line bg-panel"
            style={{ maxWidth: "clamp(180px, 24vh, 260px)" }}
          >
            <Image
              src="/profile.png"
              alt={profile.name}
              fill
              sizes="260px"
              className="object-cover"
              priority
            />
          </div>

          <div className="flex shrink-0 flex-col gap-2.5">
            <Pill icon={<span aria-hidden="true">💼</span>}>
              2+ years of experience in SWE
            </Pill>
            <Pill icon={<span aria-hidden="true">🎓</span>}>
              {profile.education}
            </Pill>
            <Pill icon={<span aria-hidden="true">📍</span>}>
              {profile.location}
            </Pill>
            <Pill icon={<span aria-hidden="true">🟢</span>}>
              Available for opportunities
            </Pill>
          </div>
        </div>

        <div className="space-y-3 text-left text-[13px] leading-relaxed text-ink-soft sm:text-sm">
          {profile.bio.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
