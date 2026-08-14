import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import { ContactForm } from "./contact-form";

export default function ContactPage() {
  return (
    <PageShell watermark="CONTACT">
      <PageHeading eyebrow="Contact">Let&apos;s talk</PageHeading>

      <div className="mt-8 max-w-xl">
        <div className="rounded-2xl border border-line bg-card-tint p-6 backdrop-blur-[3.8px] md:p-8">
          <ContactForm />
        </div>
      </div>
    </PageShell>
  );
}
