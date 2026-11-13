import type { MetadataRoute } from "next";
import { fetchPublishedQuotes } from "@/lib/quotes";

export const dynamic = "force-dynamic";

const SITE_URL = "https://quotes.fromthecabinet.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { quotes } = await fetchPublishedQuotes();

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/library`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  for (const q of quotes) {
    entries.push({
      url: `${SITE_URL}/quote/${q.id}`,
      lastModified: q.publish_date ? new Date(`${q.publish_date}T00:00:00Z`) : undefined,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}
