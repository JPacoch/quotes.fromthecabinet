export const SITE_URL = "https://quotes.fromthecabinet.com";
export const PARENT_SITE_URL = "https://fromthecabinet.com";
export const SITE_NAME = "Quotes - From the Cabinet";
export const SITE_SHORT_NAME = "Quotes";
export const SITE_DESCRIPTION =
  "A curated commonplace of philosophical passages, aphorisms and marginalia from From the Cabinet.";
export const AUTHOR_NAME = "Jakub Pacocha";

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
