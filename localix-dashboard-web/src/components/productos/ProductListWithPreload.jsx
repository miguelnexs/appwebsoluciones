import React, { useState, useCallback, useMemo } from 'react';
import { usePreloadedProducts } from '../../contexts/PreloadContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Edit, 
  Trash2,
  Package,
  Tag,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

// 🚀 COMPONENTE DE LISTA DE PRODUCTOS CON PRE-CARGA
const ProductListWithPreload = () => {
  const navigate = useNavigate();
  const { data: products, isLoading, error, isStale, refresh, preload } = usePreloadedProducts();
  
  // 🚀 ESTADO LOCAL
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nombre');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // 🚀 FILTRAR Y ORDENAR PRODUCTOS
  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products.filter(product => {
      const matchesSearch = product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
                            product.categoria?.nombre === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'precio') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (sortBy === 'fecha_creacion') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else {
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [products, searchTerm, sortBy, sortOrder, selectedCategory]);

  // 🚀 OBTENER CATEGORÍAS ÚNICAS
  const uniqueCategories = useMemo(() => {
    if (!products) return [];
    const categories = [...new Set(products.map(p => p.categoria?.nombre).filter(Boolean))];
    return categories.sort();
  }, [products]);

  // 🚀 CALCULAR ESTADÍSTICAS
  const stats = useMemo(() => {
    if (!products) return { total: 0, active: 0, inactive: 0, averagePrice: 0 };
    
    const total = products.length;
    const active = products.filter(p => p.activo).length;
    const inactive = total - active;
    const averagePrice = products.reduce((sum, p) => sum + (parseFloat(p.precio) || 0), 0) / total;
    
    return { total, active, inactive, averagePrice: averagePrice.toFixed(2) };
  }, [products]);

  // 🚀 MANEJAR ACCIONES
  const handleEdit = useCallback((product) => {
    navigate(`/productos/editar/${product.slug}`);
  }, [navigate]);

  const handleView = useCallback((product) => {
    navigate(`/productos/ver/${product.slug}`);
  }, [navigate]);

  const handleDelete = useCallback(async (product) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${product.nombre}"?`)) {
      try {
        await window.electronAPI.productos.eliminar(product.slug);
        refresh(); // Actualizar datos pre-cargados
      } catch (error) {
        console.error('Error al eliminar producto:', error);
      }
    }
  }, [refresh]);

  const handleRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const handlePreload = useCallback(async () => {
    await preload();
  }, [preload]);

  // 🚀 RENDERIZAR PRODUCTO
  const renderProduct = useCallback((product, index) => (
    <div key={product.id} className="bg-theme-surface rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-theme-text truncate">
              {product.nombre}
            </h3>
                         <span className={`px-2 py-1 text-xs rounded-full ${
               product.activo 
                 ? 'bg-theme-success/20 text-theme-success border border-theme-success/30' 
                 : 'bg-theme-error/20 text-theme-error border border-theme-error/30'
             }`}>
               {product.activo ? 'Activo' : 'Inactivo'}
             </span>
          </div>
          
          <p className="text-theme-textSecondary text-sm mb-3 line-clamp-2">
            {product.descripcion}
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-theme-textSecondary">
            <div className="flex items-center space-x-1">
              <Tag className="w-4 h-4" />
              <span>{product.categoria?.nombre || 'Sin categoría'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Package className="w-4 h-4" />
              <span>{product.stock || 0} unidades</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(product.fecha_creacion).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <div className="text-right">
            <div className="text-2xl font-bold text-theme-text">
              {formatPrice(product.precio)}
            </div>
            {product.precio_anterior && (
              <div className="text-sm text-theme-textSecondary line-through">
                {formatPrice(product.precio_anterior)}
              </div>
            )}
          </div>
          
          <div className="flex space-x-1">
                         <button
               onClick={() => handleView(product)}
               className="p-2 text-theme-textSecondary hover:text-theme-accent hover:bg-theme-secondary rounded"
               title="Ver detalles"
             >
              <Eye className="w-4 h-4" />
            </button>
                         <button
               onClick={() => handleEdit(product)}
               className="p-2 text-theme-textSecondary hover:text-theme-success hover:bg-theme-secondary rounded"
               title="Editar"
             >
              <Edit className="w-4 h-4" />
            </button>
                         <button
               onClick={() => handleDelete(product)}
               className="p-2 text-theme-textSecondary hover:text-theme-error hover:bg-theme-secondary rounded"
               title="Eliminar"
             >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  ), [handleView, handleEdit, handleDelete]);

  // 🚀 RENDERIZAR ESTADÍSTICAS
  const renderStats = useCallback(() => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
             <div className="bg-theme-surface border border-theme-border p-4 rounded-lg">
         <div className="flex items-center space-x-2">
           <Package className="w-5 h-5 text-theme-accent" />
           <span className="text-sm font-medium text-theme-text">Total Productos</span>
         </div>
         <div className="text-2xl font-bold text-theme-text">{stats.total}</div>
       </div>
      
             <div className="bg-theme-surface border border-theme-border p-4 rounded-lg">
         <div className="flex items-center space-x-2">
           <TrendingUp className="w-5 h-5 text-theme-success" />
           <span className="text-sm font-medium text-theme-text">Activos</span>
         </div>
         <div className="text-2xl font-bold text-theme-text">{stats.active}</div>
       </div>
      
             <div className="bg-theme-surface border border-theme-border p-4 rounded-lg">
         <div className="flex items-center space-x-2">
           <Package className="w-5 h-5 text-theme-error" />
           <span className="text-sm font-medium text-theme-text">Inactivos</span>
         </div>
         <div className="text-2xl font-bold text-theme-text">{stats.inactive}</div>
       </div>
      
             <div className="bg-theme-surface border border-theme-border p-4 rounded-lg">
         <div className="flex items-center space-x-2">
           <Tag className="w-5 h-5 text-theme-accent" />
           <span className="text-sm font-medium text-theme-text">Precio Promedio</span>
         </div>
         <div className="text-2xl font-bold text-theme-text">${stats.averagePrice}</div>
       </div>
    </div>
  ), [stats]);

  // 🚀 RENDERIZAR FILTROS
  const renderFilters = useCallback(() => (
    <div className="bg-theme-surface rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-theme-text">Filtros y Búsqueda</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-theme-secondary text-theme-textSecondary rounded hover:bg-theme-border"
        >
          <Filter className="w-4 h-4" />
          <span>{showFilters ? 'Ocultar' : 'Mostrar'} Filtros</span>
        </button>
      </div>
      
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-theme-textSecondary mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-textSecondary" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar productos..."
                                 className="w-full pl-10 pr-4 py-2 border border-theme-border rounded-md focus:ring-2 focus:ring-theme-accent focus:border-theme-accent bg-theme-background text-theme-text"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-theme-textSecondary mb-2">
              Categoría
            </label>
                         <select
               value={selectedCategory}
               onChange={(e) => setSelectedCategory(e.target.value)}
               className="w-full px-3 py-2 border border-theme-border rounded-md focus:ring-2 focus:ring-theme-accent focus:border-theme-accent bg-theme-background text-theme-text"
             >
              <option value="all">Todas las categorías</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-theme-textSecondary mb-2">
              Ordenar por
            </label>
                         <select
               value={sortBy}
               onChange={(e) => setSortBy(e.target.value)}
               className="w-full px-3 py-2 border border-theme-border rounded-md focus:ring-2 focus:ring-theme-accent focus:border-theme-accent bg-theme-background text-theme-text"
             >
              <option value="nombre">Nombre</option>
              <option value="precio">Precio</option>
              <option value="fecha_creacion">Fecha</option>
              <option value="stock">Stock</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-theme-textSecondary mb-2">
              Orden
            </label>
                         <select
               value={sortOrder}
               onChange={(e) => setSortOrder(e.target.value)}
               className="w-full px-3 py-2 border border-theme-border rounded-md focus:ring-2 focus:ring-theme-accent focus:border-theme-accent bg-theme-background text-theme-text"
             >
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>
        </div>
      )}
    </div>
  ), [searchTerm, selectedCategory, sortBy, sortOrder, showFilters, uniqueCategories]);

  // 🚀 RENDERIZAR ESTADO DE CARGA
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center space-x-2">
                     <RefreshCw className="w-5 h-5 animate-spin text-theme-accent" />
          <span className="text-theme-textSecondary">Cargando productos...</span>
        </div>
      </div>
    );
  }

  // 🚀 RENDERIZAR ERROR
  if (error) {
    return (
      <div className="p-6">
                 <div className="bg-theme-surface border border-theme-error rounded-lg p-4">
           <div className="flex items-center space-x-2">
             <span className="text-theme-error">❌</span>
             <span className="text-theme-text">Error al cargar productos: {error}</span>
           </div>
           <button
             onClick={handleRefresh}
             className="mt-2 px-4 py-2 bg-theme-error text-white rounded hover:bg-opacity-90"
           >
             Reintentar
           </button>
         </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 🚀 HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-theme-text">Productos</h1>
          <p className="text-theme-textSecondary mt-1">
            {filteredAndSortedProducts.length} productos encontrados
                         {isStale && <span className="text-theme-warning ml-2">(datos desactualizados)</span>}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
                     <button
             onClick={handlePreload}
             className="flex items-center space-x-2 px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-accent"
             title="Pre-cargar datos"
           >
            <RefreshCw className="w-4 h-4" />
            <span>Pre-cargar</span>
          </button>
          
                     <button
             onClick={() => navigate('/productos/nuevo')}
             className="flex items-center space-x-2 px-4 py-2 bg-theme-success text-white rounded-lg hover:bg-opacity-90"
           >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* 🚀 ESTADÍSTICAS */}
      {renderStats()}

      {/* 🚀 FILTROS */}
      {renderFilters()}

      {/* 🚀 LISTA DE PRODUCTOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAndSortedProducts.map(renderProduct)}
      </div>

      {/* 🚀 ESTADO VACÍO */}
      {filteredAndSortedProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-theme-textSecondary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-theme-text mb-2">
            No se encontraron productos
          </h3>
          <p className="text-theme-textSecondary mb-4">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'No hay productos registrados aún'
            }
          </p>
                     <button
             onClick={() => navigate('/productos/nuevo')}
             className="px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-accent"
           >
             Crear Primer Producto
           </button>
        </div>
      )}
    </div>
  );
};

export default ProductListWithPreload;
