function MatrixBox({ rows, small = false }: { rows: string[][]; small?: boolean }) {
  return (
    <div
      className="inline-grid gap-x-3 gap-y-1 rounded-lg border border-line bg-card-tint px-3 py-2 backdrop-blur-[6px]"
      style={{ gridTemplateColumns: `repeat(${rows[0].length}, minmax(0,1fr))` }}
    >
      {rows.flat().map((cell, i) => (
        <span
          key={i}
          className={`text-center font-mono ${small ? "text-xs" : "text-sm"} text-ink-soft`}
        >
          {cell}
        </span>
      ))}
    </div>
  );
}

const MINORS = [
  { sign: "+a", exclude: "exclude row 1, col 1", rows: [["e", "f"], ["h", "i"]], formula: "= ei - fh" },
  { sign: "-b", exclude: "exclude row 1, col 2", rows: [["d", "f"], ["g", "i"]], formula: "= di - fg" },
  { sign: "+c", exclude: "exclude row 1, col 3", rows: [["d", "e"], ["g", "h"]], formula: "= dh - eg" },
];

/** Everything else on this site's project pages is UI or architecture -
 * this one is a single recursive algorithm, so the breakdown's centerpiece
 * is the actual math it recurses through (a real cofactor expansion,
 * matching determinant()'s literal loop/sign logic) rather than another
 * diagram of boxes and arrows. */
export function CramersBreakdown() {
  return (
    <div className="mt-14 flex flex-col gap-14">
      <div>
        <h3 className="text-lg font-semibold text-ink">Why it exists</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Built independently right after finishing the JavaFX GUI for{" "}
          <span className="font-medium text-ink">Building a GUI for a
          Bookstore Application</span> and a Data Structures &amp; Algorithms
          course - a self-set challenge to put newly learned recursion and
          older linear algebra to work on the same problem.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">The recursion, worked out</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          <span className="font-mono text-ink">determinant()</span> expands
          along the top row: each entry is multiplied by the determinant of
          the smaller matrix left over once that entry&apos;s row and column
          are excluded, with the sign flipping every other term. Below 3x3
          it recurses again on each of those minors; at 2x2 it just solves
          directly.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <MatrixBox rows={[["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"]]} />
          <div className="mt-2 flex flex-wrap items-stretch justify-center gap-4">
            {MINORS.map((m) => (
              <div
                key={m.sign}
                className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-card-tint p-4 backdrop-blur-[6px]"
              >
                <p className="font-mono text-xs text-accent-soft">{m.sign}</p>
                <p className="font-mono text-[10px] text-ink-faint">{m.exclude}</p>
                <MatrixBox rows={m.rows} small />
                <p className="font-mono text-[11px] text-ink-soft">{m.formula}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 font-mono text-sm text-ink">
            det = a(ei - fh) - b(di - fg) + c(dh - eg)
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">Cramer&apos;s Rule, applied literally</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          <span className="font-mono text-ink">findColDeterminant()</span>{" "}
          computes the coefficient matrix&apos;s determinant once. Then, for
          each variable, it temporarily swaps that variable&apos;s column
          for the equations&apos; result values, recomputes the determinant,
          divides by the original, and swaps the column back before moving
          to the next variable - the same matrix reused in place rather than
          re-cloned each time. If the original determinant is 0, the system
          has no unique solution, and the calculator surfaces that as an
          error instead of dividing by zero.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">The actual flow</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          A plain JavaFX GridPane UI, resized on the fly to fit however
          large a system you set up:
        </p>
        <p className="mt-3 max-w-xl font-mono text-[12.5px] leading-loose text-ink-soft">
          Setup (rows, columns) &rarr; Calculator (n&times;n coefficients + n
          results)
          <br />
          &nbsp;&nbsp;&#9500;&#9472; Solve &rarr; Answer screen (Var #1...n)
          <br />
          &nbsp;&nbsp;&#9492;&#9472; det = 0 &rarr; &quot;invalid/no
          solutions&quot;
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
          Rows and columns have to match and be positive going in - anything
          else gets its own dedicated error screen instead of quietly
          failing.
        </p>
      </div>

      <p className="max-w-xl text-sm leading-relaxed text-ink-soft">
        The README carries its own disclaimer, kept as-is:{" "}
        <span className="italic text-ink-faint">
          &quot;These programs have been created to demonstrate my projects.
          They SHOULD NOT be used during EVALUATIONS and I am NOT responsible
          for ANY ACADEMIC MISCONDUCT charges landed on someone who uses
          them.&quot;
        </span>
      </p>
    </div>
  );
}
