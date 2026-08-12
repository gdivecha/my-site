# Build Progress — Gaurav Divecha Portfolio Site

Source brief: Next.js (App Router) + TypeScript + Tailwind CSS app-shell portfolio.
Real routes chosen (not client-state SPA). Résumé = real PDF (not yet supplied).
All content is placeholder/lorem-ish and clearly marked — swap before going live.

## Environment gotchas (read this first if builds break)

- **Node version**: nvm default is v18.20.4, but Next.js needs >=20.9. Homebrew has
  Node 23.9.0 installed at `/opt/homebrew/bin`. Always run npm/node commands with
  `PATH="/opt/homebrew/bin:$PATH"` prefixed so the right `node` resolves (not just the
  `npm` binary — the shebang matters).
- **NODE_ENV**: the shell has `NODE_ENV=development` exported globally, which breaks
  `next build` (causes a bogus `<Html> should not be imported outside of pages/_document`
  error on `/404` and `/500` prerendering). Always run builds as
  `NODE_ENV=production npm run build`.
- **Next version**: `create-next-app@latest` pulled Next 16.3.0, which had an unrelated
  prerender crash on this setup. Pinned down to **Next 15.5.23 + React 19.0.0** (stable,
  known-good pairing). `eslint-config-next` pinned to match (15.5.23).
- `eslint.config.mjs` uses the classic `FlatCompat` pattern (`compat.extends("next/core-web-vitals", "next/typescript")`), not the newer Next 16 array-export style — that style isn't compatible with 15.x's `eslint-config-next`.
- `package.json` has an `overrides` block pinning `postcss` and `sharp` to patched
  versions (Next 15.5.23's bundled versions had known high-severity CVEs). Re-check
  `npm audit` after any dependency bump.
- Standard commands: `PATH="/opt/homebrew/bin:$PATH" npm run dev`, and for builds
  `PATH="/opt/homebrew/bin:$PATH" NODE_ENV=production npm run build`.
- **Don't run `npm run build` while `npm run dev` is running** — both write to the
  same `.next` directory and will corrupt each other's cache (symptom: dev server
  starts throwing `Cannot find module './NNN.js'` / `MODULE_NOT_FOUND` on every route).
  Fix is `rm -rf .next` and restart whichever process broke. If you need a production
  build to sanity-check, stop the dev server first (or run it in a git worktree /
  separate checkout).

## Design tokens (decided, in `app/globals.css` under `:root` + `@theme inline`)

Colors (Tailwind utilities auto-generated from `--color-*` names):
- `bg-base` #0d0d14, `bg-panel` #1a1a26, `bg-panel-alt` #232235, `border-line` (subtle white 6%)
- `text-accent` #6d5fe8 (primary indigo), `accent-soft` #a79ff0, `accent-deep` #4b3dc4
  (soft/deep used together for the gradient wordmark), `accent-contact` #4ecdc4 (teal,
  Contact page only)
- `text-ink` #f2f1f8 (headings), `text-ink-soft` #a8a4c0 (body), `text-ink-faint` #5c5878
  (inactive nav / faint labels)

Fonts: **Poppins** (600/700, `--font-poppins` → `font-display`) for the wordmark/headings,
**Inter** (400/500/600, `--font-inter` → `font-body`, applied as page default) for body/UI,
both loaded via `next/font/google` in `app/layout.tsx`. No other font files needed.

Utility classes defined once in `globals.css`, reused everywhere:
- `.text-gradient` — left-to-right gradient text clip (soft → deep indigo), used on the
  sidebar wordmark.
- `.watermark-field` / `.watermark-plane` / `.watermark-row(--reverse)` /
  `.watermark-row__track` / `.watermark-row__copy` — the fixed-position, full-bleed
  background: ~44 rows of the current section name, tiled and rotated -18deg as one
  plane, alternating scroll direction row-to-row via `@keyframes watermark-scroll` +
  `animation-direction: reverse` on odd rows. Used via `<Watermark text="..." />`.
  `position: fixed` (offset past the sidebar via `left: clamp(360px,40vw,640px)` at
  `md:`+) so it stays put when the content column scrolls — deliberately not `absolute`
  inside `PageShell`, which would scroll with page content. Text is light-weight
  (`font-weight: 300` — Poppins needed that weight added to its `next/font` config in
  `app/layout.tsx`, it was previously only loaded at 600/700) and ~4.5% opacity.

## Component conventions established (in `/components`)

