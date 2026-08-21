import type { ComponentType, SVGProps } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  DatabaseIcon,
  FlaskIcon,
  GlobeIcon,
  LockIcon,
  SlidersIcon,
} from "@/components/icons";

function ServiceBox({
  icon: Icon,
  name,
  tech,
  role,
  accent,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  name: string;
  tech: string;
  role: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`w-full max-w-xs rounded-2xl border p-4 backdrop-blur-[6px] ${
        accent ? "border-accent/50 bg-card-tint" : "border-line bg-card-tint"
      }`}
    >
      {/* order-2/justify-end/text-right (mobile only) — icon on the
          right of the label, matching the site's usual mobile
          right-anchored-icon convention. Desktop keeps the original
          icon-left order. */}
      <div className="flex items-center justify-end gap-2.5 text-right md:justify-start md:text-left">
        <span className="order-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tag-bg text-accent-soft md:order-none">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{name}</p>
          <p className="font-mono text-[10px] text-ink-faint">{tech}</p>
        </div>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-soft text-right md:text-left">{role}</p>
    </div>
  );
}

function Connector({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-1">
      <ChevronDownIcon className="h-4 w-4 text-ink-faint" aria-hidden="true" />
      <span className="font-mono text-[10px] text-ink-faint">{label}</span>
    </div>
  );
}

const ROSTER_FACTS = [
  "Adding a student first checks whether their course code already exists, and reuses it instead of creating a duplicate - same for the student record itself.",
  "Face photos are stored as raw binary Buffers directly inside the student's MongoDB document, not as files on disk or in a separate blob store.",
  "The upload dropzone rejects a file outright if its filename matches one already staged, before it's ever sent anywhere.",
  "The Attendance page won't let a capture through until the student number passes a 9-digit regex check.",
];

const ATTENDANCE_STEPS = [
  "Enter a 9-digit student number + course code",
  "Capture Photo - grabs a frame from the live react-webcam feed",
  "Process Photo - base64 to Blob, sent as multipart form data",
  "Snackbar reports the result: recorded, or not a strong enough match",
];

const MATCH_EXAMPLES = [
  { matched: 4, total: 5, outcome: "Not recorded", pass: false },
  { matched: 5, total: 5, outcome: "Attendance recorded", pass: true },
];

const OWNERSHIP: { service: string; status: "led" | "contributed" }[] = [
  { service: "Frontend", status: "led" },
  { service: "Backend", status: "led" },
  { service: "Database", status: "led" },
  { service: "CompVision", status: "contributed" },
];

const ROUGH_EDGES = [
  {
    title: "Two disconnected auth systems",
    detail:
      "Firebase genuinely decides who can log in - real email/password checks, live session state via onAuthStateChanged. But every API call to the backend carries one shared string, hardcoded in the frontend source and stored in localStorage, checked against a single static key. Firebase and the backend's own authorization never actually talk to each other.",
  },
  {
    title: "Signing up never creates a Professor record",
    detail:
      "The database service has a full Professor model and a createProfAccount endpoint ready to go. The frontend's signup flow just never calls it - professorEmail gets used everywhere as a plain string key instead.",
  },
  {
    title: "The database service checks presence, not identity",
    detail:
      "Its authorization middleware only checks that an Authorization header exists at all, not that it matches anything specific - it trusts that only the backend can reach it on the network, rather than verifying that directly.",
  },
];

/** The biggest project on the site gets the most thorough breakdown - a
 * real hub-and-spoke service map, the actual (and more interesting than
 * originally described) auth story, worked examples of the roster and
 * attendance flows, and an honest look at both the CompVision service
 * and the rough edges, instead of a short high-level summary. Every
 * detail below is pulled from the real source across all four repos. */
