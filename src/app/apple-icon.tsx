import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

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
          background: "#fafafa",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              width: 10,
              height: 92,
              borderRadius: 5,
              background: "#881337",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div
              style={{
                width: 64,
                height: 10,
                borderRadius: 5,
                background: "#111111",
              }}
            />
            <div
              style={{
                width: 52,
                height: 10,
                borderRadius: 5,
                background: "#2a2a28",
              }}
            />
            <div
              style={{
                width: 36,
                height: 10,
                borderRadius: 5,
                background: "#881337",
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
