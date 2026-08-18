import Image from "next/image";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";

const SPECS = [
  "Power supply: +10 V",
  "Quiescent current: no more than 10 mA",
  "No-load gain |Avo| at 1 kHz: 50 (±10%)",
  "Loaded gain (RL = 1 kΩ): at least 90% of no-load gain",
  "Input resistance at 1 kHz: at least 20 kΩ",
  "Frequency response: 20 Hz - 50 kHz (-3 dB)",
  "Transistors: BJT only, no more than 3 stages",
  "Resistors: E24 series, under 220 kΩ",
];

const VALUES = [
  {
    part: "R1 = R2 = 220 kΩ",
    reason:
      "maxed out on purpose - makes IB negligible next to IR1/IR2, and since R1, R2 >> rbe, Rin = R1 || R2 || rbe collapses to just rbe",
  },
  {
    part: "RE1 = 25 kΩ",
    reason:
      "raised specifically to push rbe1 (and therefore Rin) over the 20 kΩ floor - more emitter degeneration means lower Ic1, and rbe = βVT / Ic runs the other way",
  },
  {
    part: "RC = 7,829.49 Ω",
    reason:
      "solved directly from Av = -gm x RC to land the no-load gain within 10% of the required 50",
  },
  {
    part: "RE2 = 1.2 kΩ",
    reason:
      "chosen close to RL = 1 kΩ on purpose, so the emitter-follower's output resistance doesn't get dragged down once the load is actually attached",
  },
];

const SCORECARD = [
  { spec: "Power supply", expected: "10 V", measured: "10 V" },
  { spec: "Quiescent current", expected: "≤ 10 mA", measured: "0.206 mA / 6.35 mA" },
  { spec: "No-load gain |Avo|", expected: "50 ± 10%", measured: "51.14" },
  { spec: "Loaded gain |Av|", expected: "≥ 45", measured: "48.74" },
  { spec: "Input resistance", expected: "≥ 20 kΩ", measured: "23,488.38 Ω" },
  { spec: "Amplifier type", expected: "Inverting or non-inverting", measured: "Inverting" },
  { spec: "Stages", expected: "≤ 3, BJT only", measured: "2 (both 2N3904)" },
  { spec: "Waveform", expected: "Distortion-free", measured: "Distortion-free" },
];

/** The other hardware projects on the site (microprocessor, traffic light)
 * get a single overview paragraph, but this one has a full 11-page design
 * report behind it - real specs, real hand-derived component values, and
 * a real Multisim validation table - so the breakdown reproduces that
 * report's own structure (spec sheet -> topology -> derivation -> scorecard)
 * instead of another card grid. Every value below is pulled from it. */
