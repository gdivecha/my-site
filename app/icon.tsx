import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Same values as .text-gradient's dark-mode stops and --color-base in
// app/globals.css — kept as plain literals here since ImageResponse
// renders at request time, outside the page's own CSS cascade.
const BASE = "#0d0d14";
const ACCENT_SOFT = "#a79ff0";
const ACCENT_DEEP = "#4b3dc4";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: BASE,
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "sans-serif",
            fontSize: 30,
            fontWeight: 700,
            backgroundImage: `linear-gradient(90deg, ${ACCENT_SOFT}, ${ACCENT_DEEP})`,
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          GD
        </div>
      </div>
    ),
    { ...size }
  );
}
