# Build Progress — Gaurav Divecha Portfolio Site

Source brief: Next.js (App Router) + TypeScript + Tailwind CSS app-shell portfolio.
Real routes chosen (not client-state SPA). The site is **live and mostly populated
with real content now** — see "Data layer" below for what's real vs. still placeholder.

## Environment gotchas (read this first if builds break)

- **Node version**: nvm default is v18.20.4, but Next.js needs >=20.9. Homebrew has
  Node 23.9.0 installed at `/opt/homebrew/bin`. Always run npm/node commands with
  `PATH="/opt/homebrew/bin:$PATH"` prefixed so the right `node` resolves (not just the
  `npm` binary — the shebang matters).
- **NODE_ENV**: the shell has `NODE_ENV=development` exported globally, which breaks
  `next build` (causes a bogus `<Html> should not be imported outside of pages/_document`
  error on `/404` and `/500` prerendering). Always run builds as
  `NODE_ENV=production npm run build`.
- **Next version**: pinned to **Next 15.5.23 + React 19.0.0** (stable, known-good
  pairing). `eslint-config-next` pinned to match (15.5.23).
- `eslint.config.mjs` uses the classic `FlatCompat` pattern (`compat.extends("next/core-web-vitals", "next/typescript")`), not the newer Next 16 array-export style.
- `package.json` has an `overrides` block pinning `postcss` and `sharp` to patched
  versions. Re-check `npm audit` after any dependency bump.
- Standard commands: `PATH="/opt/homebrew/bin:$PATH" npm run dev`, and for builds
  `PATH="/opt/homebrew/bin:$PATH" NODE_ENV=production npm run build`.
- **Don't run `npm run build` while `npm run dev` is running** — both write to the
  same `.next` directory and will corrupt each other's cache (symptom: dev server
  starts throwing `Cannot find module './NNN.js'` / `MODULE_NOT_FOUND` on every route).
  Fix is `rm -rf .next` and restart whichever process broke.
- **Dev server can go stale after many hours of Fast Refresh** — a few times this
  session, a change (especially to inline `<script>` content embedded in SSR output, or
  `next/font` weight config) didn't visibly take effect until the dev server was fully
  killed, `.next` deleted, and restarted fresh. If a change "does nothing" after
  multiple attempts and the code looks correct, suspect this before re-diagnosing the
  code itself.

## Design tokens (in `app/globals.css` under `:root` + `@theme inline`)

Colors (Tailwind utilities auto-generated from `--color-*` names). These are the
**dark-mode values, the unconditional default** (bare `:root`) — light mode is an
explicit opt-in toggle, see "Dark/light theme toggle" below.

Core surface/ink/accent tokens (unchanged since initial build):
- `bg-base` #0d0d14, `bg-panel` #1a1a26, `bg-panel-alt` #232235, `border-line` (subtle white 6%)
- `text-accent` #6d5fe8, `accent-soft` #a79ff0, `accent-deep` #4b3dc4, `accent-contact` #4ecdc4
- `text-ink` #f2f1f8, `text-ink-soft` #a8a4c0, `text-ink-faint` #5c5878

Newer tokens added for theme-aware surfaces that plain semantic tokens didn't cover well:
- `--color-card-tint` / `--color-card-tint-hover` — the translucent+blurred card
  background used on Skills categories, Experience cards, the Portfolio résumé card,
  Project cards, Recommendations cards, and `Pill`. Dark mode: a `#303151`-based tint
  (`rgba(48,49,81,.15)` / `.25` on hover). Light mode: a **white** wash at much lower
  opacity (`rgba(255,255,255,.03)` / `.06`) — a dark tint read as a smudge on the light
  background, so the hue flips per-theme rather than just the opacity. Paired with
  `backdrop-blur-[3.8px]` (tuned by eye — treat as a rough middle, not precise).
- `--color-tag-bg` — background for `Tag` chips and the Skills category icon badges.
  Dark mode: same as `--color-panel-alt` (no visible change from before). Light mode:
  a visible purple wash (`rgba(109,95,232,.14)`) — `panel-alt` alone was nearly
  invisible against the light theme's near-white background.
- `--color-roles-text` — the sidebar's "Software Engineer • Artist" line. Dark:
  `#c4c9ff` (light lavender). Light: `#4b3dc4` (darker purple) — the lavender read as
  washed-out on a light background.
- `--color-input-bg` — Contact form input backgrounds. Dark: `#0d0d14` (matches
  `--color-base` exactly). Light: pure white.
