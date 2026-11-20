import { ImageResponse } from "next/og";

export const alt = "Quotes - From the Cabinet";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

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
          background: "#fafafa",
          color: "#111111",
          padding: "76px 88px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 20,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#881337",
          }}
        >
          <span>COMMONPLACE / FROM THE CABINET</span>
          <span style={{ color: "#8a8a84" }}>WEEKLY PASSAGES</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderLeft: "4px solid #111111",
            paddingLeft: 38,
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: 78,
              fontWeight: 600,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: "#111111",
            }}
          >
            Quotes
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.4,
              color: "#5c5c58",
              maxWidth: 820,
            }}
          >
            Collected passages, aphorisms and marginalia worth keeping close.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(17, 17, 17, 0.12)",
            paddingTop: 26,
            fontSize: 20,
            color: "#5c5c58",
          }}
        >
          <span>quotes.fromthecabinet.com</span>
          <span style={{ color: "#8a8a84" }}>Jakub Pacocha</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
