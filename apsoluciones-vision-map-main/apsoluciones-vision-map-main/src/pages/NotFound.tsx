import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center pt-32 pb-16">
        <div className="text-center max-w-lg mx-auto px-4">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Página No Encontrada</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
          <div className="space-y-4">
            <Button size="lg" variant="gradient" asChild>
              <Link to="/">Volver al Inicio</Link>
            </Button>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/productos">Productos</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/servicios">Servicios</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/contacto">Contacto</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
