import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { CustomCursor } from "@/components/CustomCursor";
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
      </body>
    </html>
  );
}
