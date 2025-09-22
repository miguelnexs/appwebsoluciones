import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import CookiesNotice from "@/components/CookiesNotice";
import Index from "./pages/Index";
import ProductsPage from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import ServicesPage from "./pages/Services";
import NewsPage from "./pages/News";
import ClientsPage from "./pages/Clients";
import CertificationsPage from "./pages/Certifications";
import ContactPage from "./pages/Contact";
import TermsOfServicePage from "./pages/TermsOfService";
import PrivacyPolicyPage from "./pages/PrivacyPolicy";
import Login from "./pages/Login";
import Dashboard from "./components/Dashboard";
import ProductosAdmin from "./pages/admin/ProductosAdmin";
import CategoriasAdmin from "./pages/admin/CategoriasAdmin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/productos" element={<ProductsPage />} />
              <Route path="/producto/:slug" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/servicios" element={<ServicesPage />} />
              <Route path="/noticias" element={<NewsPage />} />
              <Route path="/clientes" element={<ClientsPage />} />
              <Route path="/certificaciones" element={<CertificationsPage />} />
              <Route path="/contacto" element={<ContactPage />} />
              <Route path="/terminos-servicios" element={<TermsOfServicePage />} />
              <Route path="/politicas-privacidad" element={<PrivacyPolicyPage />} />
              <Route path="/login" element={<Login />} />
              
              {/* Admin Routes - Protected */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/productos" element={
                <ProtectedRoute>
                  <ProductosAdmin />
                </ProtectedRoute>
              } />
              <Route path="/admin/categorias" element={
                <ProtectedRoute>
                  <CategoriasAdmin />
                </ProtectedRoute>
              } />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <CookiesNotice />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
