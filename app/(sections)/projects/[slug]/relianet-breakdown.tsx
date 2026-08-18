import {
  CheckIcon,
  CloudIcon,
  DatabaseIcon,
  GlobeIcon,
  ShareNetworkIcon,
  SlidersIcon,
  StackedRowsIcon,
  WrenchIcon,
} from "@/components/icons";
import { Tag } from "@/components/Pill";

const USE_CASES = [
  "Humanitarian disaster response",
  "Emergency alert broadcasting",
  "Resilient news infrastructure",
];

const ARCHITECTURE = [
  {
    icon: GlobeIcon,
    name: "API Gateway",
    tech: "FastAPI",
    text: "The single entry point for every read and write. Instead of a hardcoded server address, it asks the Registry which nodes are healthy right now and routes there.",
  },
  {
    icon: SlidersIcon,
    name: "Registry",
    tech: "Service discovery",
    text: "The cluster's heartbeat monitor - sweeps every node over TCP, and evicts anything that stops responding before the gateway can route traffic to it.",
  },
  {
    icon: DatabaseIcon,
    name: "5 Peer Nodes",
    tech: "gRPC",
    text: "The actual database. Nodes talk to each other directly over gRPC to replicate writes and vote on reads, using strictly defined Protocol Buffers.",
  },
  {
    icon: WrenchIcon,
    name: "Anti-Entropy",
    tech: "RabbitMQ",
    text: "The background repair crew. A recovering node broadcasts a hash of its data over a message queue so healthy peers can detect drift and resync it - without touching live traffic.",
  },
  {
    icon: StackedRowsIcon,
    name: "Dashboard",
    tech: "Streamlit",
    text: "A real-time control room for the cluster - write data, run quorum reads, and watch replication, latency, and failures happen live.",
  },
];

const STATS = [
  { value: "5", label: "Nodes in the cluster" },
  { value: "40%", label: "Node loss survived live" },
  { value: "1.5s", label: "Before a slow node gets skipped" },
  { value: "~12s", label: "For a recovered node to catch up" },
];

const STEPS = [
  {
    icon: CloudIcon,
    title: "A write comes in",
    text: "The gateway checks which nodes are currently healthy and routes the request to one of them - never a hardcoded server.",
  },
  {
    icon: ShareNetworkIcon,
    title: "It's copied everywhere, instantly",
    text: "That node immediately pushes the data to the other four - like 5 people writing the same note in 5 separate notebooks at once.",
  },
  {
    icon: CheckIcon,
    title: "Reads need a majority",
    text: "Asking one notebook isn't enough - a read only counts once most of the 5 nodes agree on the answer.",
  },
  {
    icon: DatabaseIcon,
    title: "A dead node gets dropped",
    text: "If a node stops responding, it's evicted from the cluster and \"majority\" recalculates on the fly - 5 becomes 3, then 2.",
  },
  {
    icon: WrenchIcon,
    title: "It heals itself",
    text: "A node that comes back online compares notes with the others and automatically catches itself back up.",
  },
];

const TESTS = [
  {
    command: "$ docker stop node-1",
    note: "kills the entry node mid-write",
    result: "traffic rerouted automatically — zero downtime",
  },
  {
    command: "$ make stop4and5",
    note: "kills 2 of 5 nodes at once (40% of the cluster)",
    result: "quorum recalculated 3 → 2 — reads/writes kept working",
  },
  {
    command: "# inject 3s of lag on node-3",
    note: null,
    result: "the 1.5s gRPC timeout skipped it — rest of the cluster unaffected",
  },
  {
    command: "# restart a node holding stale data",
    note: null,
    result: "self-healed and rejoined the quorum in ~12s",
  },
];

/** ReliaNet gets its own breakdown instead of the generic title+paragraph
 * detail blocks every other project uses - a stat strip, a numbered
 * "how it works" flow, and a results grid from the actual chaos tests,
 * so someone without a distributed-systems background can scan it in
 * under a minute rather than read three paragraphs of prose. Kept
 * entirely static (no hover-to-reveal, no flip) - this site's own
 * house style favors visual structure over interaction gimmicks. */
export function ReliaNetBreakdown() {
  return (
    <div className="mt-14 flex flex-col gap-14">
      <div>
        <h3 className="text-lg font-semibold text-ink">Why it exists</h3>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[6px]">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
              The problem
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Most databases live on one server, or one data center.
              Destroy, flood, or cut the connection to that one place, and
              the whole application goes dark - taking every emergency
              alert and news update with it, right when they matter most.
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[6px]">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
              The fix
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Spread the same data across 5 independent servers with no
              single &quot;master.&quot; Losing any one of them - or even
              two at once - never takes the whole system down.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {USE_CASES.map((useCase) => (
            <Tag key={useCase}>{useCase}</Tag>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">
          The five moving parts
        </h3>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ARCHITECTURE.map((part) => {
            const Icon = part.icon;
            return (
              <div
                key={part.name}
                className="flex items-start gap-4 rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[6px]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tag-bg text-accent-soft">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">
                    {part.name}
                    <span className="ml-2 text-xs font-normal text-ink-faint">
                      {part.tech}
                    </span>
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {part.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">By the numbers</h3>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-line bg-card-tint p-4 text-center backdrop-blur-[6px]"
            >
              <p className="bg-gradient-to-r from-accent-soft to-accent-deep bg-clip-text text-2xl font-bold text-transparent">
                {stat.value}
              </p>
              <p className="mt-1 text-xs leading-snug text-ink-faint">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">How it works</h3>
        <ol className="relative mt-6 flex flex-col gap-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="relative pl-10">
                <span
                  className="absolute left-4 top-0 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full"
                  style={{
                    background: "var(--color-step-icon-bg)",
                    color: "var(--color-step-icon-fg)",
                  }}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="text-sm font-semibold text-ink">
                  {i + 1}. {step.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {step.text}
                </p>
              </li>
            );
          })}
        </ol>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">
          Verified by breaking it on purpose
        </h3>
        <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-card-tint backdrop-blur-[6px]">
          <div className="border-b border-line bg-tag-bg px-5 py-2.5">
            <p className="font-mono text-xs text-ink-faint">chaos-tests.log</p>
          </div>
          <div className="flex flex-col divide-y divide-line">
            {TESTS.map((test) => (
              <div key={test.command} className="px-5 py-4 font-mono text-sm">
                <p className="text-accent-soft">
                  {test.command}
                  {test.note && (
                    <span className="text-ink-faint"> # {test.note}</span>
                  )}
                </p>
                <p className="mt-1.5 text-ink-soft">→ {test.result}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">
          The team &amp; what&apos;s next
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Built from scratch by a team of four for COE 892 - Distributed
          Cloud Computing, prioritizing consistency and partition tolerance
          under the CAP theorem. Next up: consistent-hashing-based sharding
          so large datasets can be split across nodes instead of fully
          replicated to each one, and a move from Docker Compose to
          Kubernetes for automated recovery and multi-region deployment.
        </p>
      </div>
    </div>
  );
}
