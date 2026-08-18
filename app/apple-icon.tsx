import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const ACCENT = "#6d5fe8";
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
          background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DEEP})`,
          fontFamily: "sans-serif",
          fontSize: 84,
          fontWeight: 700,
          color: "#f2f1f8",
        }}
      >
        GD
      </div>
    ),
    { ...size }
  );
}
