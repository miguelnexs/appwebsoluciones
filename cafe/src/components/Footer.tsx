import { Coffee, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Coffee className="h-6 w-6" />
              <span className="text-xl font-bold">Café Artesanal</span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Conectamos a los amantes del café con los mejores granos artesanales del mundo. 
              Cada taza cuenta una historia.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="font-semibold">Navegación</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/productos" className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  Productos
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold">Categorías</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/productos?categoria=cafe-grano" className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  Café en Grano
                </Link>
              </li>
              <li>
                <Link to="/productos?categoria=cafe-molido" className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  Café Molido
                </Link>
              </li>
              <li>
                <Link to="/productos?categoria=cafeteras" className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  Cafeteras
                </Link>
              </li>
              <li>
                <Link to="/productos?categoria=accesorios" className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  Accesorios
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contacto</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span className="text-primary-foreground/80">hola@cafeartesanal.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span className="text-primary-foreground/80">+1 234 567 8900</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span className="text-primary-foreground/80">Calle del Café 123, Ciudad</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center">
          <p className="text-primary-foreground/60 text-sm">
            © 2024 Café Artesanal. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}