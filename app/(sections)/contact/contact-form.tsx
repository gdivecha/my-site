"use client";

import { useState, type FormEvent } from "react";

const inputClasses =
  "w-full rounded-lg border border-line bg-panel-alt px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-accent/50";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // No backend wired up yet — this just confirms the form works end to end.
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-line bg-panel p-8 text-center">
        <p className="text-sm text-ink-soft">
          Thanks for reaching out — this is a placeholder confirmation until a
          real send action is wired up.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="firstName"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-faint"
          >
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            className={inputClasses}
          />
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-faint"
          >
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            className={inputClasses}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-faint"
        >
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className={inputClasses}
        />
      </div>

      <div>
        <label
          htmlFor="subject"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-faint"
        >
          What is it regarding?
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          className={inputClasses}
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-faint"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className={`${inputClasses} resize-none`}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-accent-deep"
        >
          Send
        </button>
      </div>
    </form>
  );
}
