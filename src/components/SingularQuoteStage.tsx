"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatQuoteRow, formatTooltipHostPath, type QuoteItem } from "@/lib/quotes";
import SharePopover from "@/components/SharePopover";
import ScrambleText from "@/components/ScrambleText";

interface SingularQuoteStageProps {
  initialQuote: QuoteItem | null;
  totalCount: number;
  initialError: string | null;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function SingularQuoteStage({
  initialQuote,
  totalCount,
  initialError,
}: SingularQuoteStageProps) {
  const [quote, setQuote] = useState<QuoteItem | null>(initialQuote);
  const [error, setError] = useState<string | null>(initialError);
  const [isFetching, setIsFetching] = useState(false);
  const [revealSeq, setRevealSeq] = useState(0);

  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const slotRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const prevHeightRef = useRef<number | null>(null);
  const heightTimerRef = useRef<number | null>(null);

  const copyTimerRef = useRef<number | null>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const transitionRunRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
      if (noticeTimerRef.current !== null) window.clearTimeout(noticeTimerRef.current);
      if (heightTimerRef.current !== null) window.clearTimeout(heightTimerRef.current);
    };
  }, []);

  // Smoothly interpolate slot height whenever a new quote has a different line count
  useIsomorphicLayoutEffect(() => {
    const slot = slotRef.current;
    const inner = innerRef.current;
    const prevHeight = prevHeightRef.current;
    prevHeightRef.current = null;

    if (!slot || !inner || prevHeight === null) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      slot.style.height = "";
      slot.style.transition = "";
      return;
    }

    if (heightTimerRef.current !== null) {
      window.clearTimeout(heightTimerRef.current);
      heightTimerRef.current = null;
    }

    // Measure natural height of new content before locking
    slot.style.transition = "none";
    slot.style.height = "auto";
    const nextHeight = inner.getBoundingClientRect().height;

    if (Math.abs(nextHeight - prevHeight) < 1) {
      slot.style.height = "";
      slot.style.transition = "";
      return;
    }

    // Lock at previous height, force reflow, then glide to target height
    slot.style.height = `${prevHeight}px`;
    void slot.offsetHeight;
    slot.style.transition = "height 460ms var(--ease-out)";
    slot.style.height = `${nextHeight}px`;

    const releaseHeight = () => {
      slot.style.height = "";
      slot.style.transition = "";
      if (heightTimerRef.current !== null) {
        window.clearTimeout(heightTimerRef.current);
        heightTimerRef.current = null;
      }
    };

    const onEnd = (e: TransitionEvent) => {
      if (e.target === slot && e.propertyName === "height") {
        slot.removeEventListener("transitionend", onEnd);
        releaseHeight();
      }
    };

    slot.addEventListener("transitionend", onEnd);
    heightTimerRef.current = window.setTimeout(() => {
      slot.removeEventListener("transitionend", onEnd);
      releaseHeight();
    }, 520);

    return () => {
      slot.removeEventListener("transitionend", onEnd);
    };
  }, [quote?.id, revealSeq]);

  const isViewingLatest = Boolean(initialQuote && quote && quote.id === initialQuote.id);

  const applyNextQuote = (nextQuote: QuoteItem) => {
    if (slotRef.current) {
      prevHeightRef.current = slotRef.current.getBoundingClientRect().height;
    }
    setQuote(nextQuote);
    setError(null);
    setCopied(false);
    setRevealSeq((s) => s + 1);
  };

  const loadQuote = async (
    loadTask: (signal: AbortSignal) => Promise<{ nextQuote: QuoteItem | null; notice?: string }>
  ) => {
    if (isFetching) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const runId = ++transitionRunRef.current;

    setIsFetching(true);
    setStatusNotice(null);
    setShareOpen(false);

    try {
      const result = await loadTask(controller.signal);
      if (transitionRunRef.current !== runId) return;

      if (result.nextQuote) {
        applyNextQuote(result.nextQuote);
      }
      if (result.notice) {
        setStatusNotice(result.notice);
        if (noticeTimerRef.current !== null) window.clearTimeout(noticeTimerRef.current);
        noticeTimerRef.current = window.setTimeout(() => setStatusNotice(null), 2600);
      }
    } catch (err) {
      if (transitionRunRef.current !== runId) return;
      if (err instanceof DOMException && err.name === "AbortError") return;
      setStatusNotice(err instanceof Error ? err.message : "Could not load passage.");
    } finally {
      if (transitionRunRef.current === runId) {
        setIsFetching(false);
      }
    }
  };

  const handleNextQuote = () => {
    if (isFetching || !quote) return;
    const currentId = quote.id;

    void loadQuote(async (signal) => {
      const res = await fetch(
        `/api/quote/random?exclude=${encodeURIComponent(currentId)}`,
        { cache: "no-store", signal }
      );

      if (res.status === 404) {
        return {
          nextQuote: null,
          notice: "No other passages available yet.",
        };
      }

      if (!res.ok) {
        throw new Error("Could not load another passage.");
      }

      const row = await res.json();
      return { nextQuote: formatQuoteRow(row) };
    });
  };

  const handleResetToLatest = () => {
    if (isFetching || !initialQuote) return;
    setStatusNotice(null);
    setShareOpen(false);
    applyNextQuote(initialQuote);
  };

  const handleRetryToday = () => {
    if (isFetching) return;
    void loadQuote(async (signal) => {
      const res = await fetch("/api/quote/today", { cache: "no-store", signal });
      if (!res.ok) throw new Error("No quote available right now.");
      const row = await res.json();
      return { nextQuote: formatQuoteRow(row) };
    });
  };

  const handleCopy = async () => {
    if (!quote) return;
    const text = `"${quote.content}" - ${quote.author}`;
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
              disabled={isFetching}
            >
              Try again
            </button>
          </div>
        ) : (
          <article className="singular-article">
            {/* Eyebrow / Dateline */}
            <div className="singular-eyebrow enter" style={{ ["--d" as string]: 0 }}>
              <span
                key={`eyebrow-${quote.id}-${revealSeq}`}
                className={revealSeq > 0 ? "kicker text-swap-in" : "kicker"}
              >
                {isViewingLatest ? "This Week" : "Archive"} / {quote.weekLabel}
              </span>

              {!isViewingLatest && initialQuote && (
                <button
                  type="button"
                  className="quote-action-btn kicker singular-latest-btn"
                  onClick={handleResetToLatest}
                  disabled={isFetching}
                >
                  Back to latest
                </button>
              )}
            </div>

            {/* Smoothly height-interpolated quote & attribution region */}
            <div ref={slotRef} className="singular-quote-slot">
              <div ref={innerRef} className="singular-quote-inner">
                <blockquote
                  className="singular-blockquote enter"
                  style={{ ["--d" as string]: 1 }}
                >
                  <ScrambleText
                    text={quote.content}
                    triggerKey={`${quote.id}-${revealSeq}`}
                  />
                </blockquote>

                <div
                  key={`attr-${quote.id}-${revealSeq}`}
                  className={
                    revealSeq > 0
                      ? "singular-attribution text-swap-in"
                      : "singular-attribution enter"
                  }
                  style={revealSeq === 0 ? { ["--d" as string]: 2 } : undefined}
                >
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
              </div>
            </div>

            {/* Stationary Action Bar */}
            <div className="singular-controls enter" style={{ ["--d" as string]: 3 }}>
              <div className="singular-primary-actions">
                <button
                  type="button"
                  className="stage-btn stage-btn--primary"
                  onClick={handleNextQuote}
                  disabled={isFetching}
                  aria-busy={isFetching}
                  aria-label="Show another historical quote"
                >
                  <span>Another thought</span>
                  <span aria-hidden="true">→</span>
                </button>

                <Link
                  href="/library"
                  className="stage-btn stage-btn--ghost"
                  data-tooltip="Browse all collected quotes"
                >
                  <span>
                    Library{formattedCount ? ` / ${formattedCount}` : ""}
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
    </div>
  );
}
