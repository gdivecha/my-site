# Gaurav Divecha — Portfolio Site

Personal portfolio built with Next.js (App Router), TypeScript, and Tailwind CSS.
An app-shell layout: a persistent left sidebar with a vertical nav, and a right
content panel that swaps between real routes (`/about`, `/skills`, `/experience`,
`/projects`, `/portfolio`, `/recommendations`, `/open-source`, `/certifications`,
`/bonus`, `/contact`).

See `PROGRESS.md` for the full build log, design-token reference, component
conventions, environment gotchas, and a list of what's still placeholder content.

## Getting started

Next.js needs Node >=20.9. If your default Node is older, point at a newer one
explicitly (e.g. Homebrew's):

```bash
PATH="/opt/homebrew/bin:$PATH" npm install
PATH="/opt/homebrew/bin:$PATH" npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Building

```bash
PATH="/opt/homebrew/bin:$PATH" NODE_ENV=production npm run build
```

`NODE_ENV` must be `production` for the build — an inherited `development` value in
your shell will break prerendering.

## Content status

Most content (bios, experience, projects, recommendations, résumé) is placeholder —
see `PROGRESS.md` for exactly what's real vs. invented, and what to swap in.
