import Image from "next/image";
import { ArrowRightIcon } from "@/components/icons";

const ALUS = [
  {
    name: "ALU_1",
    subtitle: "The default instruction set",
    ops: [
      "sum(A, B)",
      "diff(A, B)",
      "NOT A",
      "NAND(A, B)",
      "NOR(A, B)",
      "AND(A, B)",
      "XOR(A, B)",
      "OR(A, B)",
      "XNOR(A, B)",
    ],
  },
  {
    name: "ALU_2",
    subtitle: "A personally assigned instruction set",
    ops: [
      "splice odd bits of A with odd bits of B",
      "NAND(A, B)",
      "sum(A, B) - 5",
      "2's complement of B",
      "invert the even bits of B",
      "shift A left 2 bits (new bits = 0)",
      "always output 0",
      "2's complement of A",
      "rotate B right 2 bits",
    ],
  },
  {
    name: "ALU_3",
    subtitle: "Not arithmetic at all - a comparator",
    ops: [
      "compare each hex digit of A against the FSM's current output digit",
      "Y = 1 if either digit of A is larger, else Y = 0",
    ],
  },
];

/** The report's own structure is three ALUs sharing one control unit, so
 * the breakdown leans into that three-way comparison as its centerpiece -
 * a shape none of the other breakdowns use - instead of another single
 * architecture diagram. Every op list, signal name, and bug below is
 * pulled straight from the VHDL and the report's own write-up. */
