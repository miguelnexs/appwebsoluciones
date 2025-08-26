import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Eye, ArrowRight, TrendingUp, TrendingDown, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';
import { RESOURCE_URL } from '../../api/apiConfig';

// Función para obtener URL de imagen
function getImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${RESOURCE_URL}${url}`;
}

const CategoryCard = ({ categoria, onViewProducts }) => {
  const navigate = useNavigate();
  const [productosPreview, setProductosPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalProductos: 0,
    stockTotal: 0,
    valorInventario: 0
  });

  // Cargar productos de vista previa para la categoría
  useEffect(() => {
    const fetchProductosPreview = async () => {
      if (!categoria?.slug) return;
      
      setLoading(true);
      try {
        // Obtener productos de la categoría (máximo 4 para preview)
        const response = await window.electronAPI.productos.listar({ 
          categoria_slug: categoria.slug,
          limit: 4 
        });
        
        const productos = Array.isArray(response?.results) ? response.results : Array.isArray(response) ? response : [];
        setProductosPreview(productos);
        
        // Calcular estadísticas detalladas
        const totalProductos = categoria.cantidad_productos || productos.length;
        const stockTotal = categoria.stock_total_categoria || productos.reduce((sum, p) => sum + (parseInt(p.stock_total_calculado || p.stock) || 0), 0);
        
        // Calcular valor de inventario con más precisión
        const valorInventario = productos.reduce((sum, p) => {
          const stock = parseInt(p.stock_total_calculado || p.stock) || 0;
          const precio = parseFloat(p.precio) || 0;
          return sum + (stock * precio);
        }, 0) / 100;
        
        // Calcular productos activos/inactivos
        const productosActivos = productos.filter(p => p.estado === 'publicado').length;
        const productosInactivos = productos.filter(p => p.estado !== 'publicado').length;
        
        // Calcular productos con stock bajo (menos de 10 unidades)
        const productosStockBajo = productos.filter(p => {
          const stock = parseInt(p.stock_total_calculado || p.stock) || 0;
          return stock > 0 && stock < 10;
        }).length;
        
        // Calcular productos sin stock
        const productosSinStock = productos.filter(p => {
          const stock = parseInt(p.stock_total_calculado || p.stock) || 0;
          return stock === 0;
        }).length;
        
        setStats({
          totalProductos,
          stockTotal,
          valorInventario,
          productosActivos,
          productosInactivos,
          productosStockBajo,
          productosSinStock
        });
      } catch (error) {
        console.error('Error al cargar productos de preview:', error);
        setProductosPreview([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductosPreview();
  }, [categoria]);

  const handleViewAllProducts = () => {
    if (onViewProducts) {
      onViewProducts(categoria);
    } else {
      navigate(`/categoria/${categoria.slug}`);
    }
  };

  return (
    <div className="bg-theme-surface rounded-xl border border-theme-border hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Header de la categoría */}
      <div className="p-6 border-b border-theme-border">
        <div className="flex items-start gap-4">
          {/* Imagen de la categoría */}
          <div className="flex-shrink-0">
            {categoria.imagen_url ? (
              <img
                src={getImageUrl(categoria.imagen_url)}
                alt={categoria.nombre}
                className="w-16 h-16 rounded-lg object-cover border border-theme-border"
              />
            ) : (
              <div className="w-16 h-16 bg-theme-secondary rounded-lg flex items-center justify-center border border-theme-border">
                <Package className="w-8 h-8 text-theme-textSecondary" />
              </div>
            )}
          </div>
          
          {/* Información de la categoría */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-theme-text mb-1 truncate">
              {categoria.nombre}
            </h3>
            <p className="text-sm text-theme-textSecondary mb-3 line-clamp-2">
              {categoria.descripcion || 'Sin descripción disponible'}
            </p>
            
            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3 text-blue-500" />
                <span className="text-theme-textSecondary">Total:</span>
                <span className="font-medium text-theme-text">{stats.totalProductos}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-theme-textSecondary">Stock:</span>
                <span className="font-medium text-theme-text">{stats.stockTotal}</span>
              </div>
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3 text-emerald-500" />
                <span className="text-theme-textSecondary">Activos:</span>
                <span className="font-medium text-theme-text">{stats.productosActivos}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-yellow-500" />
                <span className="text-theme-textSecondary">Valor:</span>
                <span className="font-medium text-theme-text">${Math.round(stats.valorInventario).toLocaleString('es-CO')}</span>
              </div>
            </div>
            
            {/* Alertas de stock */}
            {(stats.productosSinStock > 0 || stats.productosStockBajo > 0) && (
              <div className="flex items-center gap-3 mt-2 text-xs">
                {stats.productosSinStock > 0 && (
                  <div className="flex items-center gap-1 text-red-500">
                    <Package className="w-3 h-3" />
                    <span>{stats.productosSinStock} sin stock</span>
                  </div>
                )}
                {stats.productosStockBajo > 0 && (
                  <div className="flex items-center gap-1 text-orange-500">
                    <TrendingUp className="w-3 h-3" />
                    <span>{stats.productosStockBajo} stock bajo</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Botón de ver todos */}
          <button
            onClick={handleViewAllProducts}
            className="flex items-center gap-1 px-3 py-1.5 bg-theme-primary text-white rounded-lg hover:bg-theme-accent transition-colors text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Eye className="w-4 h-4" />
            Ver todos
          </button>
        </div>
      </div>
      
      {/* Vista previa de productos */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-theme-text">Productos destacados</h4>
          {productosPreview.length > 0 && (
            <button
              onClick={handleViewAllProducts}
              className="flex items-center gap-1 text-xs text-theme-accent hover:text-theme-primary transition-colors"
            >
              Ver todos
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-theme-secondary rounded-lg h-20 mb-2"></div>
                <div className="bg-theme-secondary rounded h-3 mb-1"></div>
                <div className="bg-theme-secondary rounded h-3 w-2/3"></div>
              </div>
            ))}
          </div>
        ) : productosPreview.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {productosPreview.map((producto) => (
              <div
                key={producto.id || producto.slug}
                className="group/product cursor-pointer"
                onClick={handleViewAllProducts}
              >
                <div className="bg-theme-background rounded-lg p-3 border border-theme-border hover:border-theme-accent transition-colors">
                  {/* Imagen del producto */}
                  <div className="aspect-square mb-2 overflow-hidden rounded-md">
                    {producto.imagen_principal_url ? (
                      <img
                        src={getImageUrl(producto.imagen_principal_url)}
                        alt={producto.nombre}
                        className="w-full h-full object-cover group-hover/product:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full bg-theme-secondary flex items-center justify-center">
                        <Package className="w-6 h-6 text-theme-textSecondary" />
                      </div>
                    )}
                  </div>
                  
                  {/* Información del producto */}
                  <div>
                    <h5 className="text-xs font-medium text-theme-text mb-1 line-clamp-1">
                      {producto.nombre}
                    </h5>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-theme-accent font-medium">
                        ${(parseFloat(producto.precio || 0) / 100).toLocaleString('es-CO')}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        (parseInt(producto.stock_total_calculado || producto.stock) || 0) > 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        Stock: {parseInt(producto.stock_total_calculado || producto.stock) || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-theme-secondary rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-theme-textSecondary" />
            </div>
            <p className="text-sm text-theme-textSecondary mb-3">No hay productos en esta categoría</p>
            <button
              onClick={() => navigate('/products/new')}
              className="text-xs text-theme-accent hover:text-theme-primary transition-colors"
            >
              Agregar productos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;