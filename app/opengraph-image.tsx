import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/lib/data/profile";

export const alt = `${profile.name} - ${profile.roles.join(", ")}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Same accent tokens as --color-accent / --color-accent-deep in
// globals.css — satori (what ImageResponse renders through) can't read
// CSS custom properties, so the values are inlined here directly.
const ACCENT = "#6d5fe8";
const ACCENT_DEEP = "#4b3dc4";

export default async function Image() {
  const profilePic = await readFile(join(process.cwd(), "public/profile.jpg"));
  const profilePicSrc = `data:image/jpeg;base64,${profilePic.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "80px",
          background: "#0d0d14",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 680 }}>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1,
              backgroundImage: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DEEP})`,
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {profile.name}
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 30, color: "#a8a4c0" }}>
            {profile.roles.join(" · ")}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 32,
              fontSize: 26,
              lineHeight: 1.5,
              color: "#5c5878",
            }}
          >
            {profile.tagline}
          </div>
        </div>
        <img
          alt=""
          src={profilePicSrc}
          width={340}
          height={340}
          style={{
            borderRadius: "50%",
            objectFit: "cover",
            border: `6px solid ${ACCENT}`,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
