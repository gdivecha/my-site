import type { Metadata, Viewport } from "next";
import { Poppins, Inter } from "next/font/google";
import { CustomCursor } from "@/components/CustomCursor";
import { DisableZoomGesture } from "@/components/DisableZoomGesture";
import { profile } from "@/lib/data/profile";
import { skillCategories } from "@/lib/data/skills";
import { siteUrl } from "@/lib/site-config";
import "./globals.css";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.roles[0],
  url: siteUrl,
  image: `${siteUrl}/profile.jpg`,
  email: profile.email,
  address: profile.location,
  alumniOf: profile.education,
  sameAs: profile.socials.map((s) => s.href),
};

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Gaurav Divecha - Software Engineer, Artist, Content Creator",
    template: "%s | Gaurav Divecha",
  },
  description:
    "Portfolio of Gaurav Divecha - Software Engineer, Artist, and Content Creator.",
  keywords: [
    ...profile.roles,
    ...skillCategories.map((c) => c.label),
    profile.location,
  ],
  robots: { index: true, follow: true },
  openGraph: {
    title: profile.name,
    description: profile.tagline,
    url: "/",
    siteName: profile.name,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: profile.name,
    description: profile.tagline,
  },
};

// Disables pinch-to-zoom on touch devices (Ctrl/Cmd+scroll and trackpad
// pinch on desktop are handled separately by DisableZoomGesture, since
// browsers don't expose those as a viewport setting).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          // JSON.stringify doesn't escape "<" inside string values on its
          // own, which could otherwise break out of the script tag early
          // (e.g. a "</script>" substring) — replacing it with its unicode
          // escape keeps this valid JSON while making that impossible.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              // Runs before the browser's own scroll-restoration kicks in
              // (that happens on load, ahead of any React effect) — without
              // this, a hard refresh on a page you'd scrolled down snaps
              // right back to that old position, restoring the sidebar's
              // fixed layout mid-scroll instead of the fresh page it
              // actually is. `history.scrollRestoration = "manual"` turns
              // that automatic restore off entirely, so a reload always
              // lands at the top like a genuinely fresh load should.
              '(function(){try{if("scrollRestoration" in history){history.scrollRestoration="manual";}}catch(e){}})();' +
              '(function(){try{if(localStorage.getItem("theme")==="light"){document.documentElement.setAttribute("data-theme","light");}}catch(e){}})();',
          }}
        />
      </head>
      <body className="min-h-full bg-base text-ink">
        {children}
        <CustomCursor />
        <DisableZoomGesture />
      </body>
    </html>
  );
}
