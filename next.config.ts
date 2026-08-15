import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The "About" page was renamed to "Home" — keep old /about links/
  // bookmarks working rather than 404ing.
  async redirects() {
    return [{ source: "/about", destination: "/home", permanent: true }];
  },
};

export default nextConfig;
