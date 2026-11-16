"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatQuoteRow, formatTooltipHostPath, type QuoteItem } from "@/lib/quotes";
import SharePopover from "@/components/SharePopover";
import ScrambleText from "@/components/ScrambleText";

interface SingularQuoteStageProps {
  initialQuote: QuoteItem | null;
  totalCount: number;
  initialError: string | null;
}

type StagePhase = "visible" | "exiting" | "loading";

const EXIT_DURATION_MS = 240;
const LOADER_MIN_MS = 780;

export default function SingularQuoteStage({
  initialQuote,
  totalCount,
  initialError,
}: SingularQuoteStageProps) {
  const [quote, setQuote] = useState<QuoteItem | null>(initialQuote);
  const [error, setError] = useState<string | null>(initialError);
  const [phase, setPhase] = useState<StagePhase>("visible");
  const [loaderLabel, setLoaderLabel] = useState("Turning page");
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [revealSeq, setRevealSeq] = useState(0);

  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const copyTimerRef = useRef<number | null>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const transitionRunRef = useRef(0);
  const loaderRafRef = useRef<number | null>(null);
  const exitTimerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const clearTransitionTimers = () => {
    if (loaderRafRef.current !== null) {
      cancelAnimationFrame(loaderRafRef.current);
      loaderRafRef.current = null;
    }
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTransitionTimers();
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
      if (noticeTimerRef.current !== null) window.clearTimeout(noticeTimerRef.current);
    };
  }, []);

  const isViewingLatest = Boolean(initialQuote && quote && quote.id === initialQuote.id);
  const isBusy = phase !== "visible";

  const runLoaderSequence = (
    label: string,
    loadTask: (signal: AbortSignal) => Promise<{ nextQuote: QuoteItem | null; notice?: string }>
  ) => {
    clearTransitionTimers();
    const runId = ++transitionRunRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setStatusNotice(null);
    setShareOpen(false);
    setLoaderLabel(label);
    setLoaderProgress(0);

    const controller = new AbortController();
    abortRef.current = controller;
    const fetchPromise = loadTask(controller.signal);

    const startLoadingPhase = () => {
      if (transitionRunRef.current !== runId) return;
      setPhase("loading");

      const loadStart = performance.now();
      const minWait = reducedMotion ? 0 : LOADER_MIN_MS;

      if (!reducedMotion) {
        const tickProgress = (now: number) => {
          if (transitionRunRef.current !== runId) return;
          const t = Math.min((now - loadStart) / LOADER_MIN_MS, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          setLoaderProgress(eased * 96);
          if (t < 1) {
            loaderRafRef.current = requestAnimationFrame(tickProgress);
          }
        };
        loaderRafRef.current = requestAnimationFrame(tickProgress);
      }

      const waitMinPromise = new Promise<void>((resolve) => {
        if (minWait === 0) {
          resolve();
          return;
        }
        window.setTimeout(resolve, minWait);
      });

      Promise.all([fetchPromise, waitMinPromise])
        .then(([result]) => {
          if (transitionRunRef.current !== runId) return;

          if (loaderRafRef.current !== null) {
            cancelAnimationFrame(loaderRafRef.current);
            loaderRafRef.current = null;
          }
          setLoaderProgress(100);

          const finishSwap = () => {
            if (transitionRunRef.current !== runId) return;
            if (result.nextQuote) {
              setQuote(result.nextQuote);
              setError(null);
              setCopied(false);
              setRevealSeq((s) => s + 1);
            }
            if (result.notice) {
              setStatusNotice(result.notice);
              if (noticeTimerRef.current !== null) window.clearTimeout(noticeTimerRef.current);
              noticeTimerRef.current = window.setTimeout(() => setStatusNotice(null), 2600);
            }
            setPhase("visible");
          };

          if (reducedMotion) {
            finishSwap();
          } else {
            window.setTimeout(finishSwap, 110);
          }
        })
        .catch((err) => {
          if (transitionRunRef.current !== runId) return;
          if (err instanceof DOMException && err.name === "AbortError") return;
          setStatusNotice(
            err instanceof Error ? err.message : "Could not load passage."
          );
          setPhase("visible");
        });
    };

    if (reducedMotion || !quote) {
      startLoadingPhase();
      return;
    }

    setPhase("exiting");
    exitTimerRef.current = window.setTimeout(startLoadingPhase, EXIT_DURATION_MS);
  };

  const handleNextQuote = () => {
    if (isBusy || !quote) return;
    const currentId = quote.id;

    runLoaderSequence("Turning page", async (signal) => {
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
    if (isBusy || !initialQuote) return;
    runLoaderSequence("Returning to latest", async () => ({
      nextQuote: initialQuote,
    }));
  };

  const handleRetryToday = () => {
    if (isBusy) return;
    runLoaderSequence("Retrieving passage", async (signal) => {
      const res = await fetch("/api/quote/today", { cache: "no-store", signal });
      if (!res.ok) throw new Error("No quote available right now.");
      const row = await res.json();
      return { nextQuote: formatQuoteRow(row) };
    });
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
  const formattedProgress = String(Math.round(loaderProgress)).padStart(2, "0");

  return (
    <div className="wrap singular-wrap">
      <div className="col-prose singular-stage">
        {phase === "loading" ? (
          <div className="stage-loader" role="status" aria-live="polite">
            <div className="stage-loader-head">
              <span className="kicker">{loaderLabel}</span>
              <span className="kicker stage-loader-pct">{formattedProgress}%</span>
            </div>
            <div className="stage-loader-track" aria-hidden="true">
              <div
                className="stage-loader-fill"
                style={{ width: `${loaderProgress}%` }}
              />
            </div>
          </div>
        ) : !quote ? (
          <div className="empty-state enter" style={{ ["--d" as string]: 0 }}>
            <p className="empty-state-text">
              {error ? "Unable to load today's passage." : "No quotes available yet."}
            </p>
            <button
              type="button"
              className="reset-btn"
              onClick={handleRetryToday}
              disabled={isBusy}
            >
              Try again
            </button>
          </div>
        ) : (
          <article
            key={`${quote.id}-${revealSeq}`}
            className={`singular-article${phase === "exiting" ? " is-exiting" : ""}`}
          >
            {/* Eyebrow / Dateline */}
            <div className="singular-eyebrow enter" style={{ ["--d" as string]: 0 }}>
              <span className="kicker">
                {isViewingLatest ? "This Week" : "Archive"} / {quote.weekLabel}
              </span>

              {!isViewingLatest && initialQuote && (
                <button
                  type="button"
                  className="quote-action-btn kicker singular-latest-btn"
                  onClick={handleResetToLatest}
                  disabled={isBusy}
                >
                  Back to latest
                </button>
              )}
            </div>

            {/* Passage with left-to-right letter scramble resolve */}
            <blockquote
              className="singular-blockquote enter"
              style={{ ["--d" as string]: 1 }}
            >
              <ScrambleText
                text={quote.content}
                triggerKey={`${quote.id}-${revealSeq}`}
              />
            </blockquote>

            {/* Attribution */}
            <div
              className="singular-attribution enter"
              style={{ ["--d" as string]: 2 }}
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

            {/* Quiet Action Bar */}
            <div className="singular-controls enter" style={{ ["--d" as string]: 3 }}>
              <div className="singular-primary-actions">
                <button
                  type="button"
                  className="stage-btn stage-btn--primary"
                  onClick={handleNextQuote}
                  disabled={isBusy}
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
