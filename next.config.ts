import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The "About" page was renamed to "Home" — keep old /about links/
  // bookmarks working rather than 404ing.
  async redirects() {
    return [{ source: "/about", destination: "/home", permanent: true }];
  },
  // No remote image sources yet — every image is local under public/,
  // already served through next/image. Add an `images: { remotePatterns:
  // [...] }` block here if a remote source (CMS, avatar service, etc.)
  // ever gets introduced.
};

export default nextConfig;
