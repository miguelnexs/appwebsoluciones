import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// Layout
import MainLayout from '../components/layout/MainLayout';

// Auth Components
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';

// Pages
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import ProductsPage from '../pages/ProductsPage';
import OrdersPage from '../pages/OrdersPage';
import CustomerPage from '../pages/CustomerPage';
import CategoriesPage from '../pages/CategoriesPage';
import ProductPage from '../pages/ProductPage';
import ProductFormPage from '../pages/ProductFormPage';
import VentasPage from '../pages/VentasPage';
import HelpPage from '../pages/HelpPage';

// Components
import ThemeDemo from '../components/ui/ThemeDemo';
import ScrollbarDemo from '../components/ui/ScrollbarDemo';
import TypographyDemo from '../components/ui/TypographyDemo';

const AppRouter = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Ruta de login (pública) */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rutas protegidas con layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="product/new" element={<ProductFormPage />} />
            <Route path="product/edit/:slug" element={<ProductFormPage />} />
            <Route path="productos/producto/caracteristicas" element={<ProductFormPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categoria/:slug" element={<CategoriesPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="customers" element={<CustomerPage />} />
            <Route path="quick-sales" element={<VentasPage />} />
            <Route path="theme-demo" element={<ThemeDemo />} />
            <Route path="scrollbar-demo" element={<ScrollbarDemo />} />
            <Route path="typography-demo" element={<TypographyDemo />} />
          </Route>

          {/* Página de producto individual (puede ir fuera si es un detalle público) */}
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/help" element={<HelpPage />} />

          {/* Redirigir rutas no encontradas al login */}
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default AppRouter;