import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuotesArchive from "@/components/QuotesArchive";
import JsonLd from "@/components/JsonLd";
import { fetchPublishedQuotes } from "@/lib/quotes";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const LIBRARY_TITLE = "Quotes Library";
const LIBRARY_DESCRIPTION =
  "Browse and filter the complete commonplace archive of philosophical passages, aphorisms and sources from From the Cabinet.";

export const metadata: Metadata = {
  title: LIBRARY_TITLE,
  description: LIBRARY_DESCRIPTION,
  alternates: {
    canonical: absoluteUrl("/library"),
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/library"),
    title: `${LIBRARY_TITLE} - From the Cabinet`,
    description: LIBRARY_DESCRIPTION,
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: `${LIBRARY_TITLE} - From the Cabinet`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${LIBRARY_TITLE} - From the Cabinet`,
    description: LIBRARY_DESCRIPTION,
    images: [absoluteUrl("/opengraph-image")],
  },
};

export default async function LibraryPage() {
  const { quotes, todayQuoteId, error } = await fetchPublishedQuotes();

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${absoluteUrl("/library")}#webpage`,
        name: `${LIBRARY_TITLE} - From the Cabinet`,
        description: LIBRARY_DESCRIPTION,
        url: absoluteUrl("/library"),
        inLanguage: "en",
        isPartOf: {
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL,
        },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: quotes.length,
          itemListElement: quotes.slice(0, 50).map((q, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            url: absoluteUrl(`/quote/${q.id}`),
            name: `${q.author}${q.sourceLabel ? ` - ${q.sourceLabel}` : ""}`,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Quotes",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Library",
            item: absoluteUrl("/library"),
          },
        ],
      },
    ],
  };

  return (
    <div className="site-shell">
      <JsonLd data={structuredData} />
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
