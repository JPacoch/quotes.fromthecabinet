import type { Metadata } from "next";
import LinkTooltip from "@/components/LinkTooltip";
import "./globals.css";

const SITE_URL = "https://quotes.fromthecabinet.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Quotes — From the Cabinet",
    template: "%s — From the Cabinet",
  },
  description:
    "Collected passages, aphorisms, and marginalia worth keeping close.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Quotes — From the Cabinet",
    description:
      "Collected passages, aphorisms, and marginalia worth keeping close.",
    url: SITE_URL,
    siteName: "From the Cabinet",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const themeInitScript = `
(function () {
  var doc = document.documentElement;
  doc.classList.add('js');
  try {
    var stored = localStorage.getItem('cabinet-theme');
    var theme = stored === 'dark' || stored === 'light'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    doc.setAttribute('data-theme', theme);
  } catch (e) {
    var fallback = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    doc.setAttribute('data-theme', fallback);
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
        <LinkTooltip />
      </body>
    </html>
  );
}
