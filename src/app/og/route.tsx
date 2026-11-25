import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { fetchPublishedQuoteById, fetchTodayQuote } from "@/lib/quotes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WIDTH = 1200;
const HEIGHT = 630;

interface LoadedFonts {
  geistRegular: ArrayBuffer;
  geistRegularExt: ArrayBuffer;
  geistSemiBold: ArrayBuffer;
  geistSemiBoldExt: ArrayBuffer;
  geistMono: ArrayBuffer;
  geistMonoExt: ArrayBuffer;
}

let cachedFontsPromise: Promise<LoadedFonts> | null = null;

async function readFontBuffer(relativePath: string): Promise<ArrayBuffer> {
  const fullPath = path.join(process.cwd(), relativePath);
  const buf = await readFile(fullPath);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

function loadFonts(): Promise<LoadedFonts> {
  if (!cachedFontsPromise) {
    cachedFontsPromise = Promise.all([
      readFontBuffer("node_modules/@fontsource/geist/files/geist-latin-400-normal.woff"),
      readFontBuffer("node_modules/@fontsource/geist/files/geist-latin-ext-400-normal.woff"),
      readFontBuffer("node_modules/@fontsource/geist/files/geist-latin-600-normal.woff"),
      readFontBuffer("node_modules/@fontsource/geist/files/geist-latin-ext-600-normal.woff"),
      readFontBuffer("node_modules/@fontsource/geist-mono/files/geist-mono-latin-400-normal.woff"),
      readFontBuffer("node_modules/@fontsource/geist-mono/files/geist-mono-latin-ext-400-normal.woff"),
    ]).then(
      ([
        geistRegular,
        geistRegularExt,
        geistSemiBold,
        geistSemiBoldExt,
        geistMono,
        geistMonoExt,
      ]) => ({
        geistRegular,
        geistRegularExt,
        geistSemiBold,
        geistSemiBoldExt,
        geistMono,
        geistMonoExt,
      })
    );
  }
  return cachedFontsPromise;
}

function truncateAtWord(text: string, maxChars: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return clean;
  const sliced = clean.slice(0, maxChars - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  const cut = lastSpace > maxChars * 0.6 ? sliced.slice(0, lastSpace) : sliced;
  return `${cut.replace(/[,;:\-—\s]+$/, "")}…`;
}

function getHeroFontSize(length: number): number {
  if (length <= 72) return 48;
  if (length <= 125) return 41;
  if (length <= 185) return 35;
  return 31;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view");
  const id = searchParams.get("id");
  const version = searchParams.get("v");

  const fonts = await loadFonts();

  let topRightLabel = "quotes / commonplace";
  let headline = "Collected passages, aphorisms and marginalia";
  let subline = "A weekly commonplace of passages worth keeping close.";
  let footerLabel = "quotes / archive / commonplace";
  let cacheControl = "public, max-age=300, s-maxage=300";

  if (view === "library") {
    topRightLabel = "quotes / library";
    headline = "A living commonplace of collected quotes";
    subline = "Browse and filter weekly passages, authors and philosophical sources.";
    footerLabel = "quotes / library / commonplace";
    cacheControl = "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400";
  } else {
    const quote = id
      ? await fetchPublishedQuoteById(id)
      : (await fetchTodayQuote()).quote;

    if (quote) {
      topRightLabel = quote.weekLabel.toLowerCase();
      headline = truncateAtWord(quote.content, 228);

      const parts: string[] = [];
      if (quote.author?.trim()) parts.push(quote.author.trim());
      if (quote.sourceLabel?.trim()) parts.push(quote.sourceLabel.trim());
      subline = parts.join(" / ");

      footerLabel = "quotes / archive / commonplace";
      cacheControl =
        id && version
          ? "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400"
          : "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400";
    }
  }

  const heroFontSize = getHeroFontSize(headline.length);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#1c1b19",
          padding: 10,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "#141311",
            padding: "74px 136px 56px",
            color: "#ece9e2",
            fontFamily: '"Geist", "GeistExt", sans-serif',
          }}
        >
          {/* Top header row matching assets/og_image.png */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 600,
                letterSpacing: "-0.03em",
                color: "#ece9e2",
              }}
            >
              From the Cabinet
            </div>
            <div
              style={{
                fontFamily: '"GeistMono", "GeistMonoExt", monospace',
                fontSize: 20,
                fontWeight: 400,
                letterSpacing: "0.06em",
                color: "#9b978e",
              }}
            >
              {topRightLabel}
            </div>
          </div>

          {/* Center passage block + author + hairline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              marginTop: 12,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                fontSize: heroFontSize,
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.22,
                color: "#ece9e2",
              }}
            >
              {headline}
            </div>

            {subline ? (
              <div
                style={{
                  marginTop: 22,
                  fontSize: 23,
                  fontWeight: 400,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.35,
                  color: "#9b978e",
                }}
              >
                {subline}
              </div>
            ) : null}

            <div
              style={{
                marginTop: 26,
                width: "84%",
                height: 1.5,
                background: "rgba(236, 233, 226, 0.58)",
              }}
            />
          </div>

          {/* Bottom centered monospace line */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              fontFamily: '"GeistMono", "GeistMonoExt", monospace',
              fontSize: 20,
              fontWeight: 400,
              letterSpacing: "0.06em",
              color: "#9b978e",
            }}
          >
            {footerLabel}
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: {
        "Cache-Control": cacheControl,
      },
      fonts: [
        {
          name: "Geist",
          data: fonts.geistRegular,
          weight: 400,
          style: "normal",
        },
        {
          name: "GeistExt",
          data: fonts.geistRegularExt,
          weight: 400,
          style: "normal",
        },
        {
          name: "Geist",
          data: fonts.geistSemiBold,
          weight: 600,
          style: "normal",
        },
        {
          name: "GeistExt",
          data: fonts.geistSemiBoldExt,
          weight: 600,
          style: "normal",
        },
        {
          name: "GeistMono",
          data: fonts.geistMono,
          weight: 400,
          style: "normal",
        },
        {
          name: "GeistMonoExt",
          data: fonts.geistMonoExt,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );
}
