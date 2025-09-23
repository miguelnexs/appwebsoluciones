import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategorias, getProductos, Categoria, Producto } from '@/data/staticData';
import CategoryCard from './CategoryCard';
import { Search, Folder, AlertCircle } from 'lucide-react';

interface CategoryGridProps {
  onCategoryClick?: (category: Categoria) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategoryClick }) => {
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [products, setProducts] = useState<Producto[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar categorías y productos
  useEffect(() => {
    const loadData = () => {
      try {
        setLoading(true);
        setError(null);
        
        const categoriasResponse = getCategorias();
        const productosResponse = getProductos();

        setCategories(categoriasResponse);
        setProducts(productosResponse.results || []);
      } catch (err) {
        setError('Error al cargar los datos');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtrar categorías por término de búsqueda
  useEffect(() => {
    let filtered = [...categories];

    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar por nombre
    filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));

    setFilteredCategories(filtered);
  }, [categories, searchTerm]);

  // Función para contar productos por categoría
  const getProductCountForCategory = (categoryId: number): number => {
    return products.filter(product => product.categoria === categoryId).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-purple-600 hover:text-purple-800 underline"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Título y contador */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Categorías</h2>
            <p className="text-gray-600">
              {filteredCategories.length} {filteredCategories.length === 1 ? 'categoría encontrada' : 'categorías encontradas'}
            </p>
          </div>

          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full lg:w-80"
            />
          </div>
        </div>
      </div>

      {/* Grid de categorías */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron categorías
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Intenta ajustar el término de búsqueda'
              : 'No hay categorías disponibles en este momento'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map(category => (
            <CategoryCard
              key={category.id}
              category={category}
              productCount={getProductCountForCategory(category.id)}
              onClick={onCategoryClick}
            />
          ))}
        </div>
      )}

      {/* Estadísticas rápidas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {categories.length}
            </div>
            <div className="text-sm text-purple-700">
              Total de categorías
            </div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {categories.filter(cat => cat.activo).length}
            </div>
            <div className="text-sm text-green-700">
              Categorías activas
            </div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {products.length}
            </div>
            <div className="text-sm text-blue-700">
              Total de productos
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryGrid;