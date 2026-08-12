import { PageShell } from "@/components/PageShell";
import { StubSection } from "@/components/StubSection";

export default function OpenSourcePage() {
  return (
    <PageShell variant="default" watermark="OPEN SOURCE">
      <StubSection
        eyebrow="Open Source"
        heading="Open Source"
        body="A running log of open-source contributions and side projects is on its way. In the meantime, the GitHub link in the sidebar has the full picture."
      />
    </PageShell>
  );
}
