type VennMode = "intersection" | "union" | "diff";

function VennDiagram({ mode }: { mode: VennMode }) {
  const cx1 = 28;
  const cx2 = 52;
  const cy = 30;
  const r = 21;

  return (
    <svg viewBox="0 0 80 60" className="h-14 w-20 shrink-0" aria-hidden="true">
      <defs>
        <clipPath id={`venn-${mode}-a`}>
          <circle cx={cx1} cy={cy} r={r} />
        </clipPath>
        <mask id={`venn-${mode}-mask-a`}>
          <rect x="0" y="0" width="80" height="60" fill="white" />
          <circle cx={cx2} cy={cy} r={r} fill="black" />
        </mask>
        <mask id={`venn-${mode}-mask-b`}>
          <rect x="0" y="0" width="80" height="60" fill="white" />
          <circle cx={cx1} cy={cy} r={r} fill="black" />
        </mask>
      </defs>

      {mode === "union" && (
        <g className="text-accent-soft/30" fill="currentColor">
          <circle cx={cx1} cy={cy} r={r} />
          <circle cx={cx2} cy={cy} r={r} />
        </g>
      )}
      {mode === "intersection" && (
        <circle
          cx={cx2}
          cy={cy}
          r={r}
          className="text-accent-soft"
          fill="currentColor"
          clipPath={`url(#venn-${mode}-a)`}
        />
      )}
      {mode === "diff" && (
        <>
          <circle
            cx={cx1}
            cy={cy}
            r={r}
            className="text-accent-soft/55"
            fill="currentColor"
            mask={`url(#venn-${mode}-mask-a)`}
          />
          <circle
            cx={cx2}
            cy={cy}
            r={r}
            className="text-ink-faint/45"
            fill="currentColor"
            mask={`url(#venn-${mode}-mask-b)`}
          />
        </>
      )}

      <g className="text-line" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx={cx1} cy={cy} r={r} />
        <circle cx={cx2} cy={cy} r={r} />
      </g>
    </svg>
  );
}

const SPECS: { label: string; value: string; note: string }[] = [
  {
    label: "Member sync",
    value: "guild.members.fetch()",
    note: "run fresh before every check - Discord's local cache isn't guaranteed complete",
  },
  {
    label: "AND logic",
    value: "roleIds.every(id => member.roles.cache.has(id))",
    note: "/converge - member must hold every selected role",
  },
  {
    label: "OR logic",
    value: "cache.has(role1) || cache.has(role2)",
    note: "/crossrole - member only needs one",
  },
  {
    label: "Deploy scope",
    value: "Routes.applicationGuildCommands()",
    note: "registered to a single guild, not globally",
  },
  {
    label: "Dedup guard",
    value: "manualCommands.some(c => c.name === ...)",
    note: "skips a folder command already defined by hand",
  },
  {
    label: "Keep-alive",
    value: "express().listen(port)",
    note: "stops Render's free tier from spinning the bot down",
  },
];

const COMMANDS: {
  command: string;
  op: string;
  venn: VennMode;
  desc: string;
}[] = [
  {
    command: "/converge",
    op: "Intersection",
    venn: "intersection",
    desc: "Give it up to 12 roles and it finds every member who has all of them at once, with an option to ping the matches directly.",
  },
  {
    command: "/crossrole",
    op: "Union",
    venn: "union",
    desc: "Give it two roles and it finds every member who has either one - the wider net, for when 'and' is too strict.",
  },
  {
    command: "/rolediff",
    op: "Symmetric difference",
    venn: "diff",
    desc: "Give it two members and it shows what's shared, plus exactly what each one has that the other doesn't.",
  },
];

/** Nexora's three commands are literally set operations wearing a Discord
 * moderation-tool costume, so the breakdown leans into that directly - a
 * small hand-built Venn diagram per command, then a scannable spec-sheet
 * grid for the implementation details instead of a wall of prose. Every
 * value and behavior below is pulled from the real command files. */
export function NexoraBreakdown() {
  return (
    <div className="mt-14 flex flex-col gap-14">
      <div>
        <h3 className="text-lg font-semibold text-ink">Why it exists</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          A Discord server with a lot of custom roles - mentors, designers,
          backend, alumni - has no built-in way to ask &quot;who has all of
          these roles,&quot; &quot;who has either of these,&quot; or
          &quot;what&apos;s different between these two people&apos;s
          roles.&quot; Nexora treats roles as sets and gives moderators
          three slash commands to query them directly.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">
          Three commands, three set operations
        </h3>
        <div className="mt-6 flex flex-col gap-4">
          {COMMANDS.map((c) => (
            <div
              key={c.command}
              className="flex items-center gap-5 rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[6px]"
            >
              <VennDiagram mode={c.venn} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">
                  <span className="font-mono">{c.command}</span>
                  <span className="ml-2 font-mono text-xs font-normal text-ink-faint">
                    {c.op}
                  </span>
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {c.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">Under the hood</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Six real implementation details, pulled straight from the
          command handlers and the deploy script:
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SPECS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-line bg-card-tint p-4 backdrop-blur-[6px]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-soft">
                {s.label}
              </p>
              <p className="mt-1.5 break-words font-mono text-[12.5px] leading-snug text-ink">
                {s.value}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">
                {s.note}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="max-w-xl text-sm leading-relaxed text-ink-soft">
        A solo build in Node.js and discord.js, made for a server that had
        outgrown manually cross-referencing member lists by hand.
      </p>
    </div>
  );
}
