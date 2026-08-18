const EMBED_COLOR = "#1E90FF";

const POST_FIELDS: { label: string; value: string }[] = [
  { label: "Company", value: "Acme Corp" },
  { label: "Employment Type", value: "Internship" },
  { label: "Location", value: "Remote" },
  { label: "Link", value: "acme.com/careers/1432" },
  { label: "Job ID", value: "1432" },
  { label: "Term", value: "Fall 2026" },
];

const LEADERBOARD_ROWS = [
  { medal: "🥇", who: "Member A", posts: 14, reactions: 22, avgReactions: "1.57", avgPerWeek: "3.20" },
  { medal: "🥈", who: "Member B", posts: 9, reactions: 11, avgReactions: "1.22", avgPerWeek: "2.05" },
  { medal: "🥉", who: "Member C", posts: 6, reactions: 8, avgReactions: "1.33", avgPerWeek: "1.40" },
];

/** App.ly's real trick is that it keeps no database at all - every stat
 * command re-derives everything live from the channel's own message
 * history. So instead of an architecture diagram, this breakdown leans
 * into reproducing what the bot actually outputs (real embed fields,
 * real leaderboard format) and explaining how it gets there with nothing
 * but message.content parsing and reaction lookups. Field names, regexes,
 * and the medal/format logic below are pulled straight from the source. */
export function ApplyBotBreakdown() {
  return (
    <div className="mt-14 flex flex-col gap-14">
      <div>
        <h3 className="text-lg font-semibold text-ink">Why it exists</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          In a career-focused Discord server, job and internship postings
          get shared constantly - and immediately buried in chat, with no
          way to tell who applied, who&apos;s posting the most, or how
          you stack up against everyone else doing the same job hunt.
          App.ly turns every posting into a trackable object instead of a
          message that scrolls away.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">
          What /postjob actually posts
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          An example of the real output shape - same fields, same color,
          same auto-reaction, just placeholder values:
        </p>
        <div className="mt-4 max-w-md rounded-2xl border border-line bg-card-tint p-4 backdrop-blur-[6px]">
          <p className="text-xs leading-relaxed text-ink-faint">
            New Job posted by <span className="text-ink">@you</span> - Aug 17, 2026
          </p>
          <div className="mt-2 flex gap-3 rounded-lg bg-tag-bg/60 p-3">
            <div
              className="w-1 shrink-0 rounded-full"
              style={{ backgroundColor: EMBED_COLOR }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">
                Software Engineer Intern
              </p>
              <div className="mt-1.5 flex flex-col gap-0.5">
                {POST_FIELDS.map((f) => (
                  <p key={f.label} className="text-xs leading-relaxed text-ink-soft">
                    <span className="font-semibold text-ink">{f.label}:</span>{" "}
                    {f.value}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink-faint">
            ✅ Please react with a check mark if you applied to this job as well.
          </p>
        </div>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
          That plain-text opening line -{" "}
          <span className="font-mono text-ink">&quot;New Job posted by
          @user&quot;</span> - isn&apos;t just decoration. Every other
          command re-parses it later with a regex to figure out who
          posted what, since nothing about a job post is stored anywhere
          except that message itself.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">
          No database - just the channel&apos;s own history
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          <span className="font-mono text-ink">/stats</span>,{" "}
          <span className="font-mono text-ink">/leaderboard</span>, and{" "}
          <span className="font-mono text-ink">/rivals</span> all do the
          same thing under the hood: fetch the last 100 messages in the
          channel, keep only the bot&apos;s own job-post messages, then
          read each one&apos;s real ✅ reactions to count applicants -
          explicitly excluding the poster&apos;s own reaction so posting a
          job can&apos;t count as applying to it. From there it&apos;s all
          derived live: posts per week, a longest-streak count (checking
          for exact one-day gaps between sorted post dates), the most
          active poster and reactor, and time since the last post.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">The leaderboard</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Same medal format the real command outputs, filterable by{" "}
          <span className="font-mono text-ink">alltime</span>,{" "}
          <span className="font-mono text-ink">lastweek</span>, or{" "}
          <span className="font-mono text-ink">today</span>:
        </p>
        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-line bg-card-tint p-4 backdrop-blur-[6px]">
          {LEADERBOARD_ROWS.map((row) => (
            <p key={row.who} className="text-sm leading-relaxed text-ink-soft">
              <span className="mr-2">{row.medal}</span>
              <span className="font-medium text-ink">{row.who}</span>
              <br />
              <span className="font-mono text-xs text-ink-faint">
                {row.posts} total job posts · {row.reactions} reactions ·{" "}
                {row.avgReactions} Avg Reactions/Post · {row.avgPerWeek} Avg
                Posts/Week
              </span>
            </p>
          ))}
        </div>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
          <span className="font-mono text-ink">/rivals</span> is the same
          leaderboard from a narrower angle - instead of the whole ranked
          list, it just shows whoever&apos;s directly above and below you,
          a smaller nudge to keep posting rather than a wall of names.
        </p>
      </div>

      <p className="max-w-xl text-sm leading-relaxed text-ink-soft">
        A solo build in Node.js and discord.js. The zero-database design
        is a deliberate tradeoff, not an oversight - no infrastructure to
        host or pay for, at the cost of only ever seeing as far back as
        the channel&apos;s last 100 messages. Prune the channel, and that
        history is just gone.
      </p>
    </div>
  );
}
