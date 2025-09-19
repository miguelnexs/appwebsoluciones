import Header from "@/components/Header";
import Clients from "@/components/Clients";
import Footer from "@/components/Footer";

const ClientsPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32">
        <Clients />
      </main>
      <Footer />
    </div>
  );
};

export default ClientsPage;