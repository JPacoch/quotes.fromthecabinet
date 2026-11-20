import { ImageResponse } from "next/og";
import { fetchPublishedQuoteById } from "@/lib/quotes";

export const runtime = "nodejs";
export const alt = "Quote - From the Cabinet";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface QuoteOgProps {
  params: Promise<{ id: string }>;
}

export default async function QuoteOpenGraphImage({ params }: QuoteOgProps) {
  const { id } = await params;
  const quote = await fetchPublishedQuoteById(id);

  if (!quote) {
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
          <div style={{ fontSize: 20, letterSpacing: "0.14em", color: "#881337" }}>
            COMMONPLACE / FROM THE CABINET
          </div>
          <div style={{ fontSize: 64, fontWeight: 600, letterSpacing: "-0.03em" }}>
            Quotes - From the Cabinet
          </div>
          <div style={{ fontSize: 20, color: "#5c5c58" }}>quotes.fromthecabinet.com</div>
        </div>
      ),
      { ...size }
    );
  }

  const trimmedContent =
    quote.content.length > 220 ? `${quote.content.slice(0, 217)}…` : quote.content;
  const fontSize =
    trimmedContent.length > 160 ? 32 : trimmedContent.length > 95 ? 40 : 48;

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
          padding: "72px 84px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 18,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#881337",
          }}
        >
          <span>COMMONPLACE / {quote.weekLabel.toUpperCase()}</span>
          <span style={{ color: "#8a8a84" }}>FROM THE CABINET</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderLeft: "4px solid #111111",
            paddingLeft: 36,
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize,
              lineHeight: 1.38,
              letterSpacing: "-0.02em",
              color: "#111111",
            }}
          >
            {trimmedContent}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 24,
              color: "#2a2a28",
            }}
          >
            <span style={{ fontWeight: 600 }}>{quote.author}</span>
            {quote.sourceLabel ? (
              <>
                <span style={{ color: "#8a8a84" }}>/</span>
                <span style={{ color: "#5c5c58" }}>{quote.sourceLabel}</span>
              </>
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(17, 17, 17, 0.12)",
            paddingTop: 24,
            fontSize: 18,
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
