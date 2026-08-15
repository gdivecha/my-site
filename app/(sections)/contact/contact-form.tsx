"use client";

import { useRef, useState, type FormEvent } from "react";

const inputClasses =
  "w-full rounded-lg border border-line bg-input-bg px-4 py-2.5 text-sm text-ink placeholder:text-input-placeholder outline-none transition-colors focus:border-accent/50";

const COOLDOWN_MS = 20_000;

// No backend is wired up yet (see the submit handler below), so none of
// this is a substitute for real server-side checks — a determined bot
// can just skip running this JS entirely. It's the free, no-account
// front line: a honeypot to catch naive bots, a few heuristics to catch
// obvious link-spam/garbage, and a client-side cooldown to stop rapid
// repeat submits. Add real (server-side) validation alongside these,
// not instead of them, once this actually sends somewhere.
function validate(values: {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}): string | null {
  const { firstName, lastName, email, subject, message } = values;

  if (![firstName, lastName, email, subject, message].every((v) => v.trim())) {
    return "Please fill in every field.";
  }

  const urlCount = (message.match(/https?:\/\/\S+|www\.\S+/gi) ?? []).length;
  if (urlCount >= 3) {
    return "That message is mostly links — please rewrite it without so many URLs.";
  }

  const letters = message.replace(/[^a-zA-Z]/g, "").length;
  if (message.trim().length > 8 && letters / message.length < 0.3) {
    return "That message doesn't look like readable text — please rewrite it.";
  }

  return null;
}

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSubmitRef = useRef(0);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot: invisible to real visitors, irresistible to form-filling
    // bots. A non-empty value means it's a bot — pretend it worked so it
    // doesn't learn to adapt, but don't actually treat it as sent.
    if (String(data.get("website") ?? "").trim()) {
      setSent(true);
      return;
    }

    const now = Date.now();
    if (now - lastSubmitRef.current < COOLDOWN_MS) {
      setError("Please wait a few seconds before sending another message.");
      return;
    }

    const values = {
      firstName: String(data.get("firstName") ?? ""),
      lastName: String(data.get("lastName") ?? ""),
      email: String(data.get("email") ?? ""),
      subject: String(data.get("subject") ?? ""),
      message: String(data.get("message") ?? ""),
    };
    const validationError = validate(values);
    if (validationError) {
      setError(validationError);
      return;
    }

    // No backend wired up yet — this just confirms the form works end to end.
    lastSubmitRef.current = now;
    setError(null);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-line bg-panel p-8 text-center">
        <p className="text-sm text-ink-soft">
          Thanks for reaching out - this is a placeholder confirmation until a
          real send action is wired up.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Honeypot field — hidden off-screen (not display:none, which some
          bots detect and skip) rather than shown and styled away, and
          excluded from tab order / screen readers since no real visitor
          should ever reach it. */}
      <div className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

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

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-deep"
        >
          Send
        </button>
      </div>
    </form>
  );
}
