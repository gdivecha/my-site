// The one place every piece of metadata (OG tags, sitemap, JSON-LD, canonical
// URLs) reads the site's own absolute URL from. No domain is registered yet,
// so this falls back through: an explicit override, then Vercel's own
// auto-injected deployment URL (so metadata is already correct on the very
// first deploy with zero manual steps), then localhost for local dev. Once a
// real domain exists, setting NEXT_PUBLIC_SITE_URL in the Vercel project's
// env vars is the entire swap — nothing else in the codebase needs to change.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
