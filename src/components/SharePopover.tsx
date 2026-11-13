"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { QuoteItem } from "@/lib/quotes";

interface SharePopoverProps {
  quote: QuoteItem;
  onClose: () => void;
}

export default function SharePopover({ quote, onClose }: SharePopoverProps) {
  const [closing, setClosing] = useState(false);
  const [copiedType, setCopiedType] = useState<"quote" | "link" | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  const requestClose = () => {
    if (closing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }
    setClosing(true);
    window.setTimeout(() => {
      onClose();
    }, 200);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        requestClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://quotes.fromthecabinet.com";
  const permalink = `${origin}/quote/${quote.id}`;
  const shareText = `"${quote.content}" — ${quote.author}`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(permalink);

  const shareLinks = [
    {
      label: "X / Twitter ↗",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      tooltip: "Share on X",
    },
    {
      label: "LinkedIn ↗",
      href: `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(
        `${shareText}\n${permalink}`
      )}`,
      tooltip: "Share on LinkedIn",
    },
    {
      label: "Facebook ↗",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodeURIComponent(
        `${shareText}\n${permalink}`
      )}`,
      tooltip: "Share on Facebook",
    },
  ];

  const handleCopy = async (text: string, kind: "quote" | "link") => {
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
    setCopiedType(kind);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopiedType(null), 1500);
  };

  const excerpt =
    quote.content.length > 105 ? `${quote.content.slice(0, 102)}…` : quote.content;

  return (
    <div
      className={`share-backdrop${closing ? " is-closing" : ""}`}
      onClick={(e) => {
        if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
          requestClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Share this quote"
    >
      <div
        ref={cardRef}
        className={`share-dialog${closing ? " is-closing" : ""}`}
      >
        <div className="context-popover-head">
          <span className="context-popover-label-wrap">
            <span className="context-popover-dot" aria-hidden="true" />
            <span className="context-popover-title">Share passage</span>
          </span>

          <button
            type="button"
            className="context-popover-close"
            onClick={requestClose}
            aria-label="Close share dialog"
          >
            ×
          </button>
        </div>

        <p className="share-excerpt">&ldquo;{excerpt}&rdquo;</p>
        <p className="share-author-line kicker">
          {quote.author} · {quote.weekLabel}
        </p>

        <div className="share-actions-grid">
          <button
            type="button"
            className={`tag-filter-btn share-action-pill${
              copiedType === "quote" ? " is-active" : ""
            }`}
            aria-pressed={copiedType === "quote"}
            onClick={() => handleCopy(`${shareText}\n${permalink}`, "quote")}
            data-tooltip={copiedType === "quote" ? "Copied" : "Click to copy"}
          >
            {copiedType === "quote" ? "Quote copied ✓" : "Copy quote"}
          </button>

          <button
            type="button"
            className={`tag-filter-btn share-action-pill${
              copiedType === "link" ? " is-active" : ""
            }`}
            aria-pressed={copiedType === "link"}
            onClick={() => handleCopy(permalink, "link")}
            data-tooltip={copiedType === "link" ? "Copied" : "Click to copy"}
          >
            {copiedType === "link" ? "Link copied ✓" : "Copy link"}
          </button>

          {shareLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="tag-filter-btn share-action-pill"
              data-tooltip={item.tooltip}
            >
              {item.label}
            </a>
          ))}

          <Link
            href={`/quote/${quote.id}`}
            className="tag-filter-btn share-action-pill"
            onClick={onClose}
          >
            Open permalink →
          </Link>
        </div>
      </div>
    </div>
  );
}