- `PageShell` — wraps every route's page content: gives padding, `overflow-hidden`,
  mounts `Watermark`, and a `relative z-10` content wrapper. Takes `watermark` (section
  name string). **Every new page should be wrapped in this.** Top padding is
  `style={{ paddingTop: "var(--sidebar-title-top, 3rem)" }}` instead of a plain Tailwind
  class — see `Sidebar`/`PageHeading` below for why; horizontal padding and `pb-*` are
  still normal Tailwind classes.
- `DecorShapes` (the thin-stroke outline circle/square/triangle/venn background shapes)
  was removed entirely per explicit request ("get rid of them i only want the
  watermarks to be the background") — `PageShell` no longer takes a `variant` prop,
  and it was stripped from every page's `<PageShell>` call.
- `Watermark` — client component (`"use client"`; needs `useLayoutEffect` to measure
  itself). Renders 44 rows × 2 duplicated copies × 8 repeats of the word, each row's
  `animation-duration` set via a `--watermark-duration` CSS var computed from that row's
  *actual measured width* divided by a constant `PIXELS_PER_SECOND` (12) — this is
  deliberate, not a fixed duration: it's what makes the scroll speed visually identical
  across pages despite "RECOMMENDATIONS" and "SKILLS" producing very different track
  widths at the same 8-repeat count. Re-measures on resize via `ResizeObserver`. Two
  earlier bugs worth knowing about if this breaks again: (1) the per-row wrapper used to
  have `overflow: hidden` + `line-height: 1`, which clipped the tops of glyphs — fixed
  by dropping the row-level clip (the fixed outer field already clips at the viewport
  edge) and raising `line-height` to 1.3; (2) word-to-word spacing was originally
  `padding-inline` on each span (reads as one run-on string) — switched to a `gap` on
  the flex row instead.
- `PageHeading` — the eyebrow + big `h2` at the top of every page (`<PageHeading
  eyebrow="Skills">My Expertise</PageHeading>`), used by all 10 section pages and by
  `StubSection`. Client component: measures its own eyebrow's rendered height and pulls
  it up via a negative `marginTop` equal to that height, so the *heading* text (not the
  eyebrow) lands exactly at the top of `PageShell`'s padding box. This exists purely to
  make the heading align with the sidebar name — see below. A first attempt at this
  hardcoded a guessed 24px offset instead of measuring; it was visibly off (bottoms
  didn't quite line up) and got replaced with this self-measuring version.
- `Sidebar` — persistent, client component, width `clamp(360px,40vw,640px)` (not a
  fixed px value — sized to look proportionally "big" per an explicit brief request).
  Fixed on `md:`+, stacks in normal flow on mobile. Its whole content group (name,
  tagline, `DialNav`, socials) is vertically centered via `justify-center` on the outer
  flex column — **this is intentional, keep it**, a prior attempt at top-anchoring the
  name broke this and had to be reverted. Because that centering is dynamic (depends on
  viewport height), the name's on-screen position isn't a fixed constant, so alignment
  with each page's heading is done live: a `useLayoutEffect` measures the name `<h1>`'s
  `getBoundingClientRect().top` (re-measured on resize via `ResizeObserver` + a resize
  listener) and writes it to `--sidebar-title-top` on `document.documentElement`, which
  `PageShell` reads for its top padding. Below the `md:` breakpoint the sidebar isn't
  fixed/centered (stacks above content instead), so the sync is skipped there and
  `--sidebar-title-top` is removed, falling back to `PageShell`'s static padding.
  Reads from `lib/data/profile.ts`; nav is delegated to `DialNav`.
- `DialNav` — replaced the old flat nav `<Link>` list. A scrollable "dial"/reel: fixed
  `324px`-tall (`ROW_HEIGHT=36 * VISIBLE_ROWS=9`, i.e. 4 rows visible above/below the
  centered item — row height tightened from an original 44px per request) container
  with CSS `scroll-snap`, edge fade via a 10-stop `mask-image`
  (not per-row opacity, and not linear — eases out over the 4 neighbor rows for a
  natural falloff). Renders `navItems` **3x** ("tripled list") and silently jumps
  `scrollTop` by one list-length when nearing the array bounds, so scrolling past the
  last item wraps seamlessly into the first (and vice versa) — no dead end at either
  end of the list. A static pill-shaped rail (flat translucent fill, not a gradient —
  a brightness bump at the rail's center was tried and rejected, it read as a
  distracting glow sliding past during transitions) sits behind uniform tick-mark
  dashes; the focused tick is plain white with no shadow/blur (a glow/shine treatment
  was tried and explicitly rejected in favor of flat white). Live-tracks scroll
  position (`onScroll` → nearest-row index, mod'd back into `[0,N)` for lookups) to
  update styling in real time, then **auto-navigates** to whichever item settles at
  center ~160ms after scrolling stops (`router.push`, debounced via a timer reset on
  every scroll event). The pathname-sync `useEffect` steps from the dial's *actual*
  current raw index using a shortest-signed-delta helper — it must NOT renormalize
  back into a "canonical" copy of the tripled list, which was a real bug: it caused
  About→Contact (adjacent across the wrap point) to animate a long slide across
  nearly the whole list instead of the correct one-row hop. Also handles nested routes
  (e.g. `/projects/shelfie` still highlights "Projects") via a `startsWith` prefix
  fallback in `findActiveIndex`. Uses a hand-rolled `.no-scrollbar` utility in
  `globals.css` (Tailwind has no built-in one) to hide the native scrollbar. Reads
  from `lib/data/nav.ts`.
- `Pill` / `Tag` — small rounded-pill components for badges (education/location pills)
  vs. tech tags respectively (subtly different styling — Pill has a border+icon slot,
  Tag is a flat accent-tinted chip for tech-stack lists).
- `TechIcon` — the Skills-page tech monogram badge with hover/focus tooltip. Client
  component (needs hover state). Placeholder abbreviation badges, not real logos.
- `components/icons.tsx` — hand-authored inline SVGs (Github/LinkedIn/Instagram/Mail/
  Download/ChevronDown/ArrowDown/Play/Quote/BreadcrumbArrow). No icon library dependency
  added on purpose.

## Data layer (`/lib/data/*.ts`) — DONE

All typed, all populated with clearly-placeholder content:
- `nav.ts` — the 10 nav items, settled order per brief.
- `profile.ts` — name/roles/tagline/bio paragraphs/education/location/socials. GitHub
  social link is REAL (`github.com/gdivecha`, confirmed via `gh auth status` earlier in
  session). LinkedIn/Instagram are `"#"` placeholders — deliberately not fabricated,
  marked `// TODO`.
- `skills.ts` — all 11 categories from the brief (8 engineering + 3 content), each with
  4-6 placeholder tech tags (`{name, abbr}` — abbr feeds `TechIcon`'s monogram).
- `experience.ts` — 5 entries: 1 explicit full-time placeholder ("Acme Technologies",
  obviously fake company name on purpose so it reads as a slot to fill), Amazon +
  Dayforce as internships, Ryerson International Hyperloop + "Independent" content
  creation as freelance. Chose these companies because they're the same three named in
  the brief's Recommendations section (Dayforce/Amazon/Ryerson Hyperloop) — kept
  consistent across pages rather than inventing unrelated placeholder companies.
- `projects.ts` — 6 projects spread across full-stack/backend/hackathon categories, each
  with 3 alternating detail blocks (lorem-ish) matching the brief's "alternating
  image/text" repeatable block spec.
- `recommendations.ts` — 8 testimonials across the 4 categories (software-engineering/
  content-creation/artist/freelance) and 3 companies (matches experience.ts companies).
  Recommender names are generic placeholder names (deliberately NOT real people) to
  avoid misattributing invented quotes to anyone real. Also exports
  `recommendationCategories` and `recommendationCompanies` lookup arrays for the filter
  tabs.

## STATUS: all 12 build-order tasks complete. Full build verified clean.

Every route exists and `NODE_ENV=production npm run build` (with the Homebrew PATH
prefix) passes with 0 type errors, 0 lint errors, 0 `npm audit` vulnerabilities, all
21 static pages generated. Also spot-checked at runtime: started `npm run dev` and
fetched every route with Node's `fetch` (curl/head are blocked in this shell — use
`node -e` with `fetch()` instead if you need to re-check), confirming HTTP 200 (307 on
`/` → `/about`) and no `Application error` / `Unhandled Runtime Error` /
`Internal Server Error` markers in the HTML. **Not yet verified in an actual browser**
— no Chrome extension was connected in that session; a real visual pass (does the
gradient wordmark render, do hover states look right, does the masonry actually look
like masonry, is spacing/rhythm good) is still outstanding and worth doing before
calling this "done" done.

- `app/layout.tsx` — root layout, loads Poppins+Inter, sets metadata, applies
  `bg-base text-ink` on body.
- `app/page.tsx` — redirects `/` → `/about` (server-side `redirect()`, no client flash).
- `app/(sections)/layout.tsx` — route group layout wrapping all section pages with
  `<Sidebar />` + a `md:ml-[clamp(360px,40vw,640px)]` offset main panel (must match
  `Sidebar`'s own width exactly, or the two will gap/overlap).
- `app/(sections)/about/page.tsx` + `scroll-indicator.tsx` — single stacked column
  (not the original two-column layout): `PageHeading`, then a photo+pills row (photo
  left, education/location/"Available for opportunities" `Pill`s stacked to its right,
  bottom-aligned with the photo), then bio paragraphs below, all left-aligned right
  after the sidebar. Normal top-anchored flow — an earlier version force-fit everything
  into one viewport height with `h-[calc(100dvh-...)]` + `overflow-y-auto` to avoid
  scrolling, but that was explicitly reverted: scrolling is fine, only the heading's
  starting position needs to align (see `PageHeading`). Emoji icons (🎓/📍/🟢) are
  intentional — literal per the brief/requests, not meant to be swapped for an icon set.
- `app/(sections)/skills/page.tsx` + `skill-row.tsx` — Software Engineering/Content
  Creation filter toggle, hover-to-expand category rows (CSS grid-rows trick for smooth
  height animation, not JS-measured height), `TechIcon` tooltips on hover/focus.
- `app/(sections)/experience/page.tsx` + `experience-card.tsx` — Full-Time/Internships/
  Freelance filter tabs with counts, expandable cards revealing the 3 Q&A blocks +
  an `ImagePlaceholder`.
- `app/(sections)/projects/page.tsx` + `project-card.tsx` +
  `[slug]/page.tsx` — All/Full-Stack/Back-end/Hackathon filter tabs with counts, 2-col
  grid linking to a dynamic detail route (`generateStaticParams` from `projects.ts`
  slugs, `notFound()` on bad slug). Detail page: breadcrumb, video mock with `PlayIcon`
  overlay (links out if `videoUrl` isn't `"#"`), alternating image/text blocks mapped
  from `project.details`.
- `app/(sections)/recommendations/page.tsx` + `quote-card.tsx` + `role-card.tsx` +
  `recommender-entry.tsx` — most complex page, two independent filter states (category
  for the masonry quote grid via CSS `columns-2` + `break-inside-avoid`; company for
  the "Interested in reading more?" section). Company section groups recommendations
  by role, each role card expands to per-recommender entries with a `line-clamp-2` +
  "See more" toggle.
- `app/(sections)/portfolio/page.tsx` — iframe embed of `/resume.pdf` + download
  button. **`public/resume.pdf` is a generated placeholder** (made with macOS's
  built-in `cupsfilter` text→PDF converter, not fabricated resume content) — it
  literally says "Placeholder Resume — replace this file" when opened. Swap in the
  real PDF at `public/resume.pdf` (same filename) whenever it's ready; no code changes
  needed.
- `app/(sections)/contact/page.tsx` + `contact-form.tsx` — white card (deliberate
  high-contrast break from the dark theme, per brief) with black `MailIcon` + teal
  accent lines, then a standard dark-panel form below. Client-side only: submitting
  just flips to a "thanks — no backend wired up yet" confirmation state, no real send.
- `app/(sections)/{open-source,certifications,bonus}/page.tsx` — all three use the new
  shared `components/StubSection.tsx` (dashed-border panel, body copy +
  "Real content to follow" label), each with page-specific copy.
- Old scaffold placeholder SVGs deleted from `/public`.

## Open items / still outstanding

- **Résumé PDF is a placeholder** (`public/resume.pdf`, generated via `cupsfilter`, not
  fabricated content) — replace with the real file, same path, whenever it's ready.
- **No real visual/browser QA yet** — build + HTTP-level checks pass, but nobody has
  looked at this in an actual browser. Worth doing before treating it as finished:
  gradient wordmark rendering, hover/expand animations, masonry layout, spacing.
- Mobile/responsive treatment beyond the sidebar's stack-on-mobile behavior hasn't been
  specifically discussed with the user — current approach (sidebar becomes a normal
  top block below `md:` breakpoint) is a reasonable default but not brief-specified.
- LinkedIn/Instagram social links in `lib/data/profile.ts` are still `"#"`
  placeholders — only GitHub is real.
- All experience/project/recommendation content is placeholder text — see the
  "Data layer" section above for what's real (GitHub link, company names matching
  across pages) vs. invented (specific dates, quotes, recommender names).

## Git / hosting state

- Repo is live at **https://github.com/gdivecha/my-site** (public), `main` branch. Only
  commit/push when explicitly asked — don't push silently.
