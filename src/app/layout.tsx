import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quotes from the Cabinet",
  description: "A curated collection of timeless quotes, one per day.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Aleo:ital,wght@0,100..900;1,100..900&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Funnel+Display:wght@300..800&family=Instrument+Serif:ital@0;1&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Playfair:ital,opsz,wght@0,5..1200,300..900;1,5..1200,300..900&family=Prata&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
