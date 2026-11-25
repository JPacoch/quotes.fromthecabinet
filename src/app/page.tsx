import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SingularQuoteStage from "@/components/SingularQuoteStage";
import JsonLd from "@/components/JsonLd";
import { fetchTodayQuote } from "@/lib/quotes";
import {
  AUTHOR_NAME,
  PARENT_SITE_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { quote } = await fetchTodayQuote();

  const ogImageUrl = quote
    ? absoluteUrl(
        `/og?id=${encodeURIComponent(quote.id)}&v=${encodeURIComponent(quote.publish_date)}`
      )
    : absoluteUrl("/og");

  const excerpt =
    quote && quote.content.length > 140
      ? `${quote.content.slice(0, 137)}…`
      : quote?.content;

  const description = quote
    ? `"${excerpt}" - ${quote.author}${quote.sourceLabel ? `, ${quote.sourceLabel}` : ""}`
    : SITE_DESCRIPTION;

  const imageAlt = quote
    ? `Weekly quote by ${quote.author} — ${SITE_NAME}`
    : SITE_NAME;

  return {
    title: {
      absolute: SITE_NAME,
    },
    description,
    alternates: {
      canonical: SITE_URL,
    },
    openGraph: {
      type: "website",
      url: SITE_URL,
      title: SITE_NAME,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function HomePage() {
  const { quote, totalCount, error } = await fetchTodayQuote();

  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      publisher: {
        "@type": "Person",
        name: AUTHOR_NAME,
        url: PARENT_SITE_URL,
      },
      isPartOf: {
        "@type": "WebSite",
        name: "From the Cabinet",
        url: PARENT_SITE_URL,
      },
    },
  ];

  if (quote) {
    const quotationNode: Record<string, unknown> = {
      "@type": "Quotation",
      "@id": `${absoluteUrl(`/quote/${quote.id}`)}#quotation`,
      text: quote.content,
      url: absoluteUrl(`/quote/${quote.id}`),
      datePublished: quote.publish_date,
      inLanguage: "en",
      author: {
        "@type": "Person",
        name: quote.author,
      },
    };

    if (quote.sourceLabel) {
      quotationNode.isPartOf = {
        "@type": "CreativeWork",
        name: quote.sourceLabel,
        ...(quote.sourceUrl ? { url: quote.sourceUrl } : {}),
      };
    }

    graph.push(quotationNode);
  }

  return (
    <div className="site-shell">
      <JsonLd data={{ "@context": "https://schema.org", "@graph": graph }} />
      <Header currentPage="home" />
      <main id="main" className="site-main site-main--stage">
        <SingularQuoteStage
          initialQuote={quote}
          totalCount={totalCount}
          initialError={error}
        />
      </main>
      <Footer />
    </div>
  );
}
