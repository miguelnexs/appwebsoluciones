import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Globe, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const services = [
    "Sistemas DPS",
    "Puesta a Tierra (SPT)",
    "Apantallamientos",
    "Extinción de Incendios",
    "Estudios de Calidad",
    "Sistemas SG-SST"
  ];

  const products = [
    "Catálogo MCG",
    "Catálogo Telebahn",
    "Catálogo GL",
    "Equipos de Protección",
    "Dispositivos Especiales"
  ];

  const certifications = [
    "RETIE",
    "UL Listed",
    "KEMA",
    "ISO 45001",
    "Certificaciones Cliente"
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Información de la Empresa */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">AP Soluciones</h3>
              <p className="text-xl font-medium text-primary-foreground/80">Integradas</p>
            </div>
            <p className="text-primary-foreground/80 leading-relaxed">
              Especialistas en protección eléctrica y seguridad industrial con más de 15 años 
              de experiencia en el mercado colombiano.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5" />
                <span>+57 (1) 234-5678</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5" />
                <span>info@apsoluciones.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5" />
                <span>Bogotá D.C., Colombia</span>
              </div>
            </div>
          </div>

          {/* Servicios */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Servicios</h4>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index}>
                  <Link 
                    to="/servicios" 
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Productos */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Productos</h4>
            <ul className="space-y-2">
              {products.map((product, index) => (
                <li key={index}>
                  <Link 
                    to="/productos" 
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200"
                  >
                    {product}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Certificaciones y Contacto */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Certificaciones</h4>
            <ul className="space-y-2 mb-6">
              {certifications.map((cert, index) => (
                <li key={index}>
                  <Link 
                    to="/certificaciones" 
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200"
                  >
                    {cert}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="space-y-4">
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link to="/contacto">Solicitar Cotización</Link>
              </Button>
              
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="p-2">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <Linkedin className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <Instagram className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-primary-foreground/20" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-primary-foreground/80">
            <p>© {currentYear} AP Soluciones Integradas. Todos los derechos reservados.</p>
            <div className="flex space-x-4">
              <Link 
                to="/politicas-privacidad" 
                className="hover:text-primary-foreground transition-colors"
              >
                Política de Privacidad
              </Link>
              <Link 
                to="/terminos-servicios" 
                className="hover:text-primary-foreground transition-colors"
              >
                Términos de Servicio
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-primary-foreground/80">
            <Globe className="h-4 w-4" />
            <span>www.apsoluciones.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;