- `--color-dial-tick` — `DialNav`'s selected-item tick mark. Dark: white (as before).
  Light: black — white was invisible against the light theme.
- `--color-watermark-text` / `--watermark-text-opacity` — see "Watermark" below.

**Type scale**: `--text-xs` overridden to 13px/1.25rem-line-height (vs Tailwind's
default 12px) via a plain `@theme { --text-xs: 0.8125rem; ... }` block. On top of that,
`html { font-size: 112.5%; }` scales every rem-based Tailwind size up further (18px
root). The sidebar name and every page's `PageHeading` are deliberately fixed-px
(`text-[30px] md:text-[36px] lg:text-[48px]` etc.) rather than rem-based, since the
alignment mechanism between them (see `Sidebar`/`PageHeading` below) depends on precise
measurement, not scaled-up sizing.

## Custom cursor

`components/CustomCursor.tsx`, mounted once in `app/layout.tsx` (inside `<body>`,
after `{children}`). A small accent-colored dot that follows the mouse and grows/
lightens on hover over links/buttons/inputs. Key implementation details:
- Only activates on `matchMedia("(pointer: fine)")` — untouched on touch devices.
- Reads the latest mouse position on every `mousemove` but only writes to the DOM via
  `requestAnimationFrame`, once per paint — writing directly in the `mousemove`
  handler was visibly choppy since events can fire faster than the screen repaints.
- The native cursor is only hidden (`.custom-cursor-active` class + `cursor: none`)
  once JS confirms it's active, not unconditionally — so nothing breaks if the script
  fails to load.

## Watermark

`components/Watermark.tsx` + the `.watermark-*` classes in `globals.css`. Unchanged in
structure from the original build (44 rows × 2 copies × 8 repeats, alternating scroll
direction, per-row duration computed from measured width ÷ `PIXELS_PER_SECOND` so
speed reads identical across pages regardless of word length). Tuned several times by
request since:
- **Speed**: `PIXELS_PER_SECOND` is currently **9** (history: 12 → 6 → 7 → 9 → 14 → back
  to 9 — 14 was tried and explicitly rolled back).
- **Text size**: `font-size: clamp(1.5rem, 3.5vw, 2.85rem)` (reduced from the original
  `clamp(1.75rem, 4vw, 3.25rem)`).
- **Weight**: `font-weight: 300` (the lightest loaded Poppins weight). A `400` was
  tried and rolled back to 300. Poppins now loads `["300", "400", "600", "700"]` in
  `app/layout.tsx` (the `400` was added specifically so a genuine in-between weight
  step exists if this gets revisited, rather than jumping straight to 600).
- **A fade-in entrance animation for page content was attempted twice and reverted
  both times** (`page-content-enter` class, opacity-only after the first attempt with
  `transform` broke `backdrop-filter` on the translucent cards). Neither version is
  currently live — `PageShell`'s content wrapper is plain `<div className="relative
  z-10">`, no animation class. If revisited: opacity-only is required, `transform`
  (even one that ends at `transform: none`) forces a compositing layer on the ancestor
  that breaks backdrop-filter on Skills/Pill/etc. descendants — confirmed by direct
  testing, not just theory.
