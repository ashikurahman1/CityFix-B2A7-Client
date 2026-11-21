import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon generated at build time from the logo mark. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #14a39a, #0b5f63)",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 32 32">
          <path d="M9 21.5V13l7-4.5 7 4.5v8.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
          <path d="m12.6 17.4 2.6 2.6 4.6-4.8" fill="none" stroke="#ffc24b" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    size,
  );
}
