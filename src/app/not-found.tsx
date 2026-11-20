import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The requested passage could not be found.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="site-shell">
      <Header currentPage="quote" />
      <main id="main" className="site-main site-main--stage">
        <div className="wrap singular-wrap">
          <div className="col-prose">
            <span className="kicker">404 / Not found</span>
            <h1 className="page-title">Passage not found</h1>
            <p className="page-lede">
              This quote may have moved or does not exist in the archive.
            </p>
            <div className="singular-controls">
              <div className="singular-primary-actions">
                <Link href="/" className="stage-btn stage-btn--primary">
                  <span>Today&apos;s quote</span>
                  <span aria-hidden="true">→</span>
                </Link>
                <Link href="/library" className="stage-btn stage-btn--ghost">
                  <span>Browse library</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