export function MicroprocessorBreakdown() {
  return (
    <div className="mt-14 flex flex-col gap-14">
      <div>
        <h3 className="text-lg font-semibold text-ink">Why it exists</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          The final project in a digital logic course, meant to fold every
          earlier assignment&apos;s building block into one working circuit -
          latches, a finite state machine, a decoder, and an ALU - all
          driven by a single clock and implemented on an FPGA board.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">Four components, one clock</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Two independent paths meet at the ALU: the data path just holds
          the operands, while the control path decides what to do with
          them.
        </p>
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <div className="flex-1 rounded-xl border border-line bg-card-tint px-4 py-3 text-center backdrop-blur-[6px]">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">Data path</p>
              <p className="mt-1 font-mono text-[11px] text-ink-soft">A, B</p>
            </div>
            <ArrowRightIcon className="mx-auto h-4 w-4 shrink-0 rotate-90 text-ink-faint sm:mx-0 sm:rotate-0" aria-hidden="true" />
            <div className="flex-1 rounded-xl border border-line bg-card-tint px-4 py-3 text-center backdrop-blur-[6px]">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent-soft">Latch1 / Latch2</p>
              <p className="mt-1 font-mono text-[11px] text-ink-soft">gated D, active-low reset</p>
            </div>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <div className="flex-1 rounded-xl border border-line bg-card-tint px-4 py-3 text-center backdrop-blur-[6px]">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">Control path</p>
              <p className="mt-1 font-mono text-[11px] text-ink-soft">data_in</p>
            </div>
            <ArrowRightIcon className="mx-auto h-4 w-4 shrink-0 rotate-90 text-ink-faint sm:mx-0 sm:rotate-0" aria-hidden="true" />
            <div className="flex-1 rounded-xl border border-line bg-card-tint px-4 py-3 text-center backdrop-blur-[6px]">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent-soft">FSM (Moore)</p>
              <p className="mt-1 font-mono text-[11px] text-ink-soft">9 states, s0 - s8</p>
            </div>
            <ArrowRightIcon className="mx-auto h-4 w-4 shrink-0 rotate-90 text-ink-faint sm:mx-0 sm:rotate-0" aria-hidden="true" />
            <div className="flex-1 rounded-xl border border-line bg-card-tint px-4 py-3 text-center backdrop-blur-[6px]">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent-soft">4:16 decoder</p>
              <p className="mt-1 font-mono text-[11px] text-ink-soft">one-hot, 16-bit op call</p>
            </div>
          </div>
          <ArrowRightIcon className="mx-auto h-4 w-4 shrink-0 rotate-90 text-ink-faint" aria-hidden="true" />
          <div className="rounded-xl border border-line bg-card-tint px-4 py-3 text-center backdrop-blur-[6px]">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-soft">ALU core</p>
            <p className="mt-1 font-mono text-[11px] text-ink-soft">Result[7:0], Neg</p>
          </div>
        </div>

        <div className="circuit-diagram-wrap mt-6 overflow-hidden rounded-xl border border-line">
          <Image
            src="/projects/microprocessor-block-schematic.png"
            alt="Quartus block schematic wiring the latches, FSM, decoder, and ALU together"
            width={614}
            height={352}
            className="circuit-diagram-image block h-auto w-full"
          />
        </div>
        <p className="mt-2 text-xs text-ink-faint">
          The actual Quartus schematic - both latches and the control unit feeding the ALU core.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">
          A state machine with a signature
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          The FSM cycles s0 through s8 one step at a time on each
          data_in pulse, wrapping back to s0 after. Every state does two
          things at once: it outputs one fixed digit of a personal 9-digit
          sequence baked directly into the VHDL (a small way of signing
          the circuit), and it passes its own 4-bit state value to the
          decoder, which turns it into a 16-bit one-hot code - exactly one
          bit set, uniquely identifying which of the ALU&apos;s nine
          functions to run next.
        </p>

        <div className="circuit-diagram-wrap mt-6 max-w-xs overflow-hidden rounded-xl border border-line">
          <Image
            src="/projects/microprocessor-fsm-diagram.png"
            alt="Moore state diagram showing the nine-state cycle s0 through s8"
            width={406}
            height={395}
            className="circuit-diagram-image block h-auto w-full"
          />
        </div>
        <p className="mt-2 text-xs text-ink-faint">
          The actual Moore state diagram - nine states, each with its own fixed output digit.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">
          Three ALUs, three assignments
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Same latches, same FSM, same decoder, same 16-bit op-call
          convention - the only thing that changes between problems is
          what each of the nine codes actually means:
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {ALUS.map((alu) => (
            <div
              key={alu.name}
              className="rounded-2xl border border-line bg-card-tint p-4 backdrop-blur-[6px]"
            >
              <p className="font-mono text-sm font-semibold text-accent-soft">{alu.name}</p>
              <p className="mt-1 text-xs text-ink-faint">{alu.subtitle}</p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {alu.ops.map((op) => (
                  <li key={op} className="font-mono text-[11px] leading-relaxed text-ink-soft">
                    {op}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">What actually broke</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Three real bugs from the build, straight from the report&apos;s
          own troubleshooting notes:
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <div className="rounded-2xl border border-line bg-card-tint p-4 backdrop-blur-[6px]">
            <p className="text-sm font-semibold text-ink">Inverted reset polarity</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              The latches were written to clear on Resetn = &apos;0&apos;,
              but the reference waveform used to check against reset with a
              &apos;1&apos; - every comparison against it looked like a
              failure until the actual mismatch was spotted.
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-card-tint p-4 backdrop-blur-[6px]">
            <p className="text-sm font-semibold text-ink">
              Quartus project corruption
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              Splitting waveforms across multiple simulation files inside
              one project (against the manual&apos;s advice) quietly
              corrupted files, so new inputs kept replaying old outputs -
              fixed only by starting a clean project.
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-card-tint p-4 backdrop-blur-[6px]">
            <p className="text-sm font-semibold text-ink">
              A silently-zeroed variable
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              ALU_2&apos;s &quot;sum(A, B) - 5&quot; function first summed
              into a new intermediate signal, then subtracted 5 from it -
              but Quartus reset that signal to 0 first, turning the result
              into -5. Assigning straight into the existing result signal
              instead of a fresh one fixed it.
            </p>
          </div>
        </div>
      </div>

      <p className="max-w-xl text-sm leading-relaxed text-ink-soft">
        Solo work in VHDL, synthesized and simulated in Quartus. Each
        component was verified against its own waveform before being
        wired into the next - latches, then the FSM, then the decoder,
        then each ALU - so every failure could be traced to exactly one
        piece rather than the whole circuit at once.
      </p>
    </div>
  );
}