export function FacialRecognitionBreakdown() {
  return (
    <div className="mt-14 flex flex-col gap-14">
      <div>
        <h3 className="text-lg font-semibold text-ink">Why it exists</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          A term project for a computer vision course, built with a team of
          five: replace manual roll call and card swipes with a system that
          recognizes a student&apos;s face and records attendance on its
          own - while taking seriously, from the proposal onward, that
          faces get misidentified, lighting changes, and a photo held up to
          a webcam shouldn&apos;t be able to fool it.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">Four services, one system</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Nothing shares a codebase or a database connection - each piece
          only knows the others through an authenticated API call:
        </p>
        <div className="mt-6 flex flex-col items-center gap-1">
          <ServiceBox
            icon={GlobeIcon}
            name="Frontend"
            tech="React + TypeScript, Firebase Auth"
            role="Professor login, student roster, live webcam capture"
          />
          <Connector label="Bearer token · REST" />
          <ServiceBox
            icon={SlidersIcon}
            name="Backend"
            tech="Node.js + Express"
            role="Orchestrates every request - never touches MongoDB directly"
            accent
          />
          <div className="mt-1 flex flex-col items-center gap-1 sm:flex-row sm:items-start sm:gap-8">
            <div className="flex flex-col items-center gap-1">
              <Connector label="Bearer key · REST" />
              <ServiceBox
                icon={DatabaseIcon}
                name="Database"
                tech="Node.js + Express + MongoDB"
                role="Students, courses, attendance records - Dockerized"
              />
            </div>
            <div className="flex flex-col items-center gap-1">
              <Connector label="Bearer key · multipart images" />
              <ServiceBox
                icon={FlaskIcon}
                name="CompVision"
                tech="Flask + TensorFlow"
                role="Face-embedding model behind a single /predict endpoint"
              />
            </div>
          </div>
        </div>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
          That strict split has a real cost: the backend can&apos;t just
          join across tables. Building a professor&apos;s full attendance
          report means walking courses &rarr; students &rarr; attendance
          records &rarr; timestamps as a chain of separate API calls,
          because no single service is allowed to see the whole picture at
          once.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">Signing in, for real</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Two systems handle two different jobs here, and they don&apos;t
          actually know about each other:
        </p>
        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-line bg-card-tint p-4 backdrop-blur-[6px]">
          <div className="flex items-start gap-3">
            <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-soft" aria-hidden="true" />
            <p className="font-mono text-[11px] leading-relaxed text-ink-soft">
              Firebase Auth &rarr; decides who can log in. Real
              email/password check, live session state.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
            <p className="font-mono text-[11px] leading-relaxed text-ink-soft">
              Backend Authorization header &rarr; one shared string,
              hardcoded in the frontend, identical for every professor.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">Managing the roster</h3>
        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ROSTER_FACTS.map((fact) => (
            <div
              key={fact}
              className="rounded-xl border border-line bg-card-tint px-4 py-3 text-xs leading-relaxed text-ink-soft backdrop-blur-[6px]"
            >
              {fact}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">Taking attendance</h3>
        <p className="mt-3 max-w-xl font-mono text-[12.5px] leading-loose text-ink-soft">
          {ATTENDANCE_STEPS.map((step, i) => (
            <span key={step}>
              {i + 1}. {step}
              {i < ATTENDANCE_STEPS.length - 1 && <br />}
            </span>
          ))}
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">
          The match isn&apos;t one photo vs. one photo
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          A captured snapshot is compared against{" "}
          <span className="font-mono text-ink">every</span> reference photo
          on file for that student, not just one - each pair gets its own
          embedding distance from the model, and attendance only gets
          recorded if more than 80% of those comparisons agree it&apos;s a
          match:
        </p>
        <div className="mt-6 flex flex-col gap-2">
          {MATCH_EXAMPLES.map((ex) => (
            <div
              key={ex.outcome}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-card-tint px-4 py-3 backdrop-blur-[6px]"
            >
              <div className="flex gap-1">
                {Array.from({ length: ex.total }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-2.5 w-2.5 rounded-full ${
                      i < ex.matched ? "bg-accent-soft" : "bg-line"
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono text-xs text-ink-soft">
                {ex.matched}/{ex.total} reference photos matched (
                {Math.round((ex.matched / ex.total) * 100)}%)
              </span>
              <span
                className={`ml-auto flex items-center gap-1 text-xs font-semibold ${
                  ex.pass ? "text-accent-soft" : "text-ink-faint"
                }`}
              >
                {ex.pass && <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />}
                {ex.outcome}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
          A single lucky (or unlucky) frame can&apos;t decide it either
          way - a real answer to the proposal&apos;s own worry about
          misidentification from a single bad angle or lighting condition.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">Inside the CompVision service</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          The model teammates built is a Siamese network - a custom Keras{" "}
          <span className="font-mono text-ink">L1Dist</span> layer computes
          the absolute difference between two face embeddings. In practice{" "}
          <span className="font-mono text-ink">/predict</span> resizes both
          images to 100x100, runs each through the model to get its own
          embedding, then takes a plain Euclidean distance between the two
          and calls anything under 14 a match - a simpler decision rule
          than training the network&apos;s own distance head to make that
          call. Packaging it was its own fight: the Docker image installs
          TensorFlow before anything else in{" "}
          <span className="font-mono text-ink">requirements.txt</span>, and
          needs build-essential, libhdf5-dev, and a Fortran compiler just
          to get h5py to build.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">
          What I built, and what I didn&apos;t
        </h3>
        <div className="mt-4 flex flex-wrap justify-end gap-2 md:justify-start">
          {OWNERSHIP.map((o) => (
            <span
              key={o.service}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                o.status === "led"
                  ? "bg-tag-bg text-accent-soft"
                  : "border border-line text-ink-faint"
              }`}
            >
              {o.service}
              <span className="opacity-70">
                {o.status === "led" ? "· led" : "· contributed"}
              </span>
            </span>
          ))}
        </div>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
          I led the frontend, backend, and database services end to end -
          the architecture above, the matching logic, the API contracts
          between all four services, and wiring the whole thing into one
          working product. The face-embedding model itself came primarily
          from teammates on the five-person team.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">What&apos;s honestly still rough</h3>
        <div className="mt-4 flex flex-col gap-3">
          {ROUGH_EDGES.map((edge) => (
            <div
              key={edge.title}
              className="rounded-2xl border border-line bg-card-tint p-4 backdrop-blur-[6px]"
            >
              <p className="text-sm font-semibold text-ink">{edge.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{edge.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="max-w-xl text-sm leading-relaxed text-ink-soft">
        The original proposal called for Flask or Django on the backend
        with plain OAuth2/JWT auth - in practice, Node.js/Express carried
        the backend and database services, and Firebase Auth handled login,
        with Flask kept only for the one service that actually needed
        Python: the computer-vision model itself. Of the services I owned,
        only the database is Dockerized to match CompVision&apos;s
        container - the frontend and backend still just run directly
        through Node.
      </p>
    </div>
  );
}
