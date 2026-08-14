import type { Metadata, Viewport } from "next";
import { Poppins, Inter } from "next/font/google";
import { CustomCursor } from "@/components/CustomCursor";
import { DisableZoomGesture } from "@/components/DisableZoomGesture";
import "./globals.css";

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
  title: "Gaurav Divecha - Software Engineer, Artist, Content Creator",
  description:
    "Portfolio of Gaurav Divecha - Software Engineer, Artist, and Content Creator.",
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
          dangerouslySetInnerHTML={{
            __html:
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
