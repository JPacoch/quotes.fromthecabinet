"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import QuoteDisplay, { Quote } from "@/components/QuoteDisplay";
import ShareModal from "@/components/ShareModal";
import PhilosophicalCursor from "@/components/PhilosophicalCursor";

/** Map Supabase row shape → Quote interface used by the UI */
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

export default function Home() {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
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

    setIsFlashing(true);
    setTimeout(() => {
      setIsFlashing(false);
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
    }, 150);
  }, [isLoading, currentQuote]);

  if (isLoading && !currentQuote) {
    return (
      <div className="site">
        <PhilosophicalCursor />
        <Header />
        <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <div className="loading-inner">
            <div className="loading-spinner" />
            <span className="loading-label">Loading</span>
          </div>
        </main>
      </div>
    );
  }

  if (error || !currentQuote) {
    return (
      <div className="site">
        <PhilosophicalCursor />
        <Header />
        <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <p style={{ opacity: 0.5, fontSize: "0.85rem", letterSpacing: "0.08em" }}>
            {error ?? "No quote available."}
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="site">
      <PhilosophicalCursor />
      <Header />

      <QuoteDisplay
        quote={currentQuote}
        isFlashing={isFlashing}
        isLoading={isLoading}
        onNext={handleNextQuote}
        onShare={() => setShareOpen(true)}
      />

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        quote={currentQuote}
      />
    </div>
  );
}
