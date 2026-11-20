import type { MetadataRoute } from "next";
import { fetchPublishedQuotes } from "@/lib/quotes";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { quotes } = await fetchPublishedQuotes();
  const latestDate = quotes[0]?.publish_date
    ? new Date(`${quotes[0].publish_date}T00:00:00Z`)
    : undefined;

  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: latestDate,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/library"),
      lastModified: latestDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  for (const q of quotes) {
    entries.push({
      url: absoluteUrl(`/quote/${q.id}`),
      lastModified: q.publish_date
        ? new Date(`${q.publish_date}T00:00:00Z`)
        : undefined,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}
