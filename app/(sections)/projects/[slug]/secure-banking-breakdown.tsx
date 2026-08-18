import { ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon, LockIcon } from "@/components/icons";

type Step =
  | { kind: "message"; from: "Client" | "Server"; to: "Client" | "Server"; detail: string }
  | { kind: "compute"; detail: string };

const STEPS: Step[] = [
  {
    kind: "message",
    from: "Client",
    to: "Server",
    detail: '{ username, password, nonce_client } - encrypted + HMAC’d with the pre-shared key',
  },
  {
    kind: "message",
    from: "Server",
    to: "Client",
    detail: "{ nonce_client, nonce_server, master_secret } - same pre-shared key",
  },
  {
    kind: "compute",
    detail:
      "both sides independently derive MasterSecret = SHA256(shared_key ‖ nonce_client ‖ nonce_server), then split it into a fresh enc_key and mac_key for this session",
  },
  {
    kind: "message",
    from: "Client",
    to: "Server",
    detail: '{ action: "deposit", amount } - encrypted + HMAC’d with the new session keys',
  },
  {
    kind: "message",
    from: "Server",
    to: "Client",
    detail: "{ status, balance } - same session keys, every transaction re-sealed independently",
  },
];

function SequenceStep({ step }: { step: Step }) {
  if (step.kind === "compute") {
    return (
      <div className="mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-dashed border-line bg-card-tint p-4 backdrop-blur-[6px]">
        <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-soft" aria-hidden="true" />
        <p className="font-mono text-[11px] leading-relaxed text-ink-soft">{step.detail}</p>
      </div>
    );
  }

  const clientToServer = step.from === "Client";
  return (
    <div className={`flex flex-col gap-1.5 ${clientToServer ? "" : "items-end text-right"}`}>
      <div
        className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-widest ${
          clientToServer ? "text-accent-soft" : "flex-row-reverse text-ink-faint"
        }`}
      >
        <span>{step.from}</span>
        {clientToServer ? (
          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        <span>{step.to}</span>
      </div>
      <p className="max-w-md font-mono text-[11px] leading-relaxed text-ink-soft">
        {step.detail}
      </p>
    </div>
  );
}

const LIMITATIONS = [
  {
    title: "Plaintext passwords",
    detail: "users.json stores them as-is - the source even says so in its own comment.",
  },
  {
    title: "In-memory balances",
    detail: "Every balance lives in a dict on the server. Restart it, and the bank forgets everyone.",
  },
  {
    title: "The master secret rides along",
    detail: "It's sent back to the client instead of purely derived in parallel - safe only because that message is itself already sealed under the pre-shared key.",
  },
];

/** This project's whole point is a security protocol, not a UI or an
 * algorithm, so the breakdown leans on three concrete visual devices - a
 * sequence diagram, a byte-layout bar, and a plaintext-to-ciphertext
 * transform - instead of explaining the protocol in prose. Every field,
 * byte count, and limitation below is pulled straight from crypto_util.py,
 * client_core.py, and server_core.py. */
export function SecureBankingBreakdown() {
  return (
    <div className="mt-14 flex flex-col gap-14">
      <div>
        <h3 className="text-lg font-semibold text-ink">Why it exists</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          A simulated bank server and ATM client where security is the
          actual subject, not an afterthought bolted onto a CRUD app - built
          to understand what a real authenticated protocol has to do at
          the byte level, without leaning on an existing TLS library to do
          it invisibly.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">The handshake</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Login doesn&apos;t just check a password - it bootstraps a whole
          new set of keys for everything that follows:
        </p>
        <div className="mt-6 flex flex-col gap-5">
          {STEPS.map((step, i) => (
            <SequenceStep key={i} step={step} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">Every transaction, sealed twice</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Nothing rides on one long encrypted pipe - login, a deposit, a
          balance check, each one is its own self-contained envelope, built
          the same way every time:
        </p>
        <div className="mt-6 flex h-16 overflow-hidden rounded-xl border border-line">
          <div className="flex basis-[18%] flex-col items-center justify-center gap-0.5 bg-tag-bg px-2">
            <span className="font-mono text-xs font-semibold text-accent-soft">IV</span>
            <span className="text-[10px] text-ink-faint">16 bytes, random</span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-0.5 bg-card-tint px-2 backdrop-blur-[6px]">
            <span className="font-mono text-xs font-semibold text-ink">AES-CBC ciphertext</span>
            <span className="text-[10px] text-ink-faint">the actual message, encrypted</span>
          </div>
          <div className="flex basis-[24%] flex-col items-center justify-center gap-0.5 bg-tag-bg px-2">
            <span className="font-mono text-xs font-semibold text-accent-soft">HMAC-SHA256</span>
            <span className="text-[10px] text-ink-faint">32 bytes</span>
          </div>
        </div>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
          Exactly what goes out over the socket. The receiving side splits
          the last 32 bytes off first and verifies them against everything
          before it - decryption never even starts if that check fails.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">
          A log even the server operator can&apos;t casually read
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Every deposit, withdrawal, and balance inquiry goes through the
          same transform before it ever touches disk:
        </p>
        <div className="mt-6 flex flex-col items-center gap-2">
          <div className="w-full max-w-sm rounded-xl border border-line bg-card-tint px-4 py-2.5 text-center font-mono text-[11px] text-ink-soft backdrop-blur-[6px]">
            alice|deposit|50.0|2026-08-17T22:05:11
          </div>
          <ChevronDownIcon className="h-4 w-4 text-ink-faint" aria-hidden="true" />
          <div className="w-full max-w-sm rounded-xl border border-line bg-card-tint px-4 py-2.5 text-center font-mono text-[11px] text-accent-soft backdrop-blur-[6px]">
            AES-CBC(LOG_KEY) &rarr; base64
          </div>
          <ChevronDownIcon className="h-4 w-4 text-ink-faint" aria-hidden="true" />
          <div className="w-full max-w-sm truncate rounded-xl border border-line bg-card-tint px-4 py-2.5 text-center font-mono text-[11px] text-ink-faint backdrop-blur-[6px]">
            Jk3nF7q9XvL2mQpR8t...== (one line in audit.log)
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl border border-line bg-card-tint p-4 backdrop-blur-[6px]">
            <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-soft" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-ink">Session key</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
                Decrypts your own transactions. Gone the moment you log out.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-line bg-card-tint p-4 backdrop-blur-[6px]">
            <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-ink">Log key</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
                Decrypts the audit trail. Never sent anywhere - it just
                stays on the server.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">What&apos;s honestly still a demo</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          A few simplifications, left in on purpose rather than hidden:
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {LIMITATIONS.map((l) => (
            <div
              key={l.title}
              className="rounded-2xl border border-line bg-card-tint p-4 backdrop-blur-[6px]"
            >
              <p className="text-sm font-semibold text-ink">{l.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{l.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="max-w-xl text-sm leading-relaxed text-ink-soft">
        Solo work in Python with PyCryptodome for the actual cryptography,
        raw sockets for transport, and Tkinter GUIs wrapping both the
        client and the server on top of the same core logic used by their
        terminal versions.
      </p>
    </div>
  );
}
