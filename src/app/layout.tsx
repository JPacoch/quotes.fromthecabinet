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
      <body>{children}</body>
    </html>
  );
}
