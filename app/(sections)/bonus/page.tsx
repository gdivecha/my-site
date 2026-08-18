import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { StubSection } from "@/components/StubSection";

export const metadata: Metadata = {
  title: "Bonus",
  description:
    "A grab-bag of extras - talks, art, side quests, whatever didn't fit anywhere else on this site.",
};

export default function BonusPage() {
  return (
    <PageShell watermark="BONUS">
      <StubSection
        eyebrow="Bonus"
        heading="Bonus"
        body="A grab-bag of extras - talks, art, side quests, whatever didn't fit anywhere else on this site."
      />
    </PageShell>
  );
}
