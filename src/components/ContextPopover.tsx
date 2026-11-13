"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { QuoteItem } from "@/lib/quotes";

interface ContextPopoverProps {
  quote: QuoteItem;
  anchorRect: DOMRect;
  onClose: () => void;
}

export default function ContextPopover({ quote, anchorRect, onClose }: ContextPopoverProps) {
  const [closing, setClosing] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

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

    const onPointerDown = (e: PointerEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        requestClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const width = Math.min(344, (typeof window !== "undefined" ? window.innerWidth : 400) - 32);
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 768;

  const left = Math.min(
    Math.max(16, anchorRect.right - width),
    viewportWidth - width - 16
  );
  const placeAbove = anchorRect.bottom + 180 > viewportHeight && anchorRect.top > 180;
  const top = placeAbove
    ? Math.max(16, anchorRect.top - 150)
    : Math.min(viewportHeight - 160, anchorRect.bottom + 8);

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={`Source note for ${quote.author}`}
      className={`context-popover${closing ? " is-closing" : ""}`}
      style={{ top: `${top}px`, left: `${left}px` }}
    >
      <div className="context-popover-head">
        <span className="context-popover-label-wrap">
          <span className="context-popover-dot" aria-hidden="true" />
          <span className="context-popover-title">Source</span>
        </span>

        <button
          type="button"
          className="context-popover-close"
          onClick={requestClose}
          aria-label="Close source note"
        >
          ×
        </button>
      </div>

      <p className="context-popover-body">
        {quote.source ? quote.source : `Collected from ${quote.author}.`}
      </p>

      <div className="context-popover-meta">
        <span className="kicker">{quote.weekLabel}</span>
        <Link href={`/quote/${quote.id}`} className="kicker quote-action-link" onClick={onClose}>
          Permalink ↗
        </Link>
      </div>
    </div>
  );
}
