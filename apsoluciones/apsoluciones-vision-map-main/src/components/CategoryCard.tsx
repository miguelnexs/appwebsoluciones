import React, { useState, useEffect } from 'react';
import { Categoria, Producto, getProductos } from '@/data/staticData';
import { Package, Calendar, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import ProductCard from './ProductCard';

interface CategoryCardProps {
  category: Categoria;
  productCount: number;
  onClick?: (category: Categoria) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, productCount, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isExpanded && products.length === 0) {
      loadProducts();
    }
  }, [isExpanded, category.id]);

  const loadProducts = () => {
    setLoading(true);
    try {
      const allProducts = getProductos();
      const categoryProducts = allProducts.results.filter(product => product.categoria === category.id);
      setProducts(categoryProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(category);
    }
  };

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
      <div 
        className="p-6 cursor-pointer"
        onClick={handleClick}
      >
        {/* Header con imagen, nombre y botón de expansión */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Imagen de la categoría */}
            {category.imagen ? (
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={`${window.location.origin}${category.imagen}`}
                  alt={category.nombre}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback al icono si la imagen no carga
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center" style={{ display: 'none' }}>
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {category.nombre}
              </h3>
              <p className="text-sm text-gray-500">
                {productCount} productos
              </p>
            </div>
          </div>
          <button
            onClick={toggleExpanded}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Descripción */}
        {category.descripcion && (
          <p className="text-gray-600 text-sm mb-4">
            {category.descripcion}
          </p>
        )}

        {/* Estado */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {category.activo ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${
              category.activo ? 'text-green-600' : 'text-red-600'
            }`}>
              {category.activo ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        </div>

        {/* Footer con fechas */}
        <div className="flex justify-between text-xs text-gray-500">
          <span className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>
              Creado: {category.fecha_creacion ? new Date(category.fecha_creacion).toLocaleDateString() : 'N/A'}
            </span>
          </span>
          {category.fecha_actualizacion && (
            <span>
              Actualizado: {new Date(category.fecha_actualizacion).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Sección expandible de productos */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-4">
            Productos en esta categoría
          </h4>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.map(product => (
                <div key={product.id} className="transform scale-90 origin-top-left">
                  <ProductCard
                    product={product}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No hay productos en esta categoría
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryCard;