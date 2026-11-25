import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SingleQuoteView from "@/components/SingleQuoteView";
import JsonLd from "@/components/JsonLd";
import { fetchPublishedQuoteById } from "@/lib/quotes";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

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
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const excerpt =
    quote.content.length > 155 ? `${quote.content.slice(0, 152)}…` : quote.content;
  const canonicalUrl = absoluteUrl(`/quote/${quote.id}`);
  const ogImageUrl = absoluteUrl(
    `/og?id=${encodeURIComponent(quote.id)}&v=${encodeURIComponent(quote.publish_date)}`
  );
  const pageTitle = quote.sourceLabel
    ? `${quote.author} (${quote.sourceLabel})`
    : `Quote by ${quote.author}`;
  const description = quote.sourceLabel
    ? `"${excerpt}" - ${quote.author}, ${quote.sourceLabel}`
    : `"${excerpt}" - ${quote.author}`;

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: `${pageTitle} - From the Cabinet`,
      description,
      publishedTime: quote.publish_date
        ? `${quote.publish_date}T00:00:00Z`
        : undefined,
      authors: [quote.author],
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Quote by ${quote.author}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${pageTitle} - From the Cabinet`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function QuotePage({ params }: QuotePageProps) {
  const { id } = await params;
  const quote = await fetchPublishedQuoteById(id);

  if (!quote) {
    notFound();
  }

  const canonicalUrl = absoluteUrl(`/quote/${quote.id}`);
  const quotationNode: Record<string, unknown> = {
    "@type": "Quotation",
    "@id": `${canonicalUrl}#quotation`,
    text: quote.content,
    url: canonicalUrl,
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

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: `Quote by ${quote.author} - From the Cabinet`,
        inLanguage: "en",
        isPartOf: {
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL,
        },
        mainEntity: {
          "@id": `${canonicalUrl}#quotation`,
        },
      },
      quotationNode,
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
          {
            "@type": "ListItem",
            position: 3,
            name: quote.author,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="site-shell">
      <JsonLd data={structuredData} />
      <Header currentPage="quote" />
      <main id="main" className="site-main">
        <SingleQuoteView quote={quote} />
      </main>
      <Footer />
    </div>
  );
}
