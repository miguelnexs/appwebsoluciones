import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import BolsosGrandes from "./pages/BolsosGrandes";
import BolsosPequenos from "./pages/BolsosPequenos";
import Canguros from "./pages/Canguros";
import Billeteras from "./pages/Billeteras";
import Complementos from "./pages/Complementos";
import Carpetas from "./pages/Carpetas";
import PasaporteGuarda from "./pages/PasaporteGuarda";
import Cosmeteria from "./pages/Cosmeteria";
import Ventas from "./pages/Ventas";
import PoliticasPrivacidad from "./pages/PoliticasPrivacidad";
import TerminosCondiciones from "./pages/TerminosCondiciones";
import ProductoDetalle from "./pages/ProductoDetalle";
import TodosProductos from "./pages/TodosProductos";
import NotFound from "./pages/NotFound";
import CategoriaPage from "./pages/CategoriaPage";
import TodasCategorias from "./pages/TodasCategorias";
import Header from "./components/Header";
import CookiesNotice from "./components/ui/CookiesNotice";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import DivDemo from "./pages/DivDemo";
import DivCharacteristicsDemo from "./pages/DivCharacteristicsDemo";
import DashboardDivAnalysisDemo from "./pages/DashboardDivAnalysisDemo";
import ProductCharacteristicsDemo from "./pages/ProductCharacteristicsDemo";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CookiesNotice />
        <BrowserRouter>
          <AuthProvider>
              <Header />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/bolsos-grandes" element={<BolsosGrandes />} />
                <Route path="/bolsos-pequenos" element={<BolsosPequenos />} />
                <Route path="/canguros" element={<Canguros />} />
                <Route path="/billeteras" element={<Billeteras />} />
                <Route path="/complementos" element={<Complementos />} />
                <Route path="/carpetas" element={<Carpetas />} />
                <Route path="/pasaporte-guarda" element={<PasaporteGuarda />} />
                <Route path="/cosmeteria" element={<Cosmeteria />} />
                <Route path="/ventas" element={<Ventas />} />
                <Route path="/todos-productos" element={<TodosProductos />} />
                <Route path="/todas-categorias" element={<TodasCategorias />} />
                <Route path="/politicas-privacidad" element={<PoliticasPrivacidad />} />
                <Route path="/terminos-condiciones" element={<TerminosCondiciones />} />
                <Route path="/producto/:slug" element={<ProductoDetalle />} />
                <Route path="/categoria/:slug" element={<CategoriaPage />} />
                <Route path="/div-demo" element={<DivDemo />} />
                <Route path="/dashboard-analysis" element={<DashboardDivAnalysisDemo />} />
                <Route path="/product-characteristics" element={<ProductCharacteristicsDemo />} />
                <Route 
                  path="/login" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <Login />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute requireAuth={true}>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
