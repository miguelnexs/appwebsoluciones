import Header from "@/components/Header";
import Certifications from "@/components/Certifications";
import Footer from "@/components/Footer";

const CertificationsPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32">
        <Certifications />
      </main>
      <Footer />
    </div>
  );
};

export default CertificationsPage;