import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductos, Producto } from '@/data/staticData';
import { Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface ProductosListSubcategoriaProps {
  subcategoriaId: number;
}

const ProductosListSubcategoria: React.FC<ProductosListSubcategoriaProps> = ({ subcategoriaId }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProductos = () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener productos usando datos estáticos
        const response = getProductos();
        let productosData = response.results || [];
        
        // Filtrar por subcategoría
        productosData = productosData.filter((producto: Producto) => 
          producto.subcategoria === subcategoriaId
        );
        
        setProductos(productosData);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        setError('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };

    loadProductos();
  }, [subcategoriaId]);

  const getImageUrl = (producto: Producto) => {
    if (!producto.imagen_principal) {
      // Usar imagen placeholder solo si no hay imagen
      return 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=' + encodeURIComponent(producto.nombre.substring(0, 20));
    }
    
    // Si la URL ya es completa (http/https), devolverla tal como está
    if (producto.imagen_principal.startsWith('http')) {
      return producto.imagen_principal;
    }
    
    // Para rutas locales, construir la URL completa con el puerto correcto
    const baseUrl = window.location.origin; // Esto usará automáticamente el puerto correcto
    return `${baseUrl}${producto.imagen_principal}`;
  };

  const formatPrice = (price: string | number) => {
    // Los precios vienen como string, convertir a número
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(numericPrice);
  };

  const handleProductClick = (producto: Producto) => {
    navigate(`/producto/${producto.slug}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Error al cargar productos</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay productos disponibles</h3>
        <p className="text-gray-600">Esta subcategoría no tiene productos asignados.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {productos.map((producto) => (
        <div
          key={producto.id}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => handleProductClick(producto)}
        >
          {/* Imagen del producto */}
          <div className="relative h-48 overflow-hidden bg-gray-50">
            <img
              src={getImageUrl(producto)}
              alt={producto.nombre}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                // Solo usar placeholder si la imagen original falla
                if (!target.src.includes('placeholder')) {
                  target.src = 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=Sin+Imagen';
                }
              }}
            />
            {producto.stock !== undefined && (
              <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
                (producto.stock || 0) > 0 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {(producto.stock || 0) > 0 ? `${producto.stock} en stock` : 'Agotado'}
              </div>
            )}
            
            {/* Overlay con botones al hacer hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProductClick(producto);
                  }}
                  className="bg-white text-gray-800 p-2 rounded hover:bg-gray-100 transition-colors shadow"
                  title="Ver detalles"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Contenido del producto */}
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
              {producto.nombre}
            </h3>
            
            {producto.descripcion && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {producto.descripcion}
              </p>
            )}

            <div className="flex items-center justify-between mb-3">
              <div className="text-xl font-semibold text-gray-900">
                {formatPrice(producto.precio)}
              </div>
            </div>

            {producto.subcategoria_nombre && (
              <div className="pt-3 border-t border-gray-100">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  {producto.subcategoria_nombre}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductosListSubcategoria;