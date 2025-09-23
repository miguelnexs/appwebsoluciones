import Header from "@/components/Header";
import PrivacyPolicy from "@/components/PrivacyPolicy";
import Footer from "@/components/Footer";

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32">
        <PrivacyPolicy />
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;