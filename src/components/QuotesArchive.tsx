"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatTooltipHostPath, type QuoteItem } from "@/lib/quotes";
import ContextPopover from "@/components/ContextPopover";

interface QuotesArchiveProps {
  initialQuotes: QuoteItem[];
  todayQuoteId: string | null;
  initialError: string | null;
}

export default function QuotesArchive({
  initialQuotes,
  todayQuoteId,
  initialError,
}: QuotesArchiveProps) {
  const router = useRouter();

  const [quotes, setQuotes] = useState<QuoteItem[]>(initialQuotes);
  const [loadError, setLoadError] = useState<string | null>(initialError);
  const [retrying, setRetrying] = useState(false);

  const [query, setQuery] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [urlHydrated, setUrlHydrated] = useState(false);

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [contextState, setContextState] = useState<{
    quote: QuoteItem;
    anchorRect: DOMRect;
  } | null>(null);

  const popoverWrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const copyTimerRef = useRef<number | null>(null);

  // Hydrate filters from URL query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get("q") ?? "";
    const authorParam = params.get("author") ?? params.get("topic");
    const yearParam = params.get("year");

    if (qParam) setQuery(qParam);
    if (authorParam) setSelectedAuthor(authorParam);
    if (yearParam) setSelectedYear(yearParam);
    setUrlHydrated(true);
  }, []);

  // Sync active filters back to URL cleanly via history.replaceState
  useEffect(() => {
    if (!urlHydrated) return;

    const params = new URLSearchParams();
    const trimmed = query.trim();
    if (trimmed) params.set("q", trimmed);
    if (selectedAuthor) params.set("author", selectedAuthor);
    if (selectedYear) params.set("year", selectedYear);

    const qs = params.toString();
    const nextUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (nextUrl !== currentUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, [query, selectedAuthor, selectedYear, urlHydrated]);

  // Close Authors popover on Escape or outside click
  useEffect(() => {
    if (!popoverOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setPopoverOpen(false);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (popoverWrapRef.current && !popoverWrapRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [popoverOpen]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  // Derived author & year facets
  const { authors, topAuthors, years } = useMemo(() => {
    const authorCounts = new Map<string, number>();
    const yearSet = new Set<string>();

    for (const q of quotes) {
      const a = q.author.trim();
      if (a) authorCounts.set(a, (authorCounts.get(a) ?? 0) + 1);
      if (q.year) yearSet.add(q.year);
    }

    const sortedAuthors = Array.from(authorCounts.entries()).sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });

    return {
      authors: sortedAuthors.map(([name, count]) => ({ name, count })),
      topAuthors: sortedAuthors.slice(0, 3).map(([name]) => name),
      years: Array.from(yearSet).sort((a, b) => b.localeCompare(a)),
    };
  }, [quotes]);

  // Filtered quote stream
  const filteredQuotes = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return quotes.filter((q) => {
      if (selectedAuthor && q.author.toLowerCase() !== selectedAuthor.toLowerCase()) {
        return false;
      }
      if (selectedYear && q.year !== selectedYear) {
        return false;
      }
      if (needle) {
        const haystack = `${q.content} ${q.author} ${q.source ?? ""} ${q.year}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }, [quotes, query, selectedAuthor, selectedYear]);

  // IntersectionObserver for [data-reveal] rows below the fold
  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;

    const nodes = Array.from(listEl.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (nodes.length === 0) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || typeof IntersectionObserver === "undefined") {
      nodes.forEach((node) => node.setAttribute("data-reveal", "visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-reveal", "visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.06, rootMargin: "0px 0px -16px 0px" }
    );

    for (const node of nodes) {
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.96) {
        node.setAttribute("data-reveal", "visible");
      } else {
        observer.observe(node);
      }
    }

    return () => observer.disconnect();
  }, [filteredQuotes]);

  const resetFilters = useCallback(() => {
    setQuery("");
    setSelectedAuthor(null);
    setSelectedYear(null);
    setPopoverOpen(false);
  }, []);

  const toggleAuthor = useCallback((author: string) => {
    setSelectedAuthor((prev) => (prev === author ? null : author));
  }, []);

  const toggleYear = useCallback((year: string) => {
    setSelectedYear((prev) => (prev === year ? null : year));
  }, []);

  const handleCopy = async (quote: QuoteItem) => {
    const formatted = `"${quote.content}" — ${quote.author}`;
    try {
      await navigator.clipboard.writeText(formatted);
    } catch {
      // Fallback for non-secure contexts
      const textarea = document.createElement("textarea");
      textarea.value = formatted;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopiedId(quote.id);
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  const handleRandom = () => {
    if (quotes.length === 0) return;
    const pool = filteredQuotes.length > 0 ? filteredQuotes : quotes;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    router.push(`/quote/${picked.id}`);
  };

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const res = await fetch("/api/quotes", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error ?? "Unable to load quotes.");
      } else {
        setQuotes(data.quotes ?? []);
        setLoadError(null);
      }
    } catch {
      setLoadError("Unable to reach the archive.");
    } finally {
      setRetrying(false);
    }
  };

  const openContext = (quote: QuoteItem, triggerEl: HTMLElement) => {
    if (contextState?.quote.id === quote.id) {
      setContextState(null);
      return;
    }
    setContextState({
      quote,
      anchorRect: triggerEl.getBoundingClientRect(),
    });
  };

  const formattedCount = String(filteredQuotes.length).padStart(2, "0");
  const entryNoun = filteredQuotes.length === 1 ? "Entry" : "Entries";
  const hasActiveFilter = Boolean(query.trim() || selectedAuthor || selectedYear);
  const popoverActive = Boolean(selectedAuthor || selectedYear);
  const popoverLabel = selectedAuthor
    ? `Authors · ${selectedAuthor}`
    : selectedYear
      ? `Authors · ${selectedYear}`
      : "Authors";

  return (
    <div className="wrap">
      <div className="col-wide">
        {/* Page Head */}
        <section className="page-head enter" style={{ ["--d" as string]: 0 }}>
          <div className="page-eyebrow">
            <span className="kicker" aria-live="polite">
              Commonplace · {formattedCount} {entryNoun}
            </span>

            <div className="eyebrow-links">
              <Link href="/" className="quote-action-link kicker">
                ← Today&apos;s quote
              </Link>

              {quotes.length > 1 && (
                <button
                  type="button"
                  className="quote-action-btn kicker"
                  onClick={handleRandom}
                  data-tooltip="Open a random passage"
                >
                  Random ↗
                </button>
              )}
            </div>
          </div>

          <h1 className="page-title">Library</h1>
          <p className="page-lede">
            Collected passages, aphorisms, and marginalia worth keeping close.
          </p>
        </section>

        {/* Control Bar */}
        <div
          className="control-bar enter"
          style={{ ["--d" as string]: 1 }}
          role="search"
          aria-label="Filter quotes"
        >
          <div className="search-wrap">
            <label htmlFor="quote-search" className="sr-only">
              Filter by quote, author, or source
            </label>
            <input
              id="quote-search"
              type="search"
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by quote, author, or source…"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="filter-controls" role="group" aria-label="Quick author filters">
            <button
              type="button"
              className="filter-tab kicker"
              aria-pressed={!selectedAuthor && !selectedYear}
              onClick={() => {
                setSelectedAuthor(null);
                setSelectedYear(null);
              }}
            >
              All
            </button>

            {topAuthors.map((author) => (
              <button
                key={author}
                type="button"
                className="filter-tab kicker"
                aria-pressed={selectedAuthor === author}
                onClick={() => toggleAuthor(author)}
              >
                {author}
              </button>
            ))}

            {(authors.length > 0 || years.length > 1) && (
              <>
                <span className="filter-divider" aria-hidden="true" />

                <div ref={popoverWrapRef} className="authors-popover-wrap">
                  <button
                    type="button"
                    className={`authors-toggle kicker${popoverActive ? " is-active" : ""}`}
                    aria-expanded={popoverOpen}
                    aria-controls="authors-filter-popover"
                    onClick={() => setPopoverOpen((prev) => !prev)}
                  >
                    <span>{popoverLabel}</span>
                    <svg
                      className="authors-toggle-chevron"
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  {popoverOpen && (
                    <div
                      id="authors-filter-popover"
                      className="authors-popover"
                      role="dialog"
                      aria-label="Filter by author or year"
                    >
                      <div className="popover-head">
                        <span className="popover-title">Authors &amp; years</span>
                        {popoverActive && (
                          <button
                            type="button"
                            className="popover-clear"
                            onClick={() => {
                              setSelectedAuthor(null);
                              setSelectedYear(null);
                              setPopoverOpen(false);
                            }}
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      <div className="popover-tags">
                        {authors.map(({ name, count }) => (
                          <button
                            key={name}
                            type="button"
                            className="tag-filter-btn"
                            aria-pressed={selectedAuthor === name}
                            onClick={() => {
                              toggleAuthor(name);
                              setPopoverOpen(false);
                            }}
                          >
                            {name} ({count})
                          </button>
                        ))}
                      </div>

                      {years.length > 1 && (
                        <>
                          <span className="popover-section-label kicker">Years</span>
                          <div className="popover-tags">
                            {years.map((year) => (
                              <button
                                key={year}
                                type="button"
                                className="tag-filter-btn"
                                aria-pressed={selectedYear === year}
                                onClick={() => {
                                  toggleYear(year);
                                  setPopoverOpen(false);
                                }}
                              >
                                {year}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error fallback when DB unreachable */}
        {loadError && quotes.length === 0 ? (
          <div className="empty-state enter" style={{ ["--d" as string]: 2 }}>
            <p className="empty-state-text">
              Unable to load the archive right now.
            </p>
            <button
              type="button"
              className="reset-btn"
              onClick={handleRetry}
              disabled={retrying}
            >
              {retrying ? "Retrying…" : "Try again"}
            </button>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="empty-state enter" style={{ ["--d" as string]: 2 }}>
            <p className="empty-state-text">No quotes match that query.</p>
            {hasActiveFilter && (
              <button type="button" className="reset-btn" onClick={resetFilters}>
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <ul ref={listRef} className="quotes-list">
            {filteredQuotes.map((quote, index) => {
              const isAboveFold = index < 5;
              const isAccented =
                quote.id === todayQuoteId || quote.content.length > 165;
              const isCopied = copiedId === quote.id;

              return (
                <li
                  key={quote.id}
                  className={`quote-row${isAboveFold ? " enter" : ""}`}
                  style={isAboveFold ? { ["--d" as string]: index + 2 } : undefined}
                  data-reveal={isAboveFold ? undefined : "pending"}
                >
                  <blockquote
                    className={`quote-passage${isAccented ? " quote-passage--accented" : ""}`}
                  >
                    {quote.content}
                  </blockquote>

                  <div className="quote-meta">
                    <div className="quote-attribution">
                      <button
                        type="button"
                        className="author-chip"
                        onClick={() => toggleAuthor(quote.author)}
                        aria-pressed={selectedAuthor === quote.author}
                      >
                        {quote.author}
                      </button>

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
                            <span className="quote-work">{quote.sourceLabel}</span>
                          )}
                        </>
                      )}

                      {quote.year && (
                        <>
                          <span className="quote-sep" aria-hidden="true">
                            ·
                          </span>
                          <button
                            type="button"
                            className="year-chip kicker"
                            onClick={() => toggleYear(quote.year)}
                            aria-pressed={selectedYear === quote.year}
                          >
                            {quote.year}
                          </button>
                        </>
                      )}
                    </div>

                    <div className="quote-actions">
                      <button
                        type="button"
                        className={`quote-action-btn kicker${isCopied ? " is-copied" : ""}`}
                        onClick={() => handleCopy(quote)}
                        data-tooltip={isCopied ? "Copied" : "Click to copy"}
                        aria-label={`Copy quote by ${quote.author}`}
                      >
                        {isCopied ? "Copied ✓" : "Copy"}
                      </button>

                      {quote.sourceUrl ? (
                        <a
                          href={quote.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="quote-action-link kicker"
                          data-tooltip={formatTooltipHostPath(quote.sourceUrl)}
                        >
                          Source ↗
                        </a>
                      ) : quote.source ? (
                        <button
                          type="button"
                          className="quote-action-btn kicker"
                          onClick={(e) => openContext(quote, e.currentTarget)}
                          aria-expanded={contextState?.quote.id === quote.id}
                        >
                          Note
                        </button>
                      ) : null}

                      <Link
                        href={`/quote/${quote.id}`}
                        className="quote-action-link kicker"
                        aria-label={`Permalink for quote by ${quote.author}`}
                      >
                        {quote.weekLabel}
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {contextState && (
        <ContextPopover
          quote={contextState.quote}
          anchorRect={contextState.anchorRect}
          onClose={() => setContextState(null)}
        />
      )}
    </div>
  );
}
