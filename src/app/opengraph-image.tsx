import { ImageResponse } from "next/og";

export const alt = "CityFix — report city problems, track every fix";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social share card for every public page that doesn't define its own. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#fff",
          background: "radial-gradient(circle at 85% 15%, #f0a93a 0%, transparent 35%), linear-gradient(135deg, #0f8a83 0%, #0b4f55 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="72" height="72" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="9" fill="rgba(255,255,255,0.14)" />
            <path d="M9 21.5V13l7-4.5 7 4.5v8.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
            <path d="m12.6 17.4 2.6 2.6 4.6-4.8" fill="none" stroke="#ffc24b" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 44, fontWeight: 700 }}>CityFix</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <span style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>Your city, fixed faster.</span>
          <span style={{ fontSize: 32, opacity: 0.85 }}>
            Report problems · Pay for municipal services · Track every request against its SLA
          </span>
        </div>
      </div>
    ),
    size,
  );
}