- **Text color is now theme-aware** via `--color-watermark-text` +
  `--watermark-text-opacity` (both new tokens, see "Design tokens" above): dark mode is
  `#f8f7fc` at `0.045` opacity (barely different from the original flat
  `var(--color-ink)` at `0.045`); light mode is a purple `#8f81ef` at `0.1` opacity —
  tuned through several rounds (plain `var(--color-ink)` in light mode read as
  near-black/gray, not purple; several purple hex values were tried before landing
  here; opacity was bumped from parity-with-dark up to `0.1` specifically because the
  purple wasn't "apparent" enough at the original low opacity).

## Keyboard shortcuts

- `DialNav` listens for `Cmd+ArrowUp`/`Cmd+ArrowDown` to step to the previous/next tab
  from anywhere on the page.
- `components/KeyboardShortcuts.tsx` — a ⌘-icon button (next to `ThemeToggle` in
  `Sidebar`) opens a modal listing the dial shortcuts + native scroll keys.

## Site-wide search

`components/SearchModal.tsx` + `lib/search-index.ts`. A search button sits in the
sidebar's top-left button row, in this order: **Search → theme toggle → ⌘ keyboard
shortcuts**. Opens via click or `Cmd+K` from anywhere on the site (guarded against
firing while an `<input>`/`<textarea>` is focused, same pattern as `DialNav`'s
`Cmd+Arrow`). Supports arrow-key navigation + Enter (client-side `router.push`, not a
full reload), Escape/backdrop-click to close, autofocuses its input on open.

`lib/search-index.ts` builds a **static** index at module load (every source is
already available at build time, no need to rebuild per-keystroke) from: `nav.ts`
(pages), `projects.ts` (deep-links straight to each project's detail page), `skills.ts`
(engineering group only, matching what's actually shown), `experience.ts` (internship
type only, same reasoning), and `recommendations.ts` (grouped by company). Each result
has a `label`/`description` shown in the UI, plus an optional **hidden `keywords`
field** that's matched against a query but never displayed — this is what lets a
search surface a result whose match only lives inside a collapsed accordion (an
experience's "challenges" answer, a recommender's quote and name, a project's detail
blocks) without the user ever having opened it. The search deliberately respects the
same visibility rules as the pages themselves (e.g. it won't surface the
`"freelance"`-type Ryerson entries, since those are filtered out of `/experience`
entirely, not just collapsed).

**Bug fixed during build**: two Amazon internships and two Dayforce internships share
the same "role · company" display text (different terms/teams) — the first version
keyed the results list on that composite string and threw React's duplicate-key
console error. Every `SearchResult` now carries its own stable `id` (derived from the
source data's real identifier — `experience.id`, `project.slug`, etc.), not built from
display text.

## Dark/light theme toggle

- `:root[data-theme="light"]` in `globals.css` redefines all `--color-*` custom
  properties (see "Design tokens" above for the newer ones). Bare `:root` stays dark —
  dark is the default for anyone who's never toggled.
- `components/ThemeToggle.tsx` — sun/moon icon button in `Sidebar`, top-left corner
  (next to `KeyboardShortcuts`). Toggling sets/removes `data-theme="light"` on
  `document.documentElement`, persists to `localStorage["theme"]`.
- `app/layout.tsx` has a blocking inline `<script>` in `<head>` that reads
  `localStorage["theme"]` and sets `data-theme="light"` on `<html>` before hydration,
  preventing a flash of the wrong theme. `<html>` has `suppressHydrationWarning`
  because of this. No `prefers-color-scheme` auto-detection — new visitors always get
  dark by default.

Fonts: **Poppins** (`["300", "400", "600", "700"]`, `--font-poppins` → `font-display`),
**Inter** (`["400", "500", "600"]`, `--font-inter` → `font-body`), both via
`next/font/google` in `app/layout.tsx`.

## Component conventions (`/components`)

- `PageShell` — wraps every route's page content: padding, `overflow-hidden`, mounts
  `Watermark`, a `relative z-10` content wrapper. Top padding is
  `style={{ paddingTop: "var(--sidebar-title-top, 3rem)" }}`.
- `Watermark` — see "Watermark" section above.
- `PageHeading` — the eyebrow + big `h2` at the top of every page. Two things worth
  knowing:
  1. The eyebrow measures its own rendered height (`useLayoutEffect`) and pulls itself
     up via negative `marginTop` equal to that height, so the *heading* text lands
     exactly at the top of `PageShell`'s padding box (aligns with the sidebar name).
  2. **The eyebrow text itself is now visually hidden** (`opacity-0 aria-hidden="true"`)
     but keeps its layout height — so "About"/"Experience"/etc. no longer render as
     visible small-caps labels above each heading, but the heading's vertical position
     is unaffected (the invisible eyebrow still occupies the same space it always did).
- `Sidebar` — persistent, client component, width `clamp(360px,40vw,640px)`. Fixed on
  `md:`+, stacks in normal flow on mobile. Content group (name, tagline, `DialNav`,
  socials) vertically centered via `justify-center`, gap `gap-8` (was `gap-10`,
  tightened per request). A `useLayoutEffect` measures the name `<h1>`'s
  `getBoundingClientRect().top` and writes it to `--sidebar-title-top` on
  `document.documentElement`, which `PageShell` reads for its top padding. **Several
  attempts were made this session to eliminate the resulting load-time "flash" (page
  content briefly at the wrong vertical position before snapping into place) via a
  pre-paint blocking `<script>` — all were tried, debugged, and ultimately reverted**;
  the mechanism is back to the original post-hydration-only `useLayoutEffect`. The
  flash is a known, currently-unresolved cosmetic issue on hard refresh. Social icons
  (bottom of sidebar) are solid purple badges (`bg-accent` / `hover:bg-accent-deep`)
  with the glyph colored via `text-[var(--color-base)]` so it reads as a cutout against
  the purple rather than a separately-colored icon.
- `DialNav` — scrollable "dial" nav, unchanged in mechanism from initial build (tripled
  list for seamless wraparound, CSS scroll-snap, edge-fade mask, auto-navigate ~160ms
  after scroll settles, `Cmd+Arrow` support). **A fix for the initial-scroll-position
  flash on page load (rendering the correct offset via CSS transform on first paint,
  computed deterministically from the current route, then handing off to native
  `scrollTop` post-mount) was implemented, verified working, but then explicitly
  reverted per request** — not currently live. If revisited, the approach is sound
  (unlike the sidebar's flash, this one *is* fully deterministic from the pathname
  alone, no viewport measurement needed) — the git history around commit range
  `dff4dd0..a48c302` has the working version to reference.
- `Pill` / `Tag` — `Pill` and `Tag` both now use `bg-card-tint` / `bg-tag-bg`
  respectively (see "Design tokens" above) instead of the original flat
  `bg-panel`/`bg-panel-alt`.
- `TechIcon` — Skills-page tech logo tile with hover/focus tooltip. Two icon sources
  now, both in `components/TechIcon.tsx`:
  - `iconMap` — real brand marks via `simple-icons` (unchanged approach from initial
    build: single SVG path, filled with the brand's own hex via `#${icon.hex}`).
  - `extraIconMap` (**new**) — single-path marks sourced from the `devicon` npm
    package (MIT licensed; not an installed dependency, just used once to extract path
    data, which now lives hardcoded in `TechIcon.tsx`) for brands `simple-icons` has
    dropped for trademark-enforcement reasons but that still have a usable devicon
    "plain" (monochrome) variant: **C#, Java, Azure, Premiere Pro, After Effects,
    Photoshop, Illustrator**. Rendered the same way as `iconMap` entries but colored via
    each skill's own `color` field instead of a baked-in hex, and using each icon's own
    `viewBox` (devicon's are `0 0 128 128`, not simple-icons' `0 0 24 24`).
  - Still-missing brands with no real logo anywhere reasonable: **AWS** (devicon only
    has a wide wordmark, not a standalone glyph) and **Mockito** (not in either
    library) — both fall back to the hex-badge (`abbr` + `color`).
- `SkillRow` — **now click-to-open, not hover-to-open** (was hover-triggered
  originally; changed because hover was fighting with the tooltip hover state). Also
  **now a controlled component** — `open`/`onToggle` are props, not local state — so
  the Skills page can drive an "Expand all"/"Collapse all" button (see below). Category
  avatar icons (`CodeBracketsIcon` etc. from `components/icons.tsx`) unchanged.
- `components/icons.tsx` — added `CloseIcon` and `ArrowLeftIcon` since initial build;
  removed `BreadcrumbArrowIcon` (no longer used, see Projects below) and `ArrowDownIcon`
  (removed with the About-page scroll indicator, an earlier-session change).

## Data layer (`/lib/data/*.ts`)

- `nav.ts` — **Open Source, Certifications, and Bonus are commented out**, not
  deleted — their pages/routes still exist and work if visited directly, they're just
  not linked from the dial nav for now. Uncomment the three entries to bring them back.
- `profile.ts` — real GitHub (`github.com/gdivecha`) and LinkedIn
  (`linkedin.com/in/gauravcdivecha`) URLs. Instagram removed entirely (was a `"#"`
  placeholder, user chose to drop it rather than fill it in). Roles list has
  "Content Creator" commented out (user edit — SWE + Artist only, for now). Tagline
  rewritten to real copy.
- `skills.ts` — significantly changed from the original 11-category placeholder set:
  - **Removed**: GraphQL, Express (backend); Redis (database); PyTorch, TensorFlow,
    scikit-learn (AI & ML — that category was Python-ML-tooling focused, now it's
    AI-coding-tool focused instead); Cypress (testing, replaced by Mockito).
  - **Added**: Axios, Material UI (frontend); Claude Code, Cursor (AI & ML, alongside
    OpenAI API); Mockito (testing, hex-badge fallback — no logo available).
  - **Real logos added** for C#, Java, Azure, Premiere Pro, After Effects, Photoshop,
    Illustrator (see `TechIcon` above) — these previously showed only an abbreviation
    badge.
  - The Skills page currently only shows the `"engineering"` group by default (see
    `app/(sections)/skills/page.tsx` below) — the `"content"` group (video-editing,
    graphic-design, social-media categories) still exists in this file, just isn't
    rendered right now.
- `experience.ts` — **replaced with real history**, pulled from the user's actual
  LinkedIn profile (screenshots provided directly). 8 entries, in order: Prestar
  (Software Developer, Co-op), Amazon ×2 (FBA Inbound Placement Team + FBA
  Transportation Xperience Team — two separate internships, different summers),
  Dayforce ×3 (Performance Engineering Team, two separate terms + Software Test
  Engineer/Web Framework Team), Ryerson International Hyperloop ×2 (Assistant Team
  Lead + Data Acquisition Member). The old "Acme Technologies" full-time placeholder
  and "Independent"/Content Creator freelance entry are commented out (user edit), not
  deleted. **`summary` changed from `string` to `string[]`** — originally bullet
  points (matching the real LinkedIn bullet-point source content), then changed again
  per request to render as a single joined paragraph (`experience.summary.join(" ")`
  in `experience-card.tsx`) rather than an actual bulleted list — the type stayed
  `string[]` even though it now always renders as prose. `challenges`/`growth` (the
  site's own reflective Q&A format, which LinkedIn doesn't have) were written fresh,
  grounded in each role's specific real content, not generic placeholders. Added a
  `logoSrc?: string` field — Amazon, Dayforce, Prestar, and Ryerson Hyperloop all have
  real logos in `public/logos/`; `ExperienceCard` falls back to the diagonal-stripe
  `ImagePlaceholder` when a role has no `logoSrc`.
  **Duration is always computed live, never hardcoded.** Every entry has real
  `startDate`/`endDate` (`YYYY-MM-DD`; `endDate` omitted for an ongoing "Present"
  role). `ExperienceCard`'s `durationText()` computes `(end - start, inclusive) + 1`
  month, with `end` defaulting to `new Date()` when `endDate` is absent — so an
  ongoing role's duration updates itself over time with zero maintenance, and a fixed
  role's duration self-corrects if its dates are ever edited. (An earlier version
  briefly had a literal `duration: "4 months"` string per entry — that field no longer
  exists; don't reintroduce it.)
- `projects.ts` — unchanged in content (still the original 6 placeholder projects
  across full-stack/backend/hackathon). The "Hackathon" filter chip was removed from
  the Projects page UI (see below) but the underlying `hackathon` category and its 2
  projects are untouched — they still show up under "All".
- `recommendations.ts` — **substantially rewritten**:
  - **`PreviewQuote` is a new, separate type/array** (`previewQuotes`) from the full
    `Recommendation[]` (`recommendations`). The top-of-page preview grid used to reuse
    full `Recommendation` entries (with citation); now it's short, hand-picked,
    uncited excerpts that are fully decoupled from any specific recommender — edit
    `previewQuotes` directly for the preview cards, edit `recommendations` for the
    "Interested in reading more?" section, they're independent.
  - Real recommendation text, recommenders, and LinkedIn links replacing the original
    placeholder testimonials (user-provided).
  - **Grouping bug fixed**: the "Interested in reading more?" section groups
    recommendations into cards — originally keyed by `role` text, which both (a) broke
    when a role string had a typo, and (b) was conceptually wrong anyway, since Amazon
    reused the same generic role title across different summer internships. Now keyed
    by `term` instead, in `app/(sections)/recommendations/page.tsx`.

## Pages — current state vs. original build

- `app/(sections)/skills/page.tsx` — **the Software Engineering/Content Creation
  toggle was removed**; the page always shows the `"engineering"` group only. Added an
  "Expand all"/"Collapse all" button above the category list (`SkillRow` is now
  controlled from here, see above).
- `app/(sections)/experience/page.tsx` — **the Full-Time/Internships/Freelance filter
  row was removed**; the page always shows `type === "internship"` entries only
  (which is currently all 7 of the non-Ryerson entries — Ryerson is `"freelance"` and
  so doesn't show; Prestar/Amazon/Dayforce are all `"internship"`).
- `app/(sections)/projects/page.tsx` — the "Hackathon" filter chip was removed from
  `FILTERS` (All/Full-Stack/Back-end remain). `ProjectCard` now uses the
  `bg-card-tint`/`backdrop-blur-[3.8px]` translucent treatment (was flat `bg-panel`).
- `app/(sections)/projects/[slug]/page.tsx` — the "Projects > ProjectName" breadcrumb
  nav was replaced with a simple `← Projects` back-arrow link (`ArrowLeftIcon`).
- `app/(sections)/recommendations/page.tsx` — **the category tab row (Software
  Engineering/Content Creation/Artist/Freelance) was removed**; the page always shows
  `"software-engineering"` only. The per-company toggle in "Interested in reading
  more?" is unchanged. `QuoteCard` and `RoleCard` both use the translucent
  `bg-card-tint` treatment now, and `QuoteCard` no longer wraps its text in decorative
  quote marks (`&ldquo;`/`&rdquo;` removed) since the preview text isn't attributed to
  anyone anymore. `QuoteCard` also has **no hover effect** (removed
  `transition-colors hover:bg-card-tint-hover` — was toggled off, back on, then off
  again across a few requests; off is current).
- `app/(sections)/portfolio/page.tsx` — removed the white "mail icon" decorative
  header block that used to sit above the résumé card (that block was actually
  copy-pasted onto Contact originally, wasn't meant for both — see Contact below); the
  résumé card itself uses the translucent treatment; the redundant "My Résumé" caption
  under the PDF preview was removed (the page heading already says that); the Download
  button is right-aligned instead of split with the caption.
- `app/(sections)/contact/page.tsx` + `contact-form.tsx` — the white card + black
  `MailIcon` decorative header was removed entirely. The form card uses the
  translucent treatment. **Field labels above each input were removed** — each
  field's name is now its `placeholder` text (kept as `aria-label` too, so the label
  isn't lost for screen readers once the user starts typing). Inputs use the new
  `--color-input-bg` token. "What is it regarding?" was renamed to "Subject".
- `app/(sections)/{open-source,certifications,bonus}/page.tsx` — unchanged
  (`StubSection`), just no longer linked from nav (see `nav.ts` above).

## Open items / still outstanding

- **The sidebar-alignment load-time flash is unresolved** — see `Sidebar` above.
  Several fix attempts were made and reverted; the underlying issue (the sidebar
  name's position depends on runtime viewport height, so it can't be rendered
  correctly on the very first paint the way `DialNav`'s analogous issue could) is
  still real if revisited.
- **No real visual/browser QA this session either** — no Chrome extension connected,
  all verification was `tsc`/`eslint`/HTTP-level HTML checks. Several rounds of
  "why did X break" this session (backdrop-blur disappearing, the sidebar snap
  persisting, watermark speed "not changing") turned out to be either a real bug
  caught via user visual feedback, or a stale dev-server/Fast-Refresh issue — meaning
  the lack of direct visual access has been a real, repeated source of iteration
  overhead, not just a theoretical gap.
- Mobile/responsive treatment beyond the sidebar's stack-on-mobile behavior still
  hasn't been specifically discussed.
- Projects page content (`projects.ts`) is still the original placeholder set — not
  yet revisited with real project details the way Skills/Experience/Recommendations
  were.
- An admin page (edit hidden/visible sections + content from a UI) was discussed and
  explicitly declined in favor of continuing to hand-edit `lib/data/*.ts` directly —
  the tradeoffs (added auth/DB attack surface vs. convenience) are worth revisiting
  only if that becomes genuinely painful.

## Git / hosting state

Repo is live at **https://github.com/gdivecha/my-site** (public), `main` branch. Only
commit/push when explicitly asked. Recent commit history (newest first) roughly
tracks the sections above:
`3a22a7f` Compute experience duration from real dates instead of hardcoding it ·
`0f4b3db` Add site-wide search (Cmd+K) ·
`a7ac18b` Remove preview card hover effect, theme-aware watermark color ·
`a48c302` Skills expand-all/collapse-all, watermark/font tuning ·
`dff4dd0` Real recommendations content, fix Amazon term grouping ·
`b79682b` Real Experience content, more brand logos, profile link fixes ·
`34e49fc` Project card blur treatment, back-arrow instead of breadcrumb ·
`ed80fd4` Theme-aware dial tick color, purple social icon badges, input bg tweak ·
`9f49467` Hide unfinished sections and simplify filters to a single default view ·
`4ccce5d` Custom cursor, decoupled recommendation previews, contact form and
theme-token polish · `aac8ed8` Theme-aware tint tokens for translucent cards and
tag/badge backgrounds · `4a513b5` Sidebar spacing/color tweaks, hide page eyebrow
labels, restyle résumé card · `ce7099e` Skills accordion click-to-open, Experience
card redesign · `1762000` Real tech logos on Skills page, keyboard shortcuts, type/
visual polish.
