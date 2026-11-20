"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatTooltipHostPath, type QuoteItem } from "@/lib/quotes";
import ScrambleText from "@/components/ScrambleText";

interface SingleQuoteViewProps {
  quote: QuoteItem;
}

export default function SingleQuoteView({ quote }: SingleQuoteViewProps) {
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const copyText = async (text: string, type: "quote" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    if (type === "quote") {
      setCopiedQuote(true);
      setCopiedLink(false);
    } else {
      setCopiedLink(true);
      setCopiedQuote(false);
    }

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setCopiedQuote(false);
      setCopiedLink(false);
    }, 1500);
  };

  return (
    <div className="wrap">
      <div className="col-prose single-quote-stage">
        <div className="single-quote-nav enter" style={{ ["--d" as string]: 0 }}>
          <Link href="/" className="single-quote-back kicker">
            ← Today&apos;s quote
          </Link>
          <Link href="/library" className="single-quote-back kicker">
            Library
          </Link>
        </div>

        <article>
          <div className="kicker enter" style={{ ["--d" as string]: 1 }}>
           {quote.weekLabel}
          </div>

          <blockquote className="single-quote-blockquote enter" style={{ ["--d" as string]: 2 }}>
            <ScrambleText text={quote.content} triggerKey={quote.id} />
          </blockquote>

          <div className="single-quote-footer enter" style={{ ["--d" as string]: 3 }}>
            <div className="quote-attribution">
              <Link
                href={`/library?author=${encodeURIComponent(quote.author)}`}
                className="author-chip"
              >
                {quote.author}
              </Link>

              {quote.sourceLabel && (
                <>
                  <span className="quote-sep" aria-hidden="true">
                    /
                  </span>
                  <Link
                    href={`/library?source=${encodeURIComponent(quote.sourceLabel)}`}
                    className="source-chip quote-work"
                    data-tooltip={`Filter library by ${quote.sourceLabel}`}
                  >
                    {quote.sourceLabel}
                  </Link>
                </>
              )}
            </div>

            <div className="quote-actions" style={{ opacity: 1 }}>
              <button
                type="button"
                className={`quote-action-btn kicker${copiedQuote ? " is-copied" : ""}`}
                onClick={() => copyText(`"${quote.content}" - ${quote.author}`, "quote")}
                data-tooltip={copiedQuote ? "Copied" : "Click to copy"}
              >
                {copiedQuote ? "Copied ✓" : "Copy"}
              </button>

              <button
                type="button"
                className={`quote-action-btn kicker${copiedLink ? " is-copied" : ""}`}
                onClick={() => copyText(window.location.href, "link")}
                data-tooltip={copiedLink ? "Copied" : "Click to copy"}
              >
                {copiedLink ? "Link copied ✓" : "Copy link"}
              </button>

              {quote.sourceUrl && (
                <a
                  href={quote.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="quote-action-link kicker"
                  data-tooltip={formatTooltipHostPath(quote.sourceUrl)}
                >
                  Source ↗
                </a>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
