"use client";

import { useState, useEffect, useCallback } from "react";
import { MotionConfig } from "framer-motion";
import Header from "@/components/Header";
import QuoteDisplay, { Quote, QuoteSkeleton } from "@/components/QuoteDisplay";
import ShareModal from "@/components/ShareModal";
import PhilosophicalCursor from "@/components/PhilosophicalCursor";

function rowToQuote(row: {
  id: string;
  content: string;
  author: string;
  source: string | null;
  publish_date: string;
}): Quote {
  return {
    id: row.id,
    text: row.content,
    author: row.author,
    context: row.source ?? "",
    date: row.publish_date,
  };
}

const springConfig = {
  type: "spring" as const,
  stiffness: 140,
  damping: 22,
  mass: 1,
};

export default function Home() {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/quote/today")
      .then((r) => {
        if (!r.ok) throw new Error("No quote found for today");
        return r.json();
      })
      .then((row) => {
        setCurrentQuote(rowToQuote(row));
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  const handleNextQuote = useCallback(() => {
    if (isLoading || !currentQuote) return;

    setIsLoading(true);

    fetch(`/api/quote/random?exclude=${currentQuote.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("No other quotes available");
        return r.json();
      })
      .then((row) => {
        setCurrentQuote(rowToQuote(row));
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [isLoading, currentQuote]);

  return (
    <MotionConfig transition={springConfig}>
      <div className="site">
        <PhilosophicalCursor />
        <Header />

        {/* Initial loading skeleton */}
        {isLoading && !currentQuote && <QuoteSkeleton />}

        {/* Error state */}
        {!isLoading && (error || !currentQuote) && (
          <main style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "calc(100dvh - 65px)",
            flexDirection: "column",
            gap: "16px",
          }}>
            <p style={{
              fontFamily: '"Fraunces", serif',
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "1.1rem",
              opacity: 0.45,
              letterSpacing: "-0.01em",
            }}>
              {error ?? "No quote available."}
            </p>
            <button
              className="q-btn q-btn--ghost"
              onClick={() => window.location.reload()}
              style={{ fontSize: "0.6rem" }}
            >
              Try again
            </button>
          </main>
        )}

        {/* Main content */}
        {currentQuote && (
          <>
            <QuoteDisplay
              quote={currentQuote}
              isLoading={isLoading}
              onNext={handleNextQuote}
              onShare={() => setShareOpen(true)}
            />
            <ShareModal
              isOpen={shareOpen}
              onClose={() => setShareOpen(false)}
              quote={currentQuote}
            />
          </>
        )}
      </div>
    </MotionConfig>
  );
}
