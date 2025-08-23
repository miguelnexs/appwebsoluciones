import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Home, ChevronRight, Folder, TrendingUp, DollarSign, Archive } from 'lucide-react';

const CategoriaProductosTable = ({ categoriaSlug, readOnlyProductos, productos, productosVinculados }) => {
  const [productosState, setProductosState] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriaInfo, setCategoriaInfo] = useState(null);
  const [categoriasRelacionadas, setCategoriasRelacionadas] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const navigate = useNavigate();

  // Función para obtener información de la categoría
  const fetchCategoriaInfo = async () => {
    if (!categoriaSlug) return;
    
    try {
      const categoria = await window.electronAPI.categorias.obtener(categoriaSlug);
      setCategoriaInfo(categoria);
    } catch (err) {
      console.error('Error al cargar información de la categoría:', err);
    }
  };

  // Función para obtener categorías relacionadas
  const fetchCategoriasRelacionadas = async () => {
    setLoadingCategorias(true);
    try {
      const response = await window.electronAPI.categorias.listar();
      const todasCategorias = Array.isArray(response?.results) ? response.results : Array.isArray(response) ? response : [];
      
      // Filtrar la categoría actual y tomar las primeras 5
      const relacionadas = todasCategorias
        .filter(cat => cat.slug !== categoriaSlug)
        .slice(0, 5);
      
      setCategoriasRelacionadas(relacionadas);
    } catch (err) {
      console.error('Error al cargar categorías relacionadas:', err);
    } finally {
      setLoadingCategorias(false);
    }
  };

  useEffect(() => {
    if (productosVinculados && Array.isArray(productosVinculados)) {
      setProductosState(productosVinculados);
      setLoading(false);
      return;
    }
    if (readOnlyProductos && Array.isArray(productos)) {
      setProductosState(productos);
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Cargar productos y información de categoría en paralelo
        const [productosRes] = await Promise.all([
          window.electronAPI.productos.listar({ categoria_slug: categoriaSlug }),
          fetchCategoriaInfo(),
          fetchCategoriasRelacionadas()
        ]);
        
        setProductosState(Array.isArray(productosRes?.results) ? productosRes.results : Array.isArray(productosRes) ? productosRes : []);
      } catch (err) {
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [categoriaSlug, readOnlyProductos, productos, productosVinculados]);

  // Función para calcular estadísticas de productos
  const calcularEstadisticas = () => {
    const totalProductos = productosState.length;
    const stockTotal = productosState.reduce((sum, p) => sum + (parseInt(p.stock_total_calculado || p.stock) || 0), 0);
    const valorInventario = productosState.reduce((sum, p) => {
      const stock = parseInt(p.stock_total_calculado || p.stock) || 0;
      const precio = parseFloat(p.precio) || 0;
      return sum + (stock * precio);
    }, 0);
    
    return { totalProductos, stockTotal, valorInventario };
  };

  const estadisticas = calcularEstadisticas();

  return (
    <div className="min-h-screen bg-theme-background">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-theme-textSecondary mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 hover:text-theme-text transition-colors"
          >
            <Home size={16} />
            Dashboard
          </button>
          <ChevronRight size={16} />
          <button
            onClick={() => navigate('/categories')}
            className="hover:text-theme-text transition-colors"
          >
            Categorías
          </button>
          <ChevronRight size={16} />
          <span className="text-theme-text font-medium">
            {categoriaInfo?.nombre || 'Cargando...'}
          </span>
        </nav>

        {/* Header con información de la categoría */}
        <div className="bg-theme-surface rounded-xl border border-theme-border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              {/* Imagen de la categoría */}
              <div className="flex-shrink-0">
                {categoriaInfo?.imagen_url ? (
                  <img
                    src={categoriaInfo.imagen_url}
                    alt={categoriaInfo.nombre}
                    className="w-16 h-16 rounded-lg object-cover border border-theme-border"
                  />
                ) : (
                  <div className="w-16 h-16 bg-theme-secondary rounded-lg flex items-center justify-center border border-theme-border">
                    <Folder className="w-8 h-8 text-theme-textSecondary" />
                  </div>
                )}
              </div>
              
              {/* Información de la categoría */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-theme-text mb-2">
                  {categoriaInfo?.nombre || 'Productos de la Categoría'}
                </h1>
                {categoriaInfo?.descripcion && (
                  <p className="text-theme-textSecondary mb-3">
                    {categoriaInfo.descripcion}
                  </p>
                )}
                
                {/* Estadísticas rápidas */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-500" />
                    <span className="text-theme-textSecondary">Productos:</span>
                    <span className="font-medium text-theme-text">{estadisticas.totalProductos}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Archive className="w-4 h-4 text-green-500" />
                    <span className="text-theme-textSecondary">Stock Total:</span>
                    <span className="font-medium text-theme-text">{estadisticas.stockTotal.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-yellow-500" />
                    <span className="text-theme-textSecondary">Valor Inventario:</span>
                    <span className="font-medium text-theme-text">${estadisticas.valorInventario.toLocaleString('es-CO')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Botón volver */}
            <button
              onClick={() => navigate('/categories')}
              className="flex items-center gap-2 px-4 py-2 bg-theme-secondary text-theme-textSecondary rounded-lg hover:bg-theme-border transition-colors"
            >
              <ArrowLeft size={18} />
              Volver a Categorías
            </button>
          </div>
          
          {/* Enlaces rápidos a otras categorías */}
          {categoriasRelacionadas.length > 0 && (
            <div className="border-t border-theme-border pt-4">
              <h3 className="text-sm font-medium text-theme-textSecondary mb-3">Otras categorías:</h3>
              <div className="flex flex-wrap gap-2">
                {categoriasRelacionadas.map((categoria) => (
                  <button
                    key={categoria.id || categoria.slug}
                    onClick={() => navigate(`/categoria/${categoria.slug}`)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-theme-background text-theme-text rounded-lg hover:bg-theme-border transition-colors text-sm"
                  >
                    <Folder size={14} />
                    {categoria.nombre}
                    {categoria.cantidad_productos && (
          <span className="text-xs text-theme-textSecondary">({categoria.cantidad_productos})</span>
        )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : productosState.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 bg-theme-secondary rounded-full flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-theme-textSecondary" />
            </div>
            <h3 className="text-lg font-medium text-theme-text mb-2">No hay productos en esta categoría</h3>
            <p className="text-theme-textSecondary mb-4">Agrega productos a esta categoría para verlos aquí.</p>
          </div>
        ) : (
          <div className="bg-theme-surface rounded-lg border border-theme-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-theme-background">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider">Imagen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider">Precio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="bg-theme-surface divide-y divide-theme-border">
                  {productosState.map(producto => (
                    <tr key={producto.id || producto.slug} className="hover:bg-theme-background transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {producto.imagen_principal_url ? (
                          <img
                            src={producto.imagen_principal_url}
                            alt={producto.nombre}
                            className="h-10 w-10 rounded-lg object-cover border border-theme-border"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-theme-secondary rounded-lg flex items-center justify-center border border-theme-border">
                            <Package size={18} className="text-theme-textSecondary" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{producto.nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{producto.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${producto.precio?.toLocaleString('es-CO')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={parseInt(producto.stock_total_calculado || producto.stock) > 0 ? 'text-blue-600' : 'text-red-600'}>
                          {parseInt(producto.stock_total_calculado || producto.stock) || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          producto.estado === 'publicado'
                            ? 'bg-blue-100 text-blue-800'
                            : producto.estado === 'borrador'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-theme-secondary text-theme-text'
                        }`}>
                          {producto.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriaProductosTable;