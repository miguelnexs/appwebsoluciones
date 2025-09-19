import React, { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiService } from '../services/api';
import { Categoria } from '../services/api';
import ProductosList from '../components/ProductosList';

const Products: React.FC = () => {
  const [categoriasActivas, setCategoriasActivas] = useState<Categoria[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        setLoading(true);
        const categorias = await apiService.getCategorias();
        setCategoriasActivas(categorias);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategorias();
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const getImageUrl = (categoria: Categoria) => {
    if (categoria.imagen) {
      // Si la imagen ya es una URL completa, la usamos tal como está
      if (categoria.imagen.startsWith('http')) {
        return categoria.imagen;
      }
      // Si es una ruta relativa, la construimos con el backend
      return `http://localhost:8001${categoria.imagen}`;
    }
    // Imagen por defecto si no hay imagen
    return 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=Sin+Imagen';
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando categorías...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="min-h-screen bg-gray-50 pt-24">
        {/* Contenido principal */}
        <div className="container mx-auto px-4 py-12">
          {selectedCategory ? (
            // Vista de productos de categoría seleccionada
            <div>
              <div className="mb-8">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium shadow-sm mb-6"
                >
                  Volver
                </button>
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {categoriasActivas.find(cat => cat.id.toString() === selectedCategory)?.nombre}
                  </h2>
                  <p className="text-gray-600">
                    Productos disponibles en esta categoría
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <ProductosList categoriaId={selectedCategory} />
              </div>
            </div>
          ) : (
            // Vista de catálogo de categorías
            <div>
              <div className="text-center mb-12">
                 <h2 className="text-3xl font-bold text-gray-900 mb-4">
                   Nuestro Catálogo
                 </h2>
                 <p className="text-gray-600 max-w-2xl mx-auto">
                   Selecciona una categoría para explorar nuestros productos especializados
                 </p>
               </div>

              {categoriasActivas.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay productos disponibles</h3>
                   <p className="text-gray-600">Los productos se mostrarán aquí cuando estén disponibles.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categoriasActivas.map((categoria) => (
                    <div
                      key={categoria.id}
                      onClick={() => handleCategorySelect(categoria.id.toString())}
                      className="group cursor-pointer bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Imagen de la categoría */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={getImageUrl(categoria)}
                          alt={categoria.nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=Sin+Imagen';
                          }}
                        />
                        
                        {/* Badge de cantidad de productos */}
                        {categoria.cantidad_productos !== undefined && (
                          <div className="absolute top-3 right-3 bg-gray-800 text-white px-2 py-1 rounded text-sm font-medium">
                            {categoria.cantidad_productos} productos
                          </div>
                        )}
                      </div>

                      {/* Contenido de la categoría */}
                      <div className="p-5">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {categoria.nombre}
                        </h3>
                        
                        {categoria.descripcion && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {categoria.descripcion}
                          </p>
                        )}

                        <div className="flex items-center text-gray-700 text-sm font-medium">
                          <span>Ver productos</span>
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Products;