export function MultistageAmpBreakdown() {
  return (
    <div className="mt-14 flex flex-col gap-14">
      <div>
        <h3 className="text-lg font-semibold text-ink">Why it exists</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          A 2-week individual design project, with two scheduled check-ins
          to review progress. The brief wasn&apos;t &quot;build an
          amplifier&quot; - it was &quot;build the one specific amplifier
          that simultaneously satisfies every line on this spec sheet,&quot;
          using only BJTs and parts from the course kit.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">
          Everything it had to hit at once
        </h3>
        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SPECS.map((s) => (
            <div
              key={s}
              className="rounded-xl border border-line bg-card-tint px-4 py-3 text-xs leading-relaxed text-ink-soft backdrop-blur-[6px]"
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">Two stages, one circuit</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          A common-emitter stage does the actual amplifying; a
          common-collector stage after it does nothing but protect that
          gain from the load. CE was chosen over CB because CB doesn&apos;t
          handle a small source resistance well, and CE still allows
          emitter degeneration despite inverting the signal. CC contributes
          almost no gain of its own - its entire job is to keep RL from
          loading down what Q1 already built.
        </p>
        <div className="mt-6 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <div className="flex-1 rounded-xl border border-line bg-card-tint px-4 py-3 text-center backdrop-blur-[6px]">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">Vi</p>
            <p className="mt-1 font-mono text-[11px] text-ink-soft">Rs = 600 Ω</p>
          </div>
          <ArrowRightIcon className="mx-auto h-4 w-4 shrink-0 rotate-90 text-ink-faint sm:mx-0 sm:rotate-0" aria-hidden="true" />
          <div className="flex-1 rounded-xl border border-line bg-card-tint px-4 py-3 text-center backdrop-blur-[6px]">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-soft">Q1 - CE stage</p>
            <p className="mt-1 font-mono text-[11px] text-ink-soft">2N3904 · RC 7.83kΩ · RE1 25kΩ</p>
          </div>
          <ArrowRightIcon className="mx-auto h-4 w-4 shrink-0 rotate-90 text-ink-faint sm:mx-0 sm:rotate-0" aria-hidden="true" />
          <div className="flex-1 rounded-xl border border-line bg-card-tint px-4 py-3 text-center backdrop-blur-[6px]">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-soft">Q2 - CC stage</p>
            <p className="mt-1 font-mono text-[11px] text-ink-soft">2N3904 · RE2 1.2kΩ</p>
          </div>
          <ArrowRightIcon className="mx-auto h-4 w-4 shrink-0 rotate-90 text-ink-faint sm:mx-0 sm:rotate-0" aria-hidden="true" />
          <div className="flex-1 rounded-xl border border-line bg-card-tint px-4 py-3 text-center backdrop-blur-[6px]">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">Vo</p>
            <p className="mt-1 font-mono text-[11px] text-ink-soft">RL = 1kΩ</p>
          </div>
        </div>

        <div className="circuit-diagram-wrap mt-6 overflow-hidden rounded-xl border border-line">
          <Image
            src="/projects/multi-stage-amplifier-circuit.png"
            alt="Multisim schematic of the two-stage BJT amplifier"
            width={891}
            height={566}
            className="circuit-diagram-image block h-auto w-full"
          />
        </div>
        <p className="mt-2 text-xs text-ink-faint">
          The actual Multisim schematic - Q1&apos;s CE stage on the left, Q2&apos;s CC stage on the right.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">
          Component values, chosen not guessed
        </h3>
        <div className="mt-6 flex flex-col gap-3">
          {VALUES.map((v) => (
            <div
              key={v.part}
              className="rounded-2xl border border-line bg-card-tint p-4 backdrop-blur-[6px]"
            >
              <p className="font-mono text-sm text-accent-soft">{v.part}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                {v.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">The scorecard</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Expected vs. measured, straight from the final Multisim
          validation pass:
        </p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-card-tint backdrop-blur-[6px]">
          {SCORECARD.map((row, i) => (
            <div
              key={row.spec}
              className={`flex items-center justify-between gap-3 px-4 py-3 text-xs sm:text-sm ${
                i !== 0 ? "border-t border-line" : ""
              }`}
            >
              <span className="w-1/3 shrink-0 font-medium text-ink">{row.spec}</span>
              <span className="flex-1 text-right font-mono text-[11px] text-ink-faint sm:text-xs">
                {row.expected}
              </span>
              <span className="flex-1 text-right font-mono text-[11px] text-ink-soft sm:text-xs">
                {row.measured}
              </span>
              <CheckIcon className="h-4 w-4 shrink-0 text-accent-soft" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">
          The one spec that didn&apos;t fully land
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          The output swing requirement - several volts peak-to-peak,
          no-load - came in well under target in simulation (closer to
          half a volt), even though the gain measured within tolerance.
          Solving for the exact source voltage that would hit the target
          swing produced a badly distorted waveform instead, so a smaller,
          distortion-free Vs was kept deliberately over one that hit the
          swing spec on paper. The report is upfront about the tradeoff
          rather than hiding it: fixing the swing needed more than
          adding another stage, since gain wasn&apos;t the actual
          bottleneck.
        </p>
      </div>

      <p className="max-w-xl text-sm leading-relaxed text-ink-soft">
        Solo work, using only parts from the course&apos;s ELE404 kit.
        Everything above was hand-derived first - small-signal analysis,
        KCL/KVL on the biasing network, solving for rbe and gm - and then
        checked against Multisim before anything was called finished.
      </p>
    </div>
  );
}
