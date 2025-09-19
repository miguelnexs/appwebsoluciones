import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Eye } from 'lucide-react';

interface Producto {
  id: number;
  sku: string;
  nombre: string;
  slug: string;
  imagen_principal?: string;
  imagen_principal_url?: string; // URL completa de la imagen desde la API
  descripcion_corta: string;
  descripcion_larga: string;
  tipo: string;
  estado: string;
  categoria?: {
    id: number;
    nombre: string;
    slug: string;
  };
  precio: number; // En centavos
  precio_comparacion?: number;
  stock: number;
  vendidos: number;
  disponible_para_venta: boolean;
  activo: boolean;
  destacado: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

interface ProductosListProps {
  categoriaId?: string;
}

const ProductosList: React.FC<ProductosListProps> = ({ categoriaId }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();

  useEffect(() => {
    const loadProductos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener productos usando el servicio API
        const response = await apiService.getProductos();
        let productosData = response.results || [];
        
        // Filtrar por categoría si se especifica
        if (categoriaId) {
          productosData = productosData.filter((producto: Producto) => 
            producto.categoria?.id?.toString() === categoriaId
          );
        }
        
        setProductos(productosData);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        setError('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };

    loadProductos();
  }, [categoriaId]);

  const getImageUrl = (producto: Producto) => {
    // Priorizar imagen_principal_url que viene de la API
    if (producto.imagen_principal_url) {
      return producto.imagen_principal_url;
    }
    
    if (producto.imagen_principal) {
      // Si la imagen ya es una URL completa, la usamos tal como está
      if (producto.imagen_principal.startsWith('http')) {
        return producto.imagen_principal;
      }
      // Si es una ruta relativa, la construimos con el backend
      return `http://localhost:8001${producto.imagen_principal}`;
    }
    // Imagen por defecto si no hay imagen
    return 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=Sin+Imagen';
  };

  const formatPrice = (price: string | number) => {
    // Los precios vienen en centavos desde la API, convertir a euros
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    const priceInEuros = numericPrice / 100; // Convertir centavos a euros
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(priceInEuros);
  };

  const handleProductClick = (producto: Producto) => {
    navigate(`/producto/${producto.slug}`);
  };

  const handleAddToCart = (e: React.MouseEvent, producto: Producto) => {
    e.stopPropagation(); // Evitar que se active el clic del producto
    
    if (producto.stock <= 0) return;
    
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen_principal_url: getImageUrl(producto),
      stock: producto.stock
    });
    
    openCart();
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
        <p className="text-gray-600">
          {categoriaId ? 'Esta categoría no tiene productos asignados.' : 'No se encontraron productos.'}
        </p>
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
                target.src = 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=Sin+Imagen';
              }}
            />
            {producto.stock !== undefined && (
              <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
                producto.stock > 0 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {producto.stock > 0 ? `${producto.stock} en stock` : 'Agotado'}
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
                <button
                  onClick={(e) => handleAddToCart(e, producto)}
                  disabled={producto.stock <= 0}
                  className={`p-2 rounded transition-colors shadow ${
                    producto.stock > 0
                      ? 'bg-gray-800 text-white hover:bg-gray-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={producto.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Contenido del producto */}
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
              {producto.nombre}
            </h3>
            
            {producto.descripcion_corta && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {producto.descripcion_corta}
              </p>
            )}

            <div className="flex items-center justify-between mb-3">
              <div className="text-xl font-semibold text-gray-900">
                {formatPrice(producto.precio)}
              </div>
              
              <button 
                onClick={(e) => handleAddToCart(e, producto)}
                disabled={producto.stock <= 0}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  producto.stock > 0
                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {producto.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
              </button>
            </div>

            {producto.categoria && (
              <div className="pt-3 border-t border-gray-100">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                  {producto.categoria.nombre}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductosList;