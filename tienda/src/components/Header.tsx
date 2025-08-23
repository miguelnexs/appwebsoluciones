import { Link } from "react-router-dom";
import { User, LogIn } from "lucide-react";
import HamburgerMenu from "./HamburgerMenu";
import CartDropdown from "./CartDropdown";
import UserProfile from "./UserProfile";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import logoImage from "../../img/logo_Mesa de trabajo 1.png";

const Header = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="bg-white border-b border-neutral-200 py-4 px-6">
      <div className="flex items-center justify-between">
        {/* Menu Hamburguesa */}
        <HamburgerMenu />
        
        {/* Logo Centrado */}
        <div className="flex-1 text-center">
          <Link to="/">
            <img 
              src={user?.tienda?.logo ? user.tienda.logo : logoImage} 
              alt={user?.tienda?.nombre || "CG by Caro Gonzalez"} 
              className="w-24 h-24 mx-auto object-contain"
            />
          </Link>
          {user?.tienda && (
            <p className="text-xs text-gray-600 mt-1 font-medium">
              {user.tienda.nombre}
            </p>
          )}
        </div>
        
        {/* Carrito y Usuario */}
        <div className="flex items-center space-x-3">
          <CartDropdown />
          
          {isAuthenticated ? (
            <UserProfile />
          ) : (
            <Link to="/login">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;