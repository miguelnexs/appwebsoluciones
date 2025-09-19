import Header from "@/components/Header";
import News from "@/components/News";
import Footer from "@/components/Footer";

const NewsPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32">
        <News />
      </main>
      <Footer />
    </div>
  );
};

export default NewsPage;