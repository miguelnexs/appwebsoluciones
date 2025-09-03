
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCategorias } from "../hooks/useCategorias";

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { categorias, loading } = useCategorias();

  const closeMenu = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="p-0">
          <Menu className="w-6 h-6 text-neutral-600" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 bg-white">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-light text-neutral-900 tracking-wide">
                cgcaroGonzalez
              </h2>
            </div>
          </div>
          
          <nav className="flex-1 p-6">
            <ul className="space-y-1">
              {loading && <li className="text-neutral-400 px-2 py-2">Cargando...</li>}
              {!loading && categorias.slice(0, 6).map(cat => (
                <li key={cat.slug}>
                  <Link
                    to={`/categoria/${cat.slug}`}
                    className="block py-3 px-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors"
                    onClick={closeMenu}
                  >
                    {cat.nombre}
                  </Link>
                </li>
              ))}

            </ul>
            
            <div className="mt-8 pt-6 border-t border-neutral-200">
              <h3 className="text-sm font-medium text-neutral-900 mb-3">Legal</h3>
              <ul className="space-y-1">
                <li>
                  <Link 
                    to="/politicas-privacidad" 
                    className="block py-2 px-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors"
                    onClick={closeMenu}
                  >
                    Políticas de Privacidad
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/terminos-condiciones" 
                    className="block py-2 px-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors"
                    onClick={closeMenu}
                  >
                    Términos y Condiciones
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HamburgerMenu;
