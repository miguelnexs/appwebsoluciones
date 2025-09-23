import Header from "@/components/Header";
import TermsOfService from "@/components/TermsOfService";
import Footer from "@/components/Footer";

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32">
        <TermsOfService />
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfServicePage;