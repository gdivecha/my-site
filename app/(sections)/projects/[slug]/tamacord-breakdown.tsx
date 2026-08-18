const AWARDS = ["Mini Win: Best Beginner", "The Wolfram Award"];

const VITALS = [
  {
    label: "Hunger",
    emoji: "🍕",
    action: "Feed",
    formula: "hunger -= 10 * (secondsSinceFed // 30)",
    dies: "hits 0 -> Dead (starved)",
    value: 7,
  },
  {
    label: "Hygiene",
    emoji: "🚿",
    action: "Wash",
    formula: "hygiene -= 10 * (secondsSinceWashed // 45)",
    dies: "hits 0 -> Sick",
    value: 4,
  },
  {
    label: "Happiness",
    emoji: "😄",
    action: "Pet",
    formula: "happy -= 10 * (secondsSincePet // 60)",
    dies: "hits 0 -> Away (fled)",
    value: 9,
  },
];

/** Tamacord is a real-time decay simulation wearing a Discord-bot costume,
 * so the breakdown reproduces its actual output - the literal emoji vitals
 * bars from botMain.py's check() command - rather than another pattern
 * grid or architecture diagram. Formulas, thresholds, and the state bug
 * below are pulled directly from Stats.py, Tamagotchi.py, and botMain.py. */
export function TamacordBreakdown() {
  return (
    <div className="mt-14 flex flex-col gap-14">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          {AWARDS.map((a) => (
            <span
              key={a}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card-tint px-3 py-1 text-xs text-ink-soft backdrop-blur-[6px]"
            >
              🏆 {a}
            </span>
          ))}
        </div>
        <h3 className="mt-4 text-lg font-semibold text-ink">Why it exists</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Built at RU Hacks 2022 by a team of four who grew up on real
          Tamagotchis, Tamacord brings the same pet back as a Discord bot -
          partly nostalgia, partly a first real project in Python and the
          Nextcord API.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">
          Three needs, decaying in real time
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Nothing ticks on a timer loop - every stat is recalculated from
          real elapsed time the moment you run{" "}
          <span className="font-mono text-ink">$check</span>, straight from
          the actual formulas:
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {VITALS.map((v) => (
            <div
              key={v.label}
              className="rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[6px]"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink">
                  {v.label}
                  <span className="ml-2 font-mono text-xs font-normal text-ink-faint">
                    {v.action} button: +30, resets the timer
                  </span>
                </p>
                <p className="text-sm tracking-wide">
                  {v.emoji.repeat(v.value)}
                </p>
              </div>
              <p className="mt-2 font-mono text-xs text-accent-soft">
                {v.formula}
              </p>
              <p className="mt-1 text-xs text-ink-faint">{v.dies}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
          Age climbs the same way - elapsed time since birth, divided by 70
          - so a pet left alone doesn&apos;t just stay put, it visibly gets
          older while it&apos;s starving.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">
          A pet that can actually die
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Any stat bottoming out flips the pet into a terminal state, and{" "}
          <span className="font-mono text-ink">picStatus()</span> swaps in
          one of eight hand-drawn sprites to match - Baby, Happy, Hungry,
          Sad, Dirty, Sick, Dead, or Fled:
        </p>
        <div className="mt-4 flex flex-col gap-1.5 rounded-2xl border border-line bg-card-tint p-4 backdrop-blur-[6px]">
          <p className="font-mono text-[11px] leading-relaxed text-ink-soft">
            <span className="text-ink">Alive</span>{" "}
            <span className="text-ink-faint">- hunger reaches 0 -&gt;</span>{" "}
            <span className="text-ink">Dead</span>
          </p>
          <p className="font-mono text-[11px] leading-relaxed text-ink-soft">
            <span className="text-ink">Alive</span>{" "}
            <span className="text-ink-faint">- hygiene reaches 0 -&gt;</span>{" "}
            <span className="text-ink">Sick</span>
          </p>
          <p className="font-mono text-[11px] leading-relaxed text-ink-soft">
            <span className="text-ink">Alive</span>{" "}
            <span className="text-ink-faint">- happiness reaches 0 -&gt;</span>{" "}
            <span className="text-ink">Away</span>
          </p>
        </div>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
          One real quirk in the source: the sickness check in{" "}
          <span className="font-mono text-ink">botMain.py</span> compares
          against a lowercase{" "}
          <span className="font-mono text-ink">&apos;sick&apos;</span>,
          while <span className="font-mono text-ink">Stats.py</span> sets
          the state to a capitalized{" "}
          <span className="font-mono text-ink">&apos;Sick&apos;</span> - so
          in practice it&apos;s the hygiene stat hitting zero, not the state
          flag, that actually ends the pet&apos;s life.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">
          &quot;Cloud storage,&quot; one CSV at a time
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          There&apos;s no real database behind it - every pet is a single
          row written to a local CSV, uploaded to a Google Cloud Storage
          bucket keyed by Discord user ID, then deleted locally. Checking
          on your pet downloads that same file back down, reads the one
          row, and removes it again.
        </p>
      </div>

      <p className="max-w-xl text-sm leading-relaxed text-ink-soft">
        Built in Python with the Nextcord API over a hackathon weekend by a
        team of four with little prior experience in either - a stalled{" "}
        <span className="font-mono text-ink">view.wait()</span> call and a
        misbehaving button flow were the two hardest bugs to run down before
        the pet worked end to end.
      </p>
    </div>
  );
}
