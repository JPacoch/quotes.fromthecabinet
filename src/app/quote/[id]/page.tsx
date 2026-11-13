import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SingleQuoteView from "@/components/SingleQuoteView";
import { fetchPublishedQuoteById } from "@/lib/quotes";

export const dynamic = "force-dynamic";

interface QuotePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: QuotePageProps): Promise<Metadata> {
  const { id } = await params;
  const quote = await fetchPublishedQuoteById(id);

  if (!quote) {
    return {
      title: "Quote not found",
    };
  }

  const excerpt =
    quote.content.length > 155 ? `${quote.content.slice(0, 152)}…` : quote.content;

  return {
    title: `${quote.author} — Quotes`,
    description: `"${excerpt}" — ${quote.author}`,
    alternates: {
      canonical: `/quote/${quote.id}`,
    },
    openGraph: {
      title: `${quote.author} — Quotes`,
      description: `"${excerpt}" — ${quote.author}`,
      url: `/quote/${quote.id}`,
      type: "article",
    },
  };
}

export default async function QuotePage({ params }: QuotePageProps) {
  const { id } = await params;
  const quote = await fetchPublishedQuoteById(id);

  if (!quote) {
    notFound();
  }

  return (
    <div className="site-shell">
      <Header currentPage="quote" />
      <main id="main" className="site-main">
        <SingleQuoteView quote={quote} />
      </main>
      <Footer />
    </div>
  );
}
