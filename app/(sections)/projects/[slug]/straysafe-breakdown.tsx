import {
  CheckIcon,
  FileIcon,
  MailIcon,
  SearchIcon,
  ShareNetworkIcon,
} from "@/components/icons";

const REPORT_FIELDS = [
  { label: "Name", value: "e.g. Eevee" },
  { label: "Type", value: "e.g. Cat" },
  { label: "Breed", value: "e.g. Scottish Fold" },
  { label: "Color", value: "e.g. Gray" },
  { label: "Age", value: "e.g. 10" },
  { label: "Microchip #", value: "XXXXXXXXXX" },
  { label: "Date lost", value: "MM / DD / YYYY" },
  { label: "Last seen", value: "e.g. A.B. Park, Downtown" },
];

const OWNER_TRACK = [
  "Sign up (stored right in the browser, no server needed)",
  "File a missing-pet report - breed, microchip #, last seen location, a photo",
  "Wait for a match",
];

const FINDER_TRACK = [
  "Spot a stray in the neighborhood",
  "Browse open reports for one that matches",
  "Flag the match",
];

/** StraySAFE isn't a five-part backend architecture like ReliaNet - it's
 * a report form and a matching flow, so its breakdown looks like one:
 * the actual report form recreated as a flyer, and the two different
 * people (owner, finder) who use it shown as separate tracks that
 * converge, rather than a single "how it works" list. */
export function StraySafeBreakdown() {
  return (
    <div className="mt-14 flex flex-col gap-14">
      <div>
        <p className="max-w-xl text-lg leading-relaxed text-ink">
          Missing-pet reports scatter across flyers and social posts.{" "}
          <span className="bg-gradient-to-r from-accent-soft to-accent-deep bg-clip-text font-semibold text-transparent">
            StraySAFE
          </span>{" "}
          puts them in one place both the owner and whoever just found the
          pet can actually reach.
        </p>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
          The team went into WildHacks surprised at how few real resources
          existed for someone going through the stress of a lost pet, or
          worried about a stray in their area - most people were left with
          paper flyers and one-off social posts that only reach whoever
          happens to scroll past at the right moment. The goal was
          something simple enough for any pet owner to actually use,
          anywhere, that also raises broader awareness in a neighborhood
          about pets that are currently missing - not just a private
          listing between one owner and one finder.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">The report</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          What actually gets filed when a pet goes missing - recreated
          from the real form fields.
        </p>

        <div
          className="mt-6 max-w-md rounded-2xl border border-dashed border-line bg-card-tint p-6 backdrop-blur-[6px]"
          style={{ transform: "rotate(-0.75deg)" }}
        >
          <div className="flex items-center gap-2 border-b border-dashed border-line pb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-tag-bg text-accent-soft">
              <FileIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
              Report a Lost Pet
            </p>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
            {REPORT_FIELDS.map((field) => (
              <div key={field.label}>
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
                  {field.label}
                </dt>
                <dd className="mt-0.5 truncate text-xs text-ink-soft">
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 border-t border-dashed border-line pt-3 text-[11px] text-ink-faint">
            + a photo upload
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">Two ways in</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Every report has two sides - the person who lost a pet, and the
          person who might have just found it.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[6px]">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-accent-soft">
              <MailIcon className="h-3.5 w-3.5" aria-hidden="true" />
              If you lost a pet
            </p>
            <ol className="mt-3 flex flex-col gap-2">
              {OWNER_TRACK.map((step, i) => (
                <li
                  key={step}
                  className="flex gap-2 text-sm leading-relaxed text-ink-soft"
                >
                  <span className="text-ink-faint">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[6px]">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-accent-soft">
              <SearchIcon className="h-3.5 w-3.5" aria-hidden="true" />
              If you found a stray
            </p>
            <ol className="mt-3 flex flex-col gap-2">
              {FINDER_TRACK.map((step, i) => (
                <li
                  key={step}
                  className="flex gap-2 text-sm leading-relaxed text-ink-soft"
                >
                  <span className="text-ink-faint">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-ink">
          <ShareNetworkIcon
            className="h-4 w-4 text-accent-soft"
            aria-hidden="true"
          />
          Both sides converge on a match
          <CheckIcon className="h-4 w-4 text-accent-soft" aria-hidden="true" />
        </div>
      </div>

      <p className="max-w-xl text-sm leading-relaxed text-ink-soft">
        Built at WildHacks by a team of four - HTML, CSS, and
        JavaScript, designed first in Figma, with accounts and reports
        stored client-side in the browser rather than a real backend
        (a deliberate hackathon-scope tradeoff). The stats behind the
        problem statement were run in MATLAB before a line of code was
        written. Next up: an &quot;Animal Tracker&quot; that plots a
        missing pet&apos;s last known sighting on a map, and a real
        backend so reports outlive one browser.
      </p>
    </div>
  );
}
