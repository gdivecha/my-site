"use client";

import { useState, type FormEvent } from "react";

const inputClasses =
  "w-full rounded-lg border border-line bg-input-bg px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-accent/50";

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
        <input
          id="firstName"
          name="firstName"
          type="text"
          placeholder="First Name"
          aria-label="First Name"
          required
          className={inputClasses}
        />
        <input
          id="lastName"
          name="lastName"
          type="text"
          placeholder="Last Name"
          aria-label="Last Name"
          required
          className={inputClasses}
        />
      </div>

      <input
        id="email"
        name="email"
        type="email"
        placeholder="Email Address"
        aria-label="Email Address"
        required
        className={inputClasses}
      />

      <input
        id="subject"
        name="subject"
        type="text"
        placeholder="Subject"
        aria-label="Subject"
        required
        className={inputClasses}
      />

      <textarea
        id="message"
        name="message"
        rows={5}
        placeholder="Message"
        aria-label="Message"
        required
        className={`${inputClasses} resize-none`}
      />

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
