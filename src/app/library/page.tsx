import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuotesArchive from "@/components/QuotesArchive";
import { fetchPublishedQuotes } from "@/lib/quotes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Library — Quotes",
  description:
    "Browse and search the complete archive of collected passages, aphorisms, and marginalia.",
  alternates: {
    canonical: "/library",
  },
};

export default async function LibraryPage() {
  const { quotes, todayQuoteId, error } = await fetchPublishedQuotes();

  return (
    <div className="site-shell">
      <Header currentPage="library" />
      <main id="main" className="site-main">
        <QuotesArchive
          initialQuotes={quotes}
          todayQuoteId={todayQuoteId}
          initialError={error}
        />
      </main>
      <Footer />
    </div>
  );
}
