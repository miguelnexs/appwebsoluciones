import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProductGrid from './ProductGrid';
import CategoryGrid from './CategoryGrid';
import { Categoria } from '@/services/api';
import { 
  Package, 
  Folder, 
  BarChart3, 
  Settings, 
  LogOut, 
  User,
  Home,
  Search
} from 'lucide-react';

type ViewType = 'overview' | 'products' | 'categories';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(null);

  const handleLogout = () => {
    logout();
  };

  const handleCategoryClick = (category: Categoria) => {
    setSelectedCategory(category);
    setCurrentView('products');
  };

  const clearCategoryFilter = () => {
    setSelectedCategory(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'products':
        return (
          <ProductGrid 
            categoryFilter={selectedCategory}
            onClearCategoryFilter={clearCategoryFilter}
          />
        );
      case 'categories':
        return <CategoryGrid onCategoryClick={handleCategoryClick} />;
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            {/* Bienvenida */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg text-white p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    ¡Bienvenido de vuelta!
                  </h1>
                  <p className="text-purple-100">
                    Gestiona tu inventario de manera eficiente
                  </p>
                </div>
                <div className="hidden md:block">
                  <Package className="h-16 w-16 text-purple-200" />
                </div>
              </div>
            </div>

            {/* Accesos rápidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button
                onClick={() => setCurrentView('products')}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-500">Ver todos</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Productos
                </h3>
                <p className="text-gray-600 text-sm">
                  Gestiona tu inventario de productos
                </p>
              </button>

              <button
                onClick={() => setCurrentView('categories')}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <Folder className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-500">Organizar</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Categorías
                </h3>
                <p className="text-gray-600 text-sm">
                  Organiza tus productos por categorías
                </p>
              </button>

              <button
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left group"
                disabled
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-400">Próximamente</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Reportes
                </h3>
                <p className="text-gray-600 text-sm">
                  Analiza el rendimiento de tu inventario
                </p>
              </button>
            </div>

            {/* Vista previa de categorías */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Categorías Populares
                </h2>
                <button
                  onClick={() => setCurrentView('categories')}
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  Ver todas →
                </button>
              </div>
              <CategoryGrid onCategoryClick={handleCategoryClick} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo y navegación */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-purple-600" />
                <span className="text-xl font-bold text-gray-900">
                  Inventario
                </span>
              </div>

              {/* Navegación */}
              <nav className="hidden md:flex space-x-6">
                <button
                  onClick={() => setCurrentView('overview')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'overview'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Inicio</span>
                </button>
                <button
                  onClick={() => setCurrentView('products')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'products'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Package className="h-4 w-4" />
                  <span>Productos</span>
                </button>
                <button
                  onClick={() => setCurrentView('categories')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'categories'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Folder className="h-4 w-4" />
                  <span>Categorías</span>
                </button>
              </nav>
            </div>

            {/* Usuario y acciones */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {user?.username || 'Usuario'}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        {(currentView !== 'overview' || selectedCategory) && (
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <button
                onClick={() => {
                  setCurrentView('overview');
                  setSelectedCategory(null);
                }}
                className="hover:text-purple-600"
              >
                Inicio
              </button>
              {currentView !== 'overview' && (
                <>
                  <span>/</span>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="hover:text-purple-600"
                  >
                    {currentView === 'products' ? 'Productos' : 'Categorías'}
                  </button>
                </>
              )}
              {selectedCategory && (
                <>
                  <span>/</span>
                  <span className="text-gray-900 font-medium">
                    {selectedCategory.nombre}
                  </span>
                </>
              )}
            </nav>
          </div>
        )}

        {/* Contenido */}
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;