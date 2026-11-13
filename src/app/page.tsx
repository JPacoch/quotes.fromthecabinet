import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SingularQuoteStage from "@/components/SingularQuoteStage";
import { fetchTodayQuote } from "@/lib/quotes";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { quote, totalCount, error } = await fetchTodayQuote();

  return (
    <div className="site-shell">
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
