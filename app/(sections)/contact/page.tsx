import { PageShell } from "@/components/PageShell";
import { MailIcon } from "@/components/icons";
import { ContactForm } from "./contact-form";

export default function ContactPage() {
  return (
    <PageShell variant="contact" watermark="CONTACT">
      <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">
        Contact
      </p>
      <h2 className="mt-2 font-display text-4xl font-bold text-ink sm:text-5xl">
        Let&apos;s talk
      </h2>

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
