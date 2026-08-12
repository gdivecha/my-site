import { PageShell } from "@/components/PageShell";
import { Pill } from "@/components/Pill";
import { profile } from "@/lib/data/profile";
import { ScrollIndicator } from "./scroll-indicator";

export default function AboutPage() {
  return (
    <PageShell variant="about" watermark="ABOUT">
      <div className="grid gap-12 md:grid-cols-[1fr_300px] md:items-start">
        <div className="order-2 md:order-1">
          <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">
            Hey, I&apos;m
          </p>
          <h2 className="mt-2 font-display text-4xl font-bold text-ink sm:text-5xl">
            {profile.name.split(" ")[0]}.
          </h2>
          <div className="mt-8 max-w-xl space-y-4 text-[15px] leading-relaxed text-ink-soft">
            {profile.bio.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-12 flex justify-end md:hidden">
            <ScrollIndicator />
          </div>
        </div>

        <div className="order-1 flex flex-col items-start gap-4 md:order-2">
          <div className="aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl border border-line bg-panel">
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-panel-alt to-panel">
              <span className="font-display text-6xl font-bold text-gradient">
                GD
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Pill icon={<span aria-hidden="true">🎓</span>}>
              {profile.education}
            </Pill>
            <Pill icon={<span aria-hidden="true">📍</span>}>
              {profile.location}
            </Pill>
          </div>
        </div>
      </div>

      <div className="mt-16 hidden justify-end md:flex">
        <ScrollIndicator />
      </div>
    </PageShell>
  );
}
