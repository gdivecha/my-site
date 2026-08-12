import { PageHeading } from "@/components/PageHeading";
import { PageShell } from "@/components/PageShell";
import { MailIcon } from "@/components/icons";
import { ContactForm } from "./contact-form";

export default function ContactPage() {
  return (
    <PageShell watermark="CONTACT">
      <PageHeading eyebrow="Contact">Let&apos;s talk</PageHeading>

      <div className="mt-8 max-w-xl">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-white py-10">
          <span className="h-px w-16 bg-accent-contact" />
          <MailIcon className="h-14 w-14 text-black" strokeWidth={1.4} />
          <span className="h-px w-16 bg-accent-contact" />
        </div>

        <div className="mt-8 rounded-2xl border border-line bg-panel p-6 md:p-8">
          <ContactForm />
        </div>
      </div>
    </PageShell>
  );
}
