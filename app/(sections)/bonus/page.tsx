import { PageShell } from "@/components/PageShell";
import { StubSection } from "@/components/StubSection";

export default function BonusPage() {
  return (
    <PageShell variant="default" watermark="BONUS">
      <StubSection
        eyebrow="Bonus"
        heading="Bonus"
        body="A grab-bag of extras — talks, art, side quests, whatever didn't fit anywhere else on this site."
      />
    </PageShell>
  );
}
