"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatQuoteRow, formatTooltipHostPath, type QuoteItem } from "@/lib/quotes";
import SharePopover from "@/components/SharePopover";
import ContextPopover from "@/components/ContextPopover";

interface SingularQuoteStageProps {
  initialQuote: QuoteItem | null;
  totalCount: number;
  initialError: string | null;
}

export default function SingularQuoteStage({
  initialQuote,
  totalCount,
  initialError,
}: SingularQuoteStageProps) {
  const [quote, setQuote] = useState<QuoteItem | null>(initialQuote);
  const [error, setError] = useState<string | null>(initialError);
  const [isRotating, setIsRotating] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [contextAnchor, setContextAnchor] = useState<DOMRect | null>(null);

  const copyTimerRef = useRef<number | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
      if (noticeTimerRef.current !== null) window.clearTimeout(noticeTimerRef.current);
    };
  }, []);

  const isViewingLatest = Boolean(initialQuote && quote && quote.id === initialQuote.id);

  const handleNextQuote = async () => {
    if (isRotating || !quote) return;
    setIsRotating(true);
    setStatusNotice(null);
    setContextAnchor(null);

    try {
      const res = await fetch(`/api/quote/random?exclude=${encodeURIComponent(quote.id)}`, {
        cache: "no-store",
      });

      if (res.status === 404) {
        setStatusNotice("No other passages available yet.");
        if (noticeTimerRef.current !== null) window.clearTimeout(noticeTimerRef.current);
        noticeTimerRef.current = window.setTimeout(() => setStatusNotice(null), 2400);
        return;
      }

      if (!res.ok) {
        throw new Error("Could not load another passage.");
      }

      const row = await res.json();
      setQuote(formatQuoteRow(row));
      setCopied(false);
    } catch (err) {
      setStatusNotice(err instanceof Error ? err.message : "Could not load another passage.");
    } finally {
      setIsRotating(false);
    }
  };

  const handleResetToLatest = () => {
    if (!initialQuote) return;
    setQuote(initialQuote);
    setStatusNotice(null);
    setContextAnchor(null);
    setCopied(false);
  };

  const handleRetryToday = async () => {
    setIsRotating(true);
    setError(null);
    try {
      const res = await fetch("/api/quote/today", { cache: "no-store" });
      if (!res.ok) throw new Error("No quote available right now.");
      const row = await res.json();
      setQuote(formatQuoteRow(row));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load quote.");
    } finally {
      setIsRotating(false);
    }
  };

  const handleCopy = async () => {
    if (!quote) return;
    const text = `"${quote.content}" — ${quote.author}`;
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

    setCopied(true);
    if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => setCopied(false), 1500);
  };

  const formattedCount =
    totalCount > 0 ? String(totalCount).padStart(2, "0") : null;

  return (
    <div className="wrap singular-wrap">
      <div className="col-prose singular-stage">
        {!quote ? (
          <div className="empty-state enter" style={{ ["--d" as string]: 0 }}>
            <p className="empty-state-text">
              {error ? "Unable to load today's passage." : "No quotes available yet."}
            </p>
            <button
              type="button"
              className="reset-btn"
              onClick={handleRetryToday}
              disabled={isRotating}
            >
              {isRotating ? "Retrying…" : "Try again"}
            </button>
          </div>
        ) : (
          <article key={quote.id} className="singular-article enter" style={{ ["--d" as string]: 0 }}>
            {/* Eyebrow / Dateline */}
            <div className="singular-eyebrow">
              <span className="kicker">
                {isViewingLatest ? "This Week" : "Archive"} · {quote.weekLabel}
              </span>

              {!isViewingLatest && initialQuote && (
                <button
                  type="button"
                  className="quote-action-btn kicker singular-latest-btn"
                  onClick={handleResetToLatest}
                >
                  Back to latest
                </button>
              )}
            </div>

            {/* Passage */}
            <blockquote className="singular-blockquote">
              {quote.content}
            </blockquote>

            {/* Attribution */}
            <div className="singular-attribution">
              <Link
                href={`/library?author=${encodeURIComponent(quote.author)}`}
                className="author-chip"
                data-tooltip={`Filter library by ${quote.author}`}
              >
                {quote.author}
              </Link>

              {quote.sourceLabel && (
                <>
                  <span className="quote-sep" aria-hidden="true">
                    ·
                  </span>
                  {quote.sourceUrl ? (
                    <a
                      href={quote.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="quote-work"
                      data-tooltip={formatTooltipHostPath(quote.sourceUrl)}
                    >
                      {quote.sourceLabel} ↗
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="quote-work quote-work-btn"
                      onClick={(e) =>
                        setContextAnchor((prev) =>
                          prev ? null : e.currentTarget.getBoundingClientRect()
                        )
                      }
                    >
                      {quote.sourceLabel}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Quiet Action Bar */}
            <div className="singular-controls">
              <div className="singular-primary-actions">
                <button
                  type="button"
                  className="stage-btn stage-btn--primary"
                  onClick={handleNextQuote}
                  disabled={isRotating}
                  aria-label="Show another historical quote"
                >
                  <span>{isRotating ? "Turning page…" : "Another thought"}</span>
                  <span aria-hidden="true">→</span>
                </button>

                <Link
                  href="/library"
                  className="stage-btn stage-btn--ghost"
                  data-tooltip="Browse all collected quotes"
                >
                  <span>
                    Library{formattedCount ? ` · ${formattedCount}` : ""}
                  </span>
                </Link>
              </div>

              <div className="singular-utility-actions">
                <button
                  type="button"
                  className={`quote-action-btn kicker${copied ? " is-copied" : ""}`}
                  onClick={handleCopy}
                  data-tooltip={copied ? "Copied" : "Click to copy"}
                >
                  {copied ? "Copied ✓" : "Copy"}
                </button>

                <button
                  type="button"
                  className="quote-action-btn kicker"
                  onClick={() => setShareOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={shareOpen}
                >
                  Share
                </button>

                <Link
                  href={`/quote/${quote.id}`}
                  className="quote-action-link kicker"
                  data-tooltip="Direct permalink"
                >
                  Permalink
                </Link>
              </div>
            </div>

            {statusNotice && (
              <p className="singular-notice kicker" role="status" aria-live="polite">
                {statusNotice}
              </p>
            )}
          </article>
        )}
      </div>

      {shareOpen && quote && (
        <SharePopover quote={quote} onClose={() => setShareOpen(false)} />
      )}

      {contextAnchor && quote && (
        <ContextPopover
          quote={quote}
          anchorRect={contextAnchor}
          onClose={() => setContextAnchor(null)}
        />
      )}
    </div>
  );
}
