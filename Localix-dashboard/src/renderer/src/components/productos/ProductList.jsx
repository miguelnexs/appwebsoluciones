import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../api/axios';
import {
  Search, Plus, RefreshCw, Eye, Edit, Trash2,
  Package, Filter, ArrowUpDown, ChevronDown, ChevronUp,
  CheckCircle, Edit as EditIcon, AlertTriangle, XCircle, TrendingUp, Package2,
  FolderOpen, Settings, X, Download
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Componentes personalizados
import ProductStatusChip from './ProductStatusChip';
import ProductVariantAccordion from './ProductVariantAccordion';
import ProductDialog from './ProductDialog';
import ProductForm from './ProductForm';
import EmptyState from './EmptyState';
import PaginationControls from './PaginationControls';
import ErrorBoundary from './ErrorBoundary';
import ProductColorsDisplay from './ProductColorsDisplay';
import SmartProductSearch from './SmartProductSearch';

// Componentes UI estandarizados
import DataTable from '../ui/DataTable';
import ActionButtons from '../ui/ActionButtons';

// Hooks y utilidades
import { useToast } from '../../hooks/useToast';
import { useDeleteConfirmation } from '../../hooks/useDeleteConfirmation';
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';
import { formatPrice } from '../../utils/formatters';
import { RESOURCE_URL } from '../../api/apiConfig';
import { useLoadingState, InlineLoading, ErrorState, CardSkeleton } from '../ui/LoadingComponents';

function getImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return RESOURCE_URL(url);
  return url;
}

// Configuración de columnas para la tabla estandarizada
const getProductColumns = (onView, onEdit, onDelete) => [
  {
    key: 'producto',
    label: 'Producto',
    sortable: true,
    render: (product) => (
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {product.imagen_principal_url ? (
            <img
              src={getImageUrl(product.imagen_principal_url)}
              alt={product.nombre}
              className="w-10 h-10 rounded-lg object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-10 h-10 bg-theme-border rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-theme-textSecondary" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-theme-text truncate">
            {product.nombre}
          </p>
          <p className="text-sm text-theme-textSecondary truncate">
            SKU: {product.sku || 'N/A'}
          </p>
        </div>
      </div>
    )
  },
  {
    key: 'precio',
    label: 'Precio',
    sortable: true,
    render: (product) => (
      <div className="text-right">
        <p className="text-sm font-medium text-theme-text">
          {formatPrice(product.precio)}
        </p>
        {product.precio_anterior && (
          <p className="text-xs text-theme-textSecondary line-through">
            {formatPrice(product.precio_anterior)}
          </p>
        )}
      </div>
    )
  },
  {
    key: 'estado',
    label: 'Estado',
    sortable: true,
    render: (product) => <ProductStatusChip status={product.estado} />
  },
  {
    key: 'stock',
    label: 'Stock',
    sortable: true,
    render: (product) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        product.stock > 0 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {product.stock} unidades
      </span>
    )
  },
  {
    key: 'categoria',
    label: 'Categoría',
    sortable: true,
    render: (product) => product.categoria?.nombre || 'Sin categoría'
  },
  {
    key: 'fecha_creacion',
    label: 'Fecha',
    sortable: true,
    render: (product) => new Date(product.fecha_creacion).toLocaleDateString()
  },
  {
    key: 'acciones',
    label: 'Acciones',
    sortable: false,
    render: (product) => (
      <ActionButtons
        onView={() => onView(product)}
        onEdit={() => onEdit(product)}
        onDelete={() => onDelete(product)}
        size="sm"
        variant="compact"
      />
    )
  }
];

const ProductList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { deleteModal, hideDeleteConfirmation, confirmDeleteProduct } = useDeleteConfirmation();
  const { isLoading, startLoading, stopLoading } = useLoadingState('products-main');
  
  // Estados
  const [data, setData] = useState({
    products: [],
    selectedProduct: null
  });
  
  const [ui, setUi] = useState({
    openDialog: false,
    dialogMode: 'view', // 'view' | 'edit'
    error: null
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalItems: 0,
    hasMore: true,
    loading: false
  });
  
  const observer = useRef();
  const lastProductElementRef = useCallback(node => {
    if (pagination.loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pagination.hasMore) {
        fetchProducts(pagination.page + 1, searchQuery, filters, true);
      }
    });
    if (node) observer.current.observe(node);
  }, [pagination.loading, pagination.hasMore]);
  
  // Estados de búsqueda y filtros mejorados
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  
  const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'asc' });
  const [stats, setStats] = useState({
    total: 0,
    publicados: 0,
    borradores: 0,
    agotados: 0,
    conStock: 0,
    sinStock: 0,
    descontinuados: 0
  });

  // Calcular estadísticas de productos
  const calculateStats = useCallback((products) => {
    const stats = {
      total: products.length,
      publicados: 0,
      borradores: 0,
      agotados: 0,
      conStock: 0,
      sinStock: 0,
      descontinuados: 0
    };

    products.forEach(product => {
      // Contar por estado
      switch (product.estado) {
        case 'publicado':
          stats.publicados++;
          break;
        case 'borrador':
          stats.borradores++;
          break;
        case 'agotado':
          stats.agotados++;
          break;
        case 'descontinuado':
          stats.descontinuados++;
          break;
      }

      // Contar por stock
      if (product.gestion_stock) {
        if (parseInt(product.stock) > 0) {
          stats.conStock++;
        } else {
          stats.sinStock++;
        }
      } else {
        stats.sinStock++;
      }
    });

    return stats;
  }, []);

  // Función mejorada para obtener sugerencias de búsqueda
  const fetchSuggestions = useCallback(async (searchTerm) => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      // Verificar si el usuario está autenticado para usar HTTP directo o IPC
      const token = localStorage.getItem('access_token');
      const isAuthenticated = !!token;
      
      let response;
      if (isAuthenticated) {
        // Usar llamada HTTP directa
        const apiResponse = await api.get('productos/productos/', { 
          params: { search: searchTerm, page_size: 5 } 
        });
        response = apiResponse.data;
      } else {
        // Usar IPC si no está autenticado
        response = await window.electronAPI.productos.buscar({
          search: searchTerm,
          page_size: 5
        });
      }
      
      if (response?.results) {
        setSuggestions(response.results);
      }
    } catch (error) {
      console.warn('Error fetching search suggestions:', error);
      setSuggestions([]);
    }
  }, []);



  // Fetch de productos con filtros mejorados

  const fetchProducts = useCallback(async (page = 1, searchTerm = '', appliedFilters = {}, append = false) => {
    try {
      if (page === 1) {
        setData(prev => ({ ...prev, products: [] }));
      }
      
      setPagination(prev => ({ ...prev, loading: true }));
      setUi(prev => ({ ...prev, error: null }));
      
      // Construir parámetros de búsqueda
      const searchParams = {
        page,
        page_size: pagination.pageSize,
        search: searchTerm,
        ordering: sortConfig.direction === 'desc' ? `-${sortConfig.key}` : sortConfig.key
      };

      // Aplicar filtros
      if (appliedFilters.estado && appliedFilters.estado !== 'todos') {
        searchParams.estado = appliedFilters.estado;
      }
      
      if (appliedFilters.stock && appliedFilters.stock !== 'todos') {
        switch (appliedFilters.stock) {
          case 'disponible':
            searchParams.stock_gt = 0;
            break;
          case 'bajo':
            searchParams.stock_lte = 5;
            searchParams.stock_gt = 0;
            break;
          case 'agotado':
            searchParams.stock = 0;
            break;
        }
      }

      if (appliedFilters.precioMin) {
        searchParams.precio_gte = appliedFilters.precioMin;
      }
      
      if (appliedFilters.precioMax) {
        searchParams.precio_lte = appliedFilters.precioMax;
      }

      if (appliedFilters.fechaDesde) {
        searchParams.created_gte = appliedFilters.fechaDesde;
      }
      
      if (appliedFilters.fechaHasta) {
        searchParams.created_lte = appliedFilters.fechaHasta;
      }
      
      // Verificar si el usuario está autenticado para usar HTTP directo o IPC
      const token = localStorage.getItem('access_token');
      const isAuthenticated = !!token;
      
      let response;
      if (isAuthenticated) {
        // Usar llamada HTTP directa
        const apiResponse = await api.get('productos/productos/', { params: searchParams });
        response = apiResponse.data; // Extraer los datos de la respuesta HTTP
      } else {
        // Usar IPC si no está autenticado
        response = await window.electronAPI.productos.listar(searchParams);
      }
      const productsData = Array.isArray(response?.results)
        ? response.results
        : (Array.isArray(response) ? response : []);
      
      setData(prev => ({
        products: append ? [...prev.products, ...productsData] : productsData,
        selectedProduct: null
      }));
      
      // Calcular y actualizar estadísticas
      const newStats = calculateStats(append ? [...data.products, ...productsData] : productsData);
      setStats(newStats);
      
      setPagination(prev => ({
        ...prev,
        totalItems: typeof response?.count === 'number' ? response.count : productsData.length,
        page,
        hasMore: productsData.length === pagination.pageSize,
        loading: false
      }));

    } catch (err) {
      console.error('Error fetching products:', err);
      setUi(prev => ({ ...prev, error: err.message || 'Error al cargar los productos' })); 
      setData(prev => ({ ...prev, products: [] }));
    } finally {
      stopLoading();
    }
  }, [pagination.pageSize, sortConfig, startLoading, stopLoading]);

  // Manejar búsqueda inteligente
  const handleSmartSearch = useCallback((searchTerm) => {
    setSearchQuery(searchTerm);
    fetchProducts(1, searchTerm, filters);
    
    // Obtener sugerencias para futuras búsquedas
    if (searchTerm.length > 2) {
      fetchSuggestions(searchTerm);
    }
  }, [filters, fetchProducts, fetchSuggestions]);

  // Manejar cambios en filtros
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    fetchProducts(1, searchQuery, newFilters);
  }, [searchQuery, fetchProducts]);

  // Efecto para cargar productos iniciales
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handlers optimizados
  const openDialogFor = useCallback(async (product, mode='view') => {
    try {
      setData(prev => ({ ...prev, selectedProduct: product }));
      setUi(prev => ({ ...prev, openDialog: true, dialogMode: mode }));
    } catch (error) {
      console.error('Error opening product dialog:', error);
    }
  }, []);

  // Función para eliminar producto - OPTIMIZADA
  const handleDeleteProduct = useCallback(async (productSlug) => {
    try {
      console.log('🔄 Iniciando eliminación de producto:', productSlug);
      
      // Validación adicional del slug
      if (!productSlug || productSlug.trim() === '') {
        console.error('❌ Slug inválido:', productSlug);
        toast.error('Identificador de producto inválido', 'El producto no tiene un identificador válido');
        return;
      }
      
      // Buscar el producto en la lista para obtener el slug
      const product = data.products.find(p => p.slug === productSlug);
      if (!product) {
        console.error('❌ Producto no encontrado:', productSlug);
        toast.error('Producto no encontrado', 'No se pudo encontrar el producto especificado');
        return;
      }

      console.log('📋 Producto encontrado:', product.nombre, 'Slug:', product.slug);

      const success = await confirmDeleteProduct(
        async () => {
          try {
            console.log('🚀 Ejecutando eliminación en backend...');
            const result = await window.electronAPI.productos.eliminar(product.slug);
            console.log('✅ Eliminación exitosa en backend:', result);
            
            // 🚀 ACTUALIZACIÓN INMEDIATA: Remover el producto de la lista localmente
            setData(prev => ({
              ...prev,
              products: prev.products.filter(p => p.slug !== productSlug)
            }));
            
            // 🚀 LIMPIAR CACHE Y RECARGAR LISTA COMPLETA
            console.log('🧹 Limpiando caché...');
            try {
              await window.electronAPI.productos.limpiarCache();
              console.log('✅ Cache limpiado exitosamente');
            } catch (cacheError) {
              console.warn('⚠️ Error al limpiar caché:', cacheError);
            }
            
            console.log('🔄 Recargando lista de productos...');
            await fetchProducts(pagination.page, searchQuery, filters);
            console.log('✅ Lista de productos actualizada correctamente');
            
            // 🚀 MOSTRAR NOTIFICACIÓN DE ÉXITO
            toast.showDeleteSuccess(product.nombre);
            
          } catch (deleteError) {
            console.error('❌ Error durante la eliminación:', deleteError);
            throw deleteError;
          }
        },
        product.nombre
      );
      
      if (!success) {
        console.error('❌ Eliminación falló');
        setUi(prev => ({ ...prev, error: 'Error al eliminar el producto' }));
      } else {
        console.log('✅ Proceso de eliminación completado exitosamente');
      }
      
    } catch (error) {
      console.error('❌ Error eliminando producto:', error);
      setUi(prev => ({ ...prev, error: error.message }));
      toast.error('Error al eliminar el producto', error.message);
    }
  }, [data.products, fetchProducts, pagination.page, searchQuery, filters, confirmDeleteProduct, toast]);

  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchProducts(pagination.page);
  }, [fetchProducts, pagination.page]);

  // Función para ordenar
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Función para obtener icono de ordenamiento
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="ml-1" />;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp size={14} className="ml-1" /> : 
      <ChevronDown size={14} className="ml-1" />;
  };

  // Función para exportar productos a Excel
  const handleExportToExcel = useCallback(async () => {
    try {
      startLoading();
      
      // Preparar filtros para la exportación (excluir 'todos')
      const exportFilters = { ...filters };
      if (exportFilters.estado === 'todos') {
        delete exportFilters.estado;
      }
      if (exportFilters.stock === 'todos') {
        delete exportFilters.stock;
      }
      
      // Obtener todos los productos sin paginación
      const allProductsResponse = await window.electronAPI.productos.listar({
        page_size: 10000, // Número grande para obtener todos
        search: searchQuery,
        ...exportFilters
      });
      
      const allProducts = Array.isArray(allProductsResponse?.results) 
        ? allProductsResponse.results 
        : (Array.isArray(allProductsResponse) ? allProductsResponse : []);
      
      if (allProducts.length === 0) {
        toast.error('No hay productos para exportar', 'No se encontraron productos que coincidan con los filtros aplicados');
        return;
      }

      // Obtener colores para cada producto
      const productsWithColors = await Promise.all(
        allProducts.map(async (product) => {
          try {
            const response = await window.electronAPI.productos.obtenerColores(product.id);
            console.log(`Colores para producto ${product.id}:`, response);
            
            // Manejar la estructura de respuesta del handler optimizado
            let colores = [];
            if (response && response.success && response.data) {
              colores = Array.isArray(response.data) ? response.data : [];
            } else if (Array.isArray(response)) {
              // Fallback para respuesta directa
              colores = response;
            }
            
            return {
              ...product,
              colores: colores
            };
          } catch (error) {
            console.warn(`No se pudieron obtener colores para producto ${product.id}:`, error.message);
            return {
              ...product,
              colores: []
            };
          }
        })
      );

      // Preparar datos para Excel
      const excelData = productsWithColors.map(product => {
        console.log(`Procesando producto ${product.id} con ${product.colores.length} colores:`, product.colores);
        
        // Preparar información de colores
        const coloresInfo = product.colores.map(color => 
          `${color.nombre} (Stock: ${color.stock || 0})`
        ).join('; ');
        
        // Preparar información de imágenes por color
        const imagenesPorColor = product.colores.map(color => {
          const imagenesCount = color.imagenes ? color.imagenes.length : 0;
          return `${color.nombre}: ${imagenesCount} imagen${imagenesCount !== 1 ? 'es' : ''}`;
        }).join('; ');

        return {
          'ID': product.id,
          'Nombre': product.nombre,
          'SKU': product.sku || '',
          'Descripción': product.descripcion || '',
          'Precio': product.precio || 0,
          'Precio de Comparación': product.precio_comparacion || '',
          'Stock Total': product.gestion_stock ? (product.stock_total_calculado || product.stock || 0) : 'Sin gestión',
          'Stock Mínimo': product.stock_minimo || '',
          'Estado': product.estado || '',
          'Categoría': product.categoria?.nombre || '',
          'Tipo': product.tipo || '',
          'Colores Disponibles': coloresInfo || 'Sin colores',
          'Imágenes por Color': imagenesPorColor || 'Sin imágenes',
          'Cantidad de Colores': product.colores.length,
          'Fecha de Creación': product.fecha_creacion ? new Date(product.fecha_creacion).toLocaleDateString('es-ES') : '',
          'Última Actualización': product.fecha_actualizacion ? new Date(product.fecha_actualizacion).toLocaleDateString('es-ES') : '',
          'Peso (g)': product.peso || '',
          'Dimensiones': product.dimensiones || '',
          'Material': product.material || '',
          'Marca': product.marca || '',
          'Modelo': product.modelo || '',
          'Año': product.ano || '',
          'Color': product.color || '',
          'Talla': product.talla || '',
          'Género': product.genero || '',
          'Edad': product.edad || '',
          'Temporada': product.temporada || '',
          'Etiquetas': product.etiquetas || '',
          'Meta Título': product.meta_titulo || '',
          'Meta Descripción': product.meta_descripcion || '',
          'URL': product.url || '',
          'Activo': product.activo ? 'Sí' : 'No',
          'Destacado': product.destacado ? 'Sí' : 'No',
          'Nuevo': product.nuevo ? 'Sí' : 'No',
          'Oferta': product.oferta ? 'Sí' : 'No'
        };
      });

      // Generar nombre del archivo con fecha
      const now = new Date();
      const fileName = `productos_localix_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}.xlsx`;

      // Exportar usando la API de Electron
      const result = await window.electronAPI.exportToExcel({
        data: excelData,
        fileName: fileName,
        sheetName: 'Productos'
      });

      if (result.success) {
        const totalColores = productsWithColors.reduce((total, product) => total + product.colores.length, 0);
        toast.success('Exportación exitosa', `Se exportaron ${allProducts.length} productos con ${totalColores} colores a ${fileName}`);
      } else {
        toast.error('Error en la exportación', result.message || 'No se pudo completar la exportación');
      }
      
    } catch (error) {
      console.error('Error exportando productos:', error);
      toast.error('Error al exportar productos', error.message || 'Ocurrió un error inesperado');
    } finally {
      stopLoading();
    }
  }, [data.products, searchQuery, filters, startLoading, stopLoading, toast]);

  // Ordenar productos
  const sortedProducts = [...data.products].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Componentes renderizados condicionalmente
  const renderLoadingState = () => (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-600"></div>
    </div>
  );

  const renderErrorState = () => (
    <ErrorBoundary 
      error={ui.error} 
      onRetry={() => fetchProducts()} 
      retryLabel="Reintentar"
    />
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="mx-auto h-16 w-16 bg-theme-secondary rounded-full flex items-center justify-center mb-4">
        <Package className="h-8 w-8 text-theme-textSecondary" />
      </div>
      <h3 className="text-lg font-medium text-theme-text mb-2">
        {searchQuery ? 'No se encontraron productos' : 'No hay productos registrados'}
      </h3>
      <p className="text-theme-textSecondary mb-4">
        {searchQuery 
          ? 'Intenta con otros términos de búsqueda.' 
          : 'Comienza agregando tu primer producto para gestionar tu inventario.'
        }
      </p>
      {!searchQuery && (
        <button
          onClick={() => setUi(prev => ({ ...prev, openNewProductDialog: true }))}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
          <span className="font-medium">Agregar Primer Producto</span>
        </button>
      )}
    </div>
  );

  // Componente para renderizar fila de producto
  const renderProductRow = (product, index) => (
    <tr 
      key={product.id} 
      ref={index === sortedProducts.length - 1 ? lastProductElementRef : null}
      className="hover:bg-theme-background border-b border-theme-border">
      {/* Producto: Imagen, nombre y colores */}
      <td className="px-6 py-4 whitespace-nowrap align-middle">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {product.imagen_principal_url ? (
              <img
                className="h-10 w-10 rounded-lg object-cover"
                src={getImageUrl(product.imagen_principal_url)}
                alt={product.nombre}
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpolyline points="21 15 16 10 5 21"%3E%3C/polyline%3E%3C/svg%3E';
                }}
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-theme-border flex items-center justify-center">
                <Package className="h-5 w-5 text-theme-textSecondary" />
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-theme-text">{product.nombre}</div>
            {/* Mostrar colores del producto */}
            <div className="mt-1">
              <ProductColorsDisplay productId={product.id} />
            </div>
          </div>
        </div>
      </td>
      {/* SKU */}
      <td className="px-6 py-4 whitespace-nowrap align-middle">
        <div className="text-sm text-theme-text">{product.sku || '-'}</div>
      </td>
      {/* Precio */}
      <td className="px-6 py-4 whitespace-nowrap align-middle">
        <div className="text-sm text-theme-text">{formatPrice(product.precio)}</div>
        {product.precio_comparacion && (
          <div className="text-sm text-theme-textSecondary line-through">{formatPrice(product.precio_comparacion)}</div>
        )}
      </td>
      {/* Stock */}
      <td className="px-6 py-4 whitespace-nowrap align-middle">
        <div className="text-sm text-theme-text">
          {product.gestion_stock ? (
            <>
              <span className={parseInt(product.stock_total_calculado || product.stock) > 0 ? 'text-green-600' : 'text-red-600'}>
                {parseInt(product.stock_total_calculado || product.stock) || 0}
              </span>
              {product.stock_minimo && (
                <span className="text-theme-textSecondary text-xs ml-1">
                  (mín: {parseInt(product.stock_minimo) || 0})
                </span>
              )}
            </>
          ) : (
            <span className="text-theme-textSecondary">Sin gestión</span>
          )}
        </div>
      </td>
      {/* Estado */}
      <td className="px-6 py-4 whitespace-nowrap align-middle">
        <ProductStatusChip status={product.estado} />
      </td>
      {/* Acciones */}
      <td className="px-6 py-4 whitespace-nowrap text-right align-middle">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => {
              // Validación mejorada del slug
              const isValidSlug = product.slug && 
                product.slug.trim() !== '' && 
                product.slug !== 'producto' && 
                product.slug !== ':1' &&
                !product.slug.includes('undefined') &&
                !product.slug.includes('null');
              
              if (isValidSlug) {
                navigate(`/product/edit/${product.slug}`);
              } else {
                // Log de debugging para identificar el problema
                console.warn('🚨 Producto con slug inválido:', {
                  id: product.id,
                  nombre: product.nombre,
                  slug: product.slug,
                  sku: product.sku
                });
                
                                 // Intento de recuperación usando el ID del producto
                 if (product.id) {
                   toast.showInfo('Intentando recuperar el identificador del producto...');
                   // Recargar el producto específico e intentar la edición
                   retryEditProduct(product.id);
                 } else {
                   toast.error('Identificador inválido', 'Este producto no tiene un identificador válido para editar. Recarga la página e intenta nuevamente.');
                 }
              }
            }}
            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
            title="Editar producto"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => {
              // Validación del slug para eliminación
              const isValidSlug = product.slug && 
                product.slug.trim() !== '' && 
                product.slug !== 'producto' && 
                product.slug !== ':1' &&
                !product.slug.includes('undefined') &&
                !product.slug.includes('null');
              
              if (isValidSlug) {
                handleDeleteProduct(product.slug);
              } else {
                // Log de debugging para identificar el problema
                console.warn('🚨 Producto con slug inválido para eliminación:', {
                  id: product.id,
                  nombre: product.nombre,
                  slug: product.slug,
                  sku: product.sku
                });
                
                // Mostrar error al usuario
                toast.error('Identificador inválido', `No se puede eliminar "${product.nombre}" porque tiene un identificador inválido. Recarga la página e intenta nuevamente.`);
              }
            }}
            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
            title="Eliminar producto"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );

  if (isLoading.initialLoad) return renderLoadingState();
  if (ui.error) return renderErrorState();

  return (
    <div className="min-h-screen bg-theme-background">
      {/* Header con diseño sobrio */}
      <div className="bg-theme-surface border-b border-theme-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-theme-secondary rounded-lg">
                  <Package className="h-6 w-6 text-theme-textSecondary" />
                </div>
                <h1 className="text-2xl font-semibold text-theme-text">
                  Productos
                </h1>
              </div>
              <p className="text-theme-textSecondary">Administra tu catálogo de productos e inventario</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Los botones se movieron a la sección de filtros */}
            </div>
          </div>
        </div>
      </div>



      {/* Estadísticas de productos */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Productos */}
          <div className="bg-theme-surface rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 flex flex-col items-center group cursor-pointer border border-gray-100">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-3 group-hover:scale-105 transition-transform">
              <Package2 className="text-blue-600" size={32} />
            </div>
            <span className="text-xs text-theme-textSecondary font-medium mb-1">Total Productos</span>
            <span className="text-2xl font-bold text-theme-text">{stats.total}</span>
          </div>
          {/* Publicados */}
          <div className="bg-theme-surface rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 flex flex-col items-center group cursor-pointer border border-gray-100">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-3 group-hover:scale-105 transition-transform">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <span className="text-xs text-theme-textSecondary font-medium mb-1">Publicados</span>
            <span className="text-2xl font-bold text-green-700">{stats.publicados}</span>
          </div>
          {/* Agotados */}
          <div className="bg-theme-surface rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 flex flex-col items-center group cursor-pointer border border-gray-100">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mb-3 group-hover:scale-105 transition-transform">
              <X className="text-red-600" size={32} />
            </div>
            <span className="text-xs text-theme-textSecondary font-medium mb-1">Agotados</span>
            <span className="text-2xl font-bold text-red-700">{stats.agotados}</span>
          </div>
          {/* Descontinuados */}
          <div className="bg-theme-surface rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 flex flex-col items-center group cursor-pointer border border-gray-100">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-theme-border mb-3 group-hover:scale-105 transition-transform">
              <Package className="text-theme-textSecondary" size={32} />
            </div>
            <span className="text-xs text-theme-textSecondary font-medium mb-1">Descontinuados</span>
            <span className="text-2xl font-bold text-theme-textSecondary">{stats.descontinuados}</span>
          </div>
        </div>
      </div>

      {/* Búsqueda inteligente con diseño sobrio */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-theme-surface rounded-lg border border-theme-border p-6">
          <SmartProductSearch
            onSearch={handleSmartSearch}
            onFilterChange={handleFilterChange}
            initialFilters={filters}
            suggestions={suggestions}
            showAdvancedFilters={true}
          />
          
          {/* Controles adicionales */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <p className="text-sm text-theme-textSecondary">
                {pagination.totalItems > 0 
                  ? `${pagination.totalItems} producto${pagination.totalItems !== 1 ? 's' : ''} encontrado${pagination.totalItems !== 1 ? 's' : ''}`
                  : 'No se encontraron productos'
                }
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchProducts(pagination.page, searchQuery, filters)}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 bg-theme-secondary text-theme-textSecondary rounded-lg hover:bg-theme-border transition-colors disabled:opacity-50"
                title="Refrescar"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="text-sm">Refrescar</span>
              </button>
              
              <button
                onClick={handleExportToExcel}
                disabled={isLoading || data.products.length === 0}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                title="Exportar a Excel"
              >
                <Download size={16} />
                <span className="text-sm">Exportar Excel</span>
              </button>
              
              <button
                onClick={() => navigate('/product/new')}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                <span className="text-sm">Nuevo Producto</span>
              </button>
              
              <Link
                to="/categories"
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <FolderOpen size={16} />
                <span className="text-sm">Gestionar Categorías</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Productos estandarizada */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <DataTable
          columns={getProductColumns(
            (product) => openDialogFor(product, 'view'),
            (product) => openDialogFor(product, 'edit'),
            (product) => handleDeleteProduct(product.slug)
          )}
          data={sortedProducts}
          sortConfig={sortConfig}
          onSort={requestSort}
          loading={isLoading}
          emptyMessage="No hay productos disponibles"
          size="md"
          striped={true}
          hover={true}
        />
      </div>

      {/* Diálogos */}
      <ErrorBoundary>
        {data.selectedProduct && (
          <ProductDialog
            open={ui.openDialog}
            product={data.selectedProduct}
            mode={ui.dialogMode}
            onClose={() => setUi(prev => ({ ...prev, openDialog: false }))}
            onUpdateSuccess={() => fetchProducts(pagination.page)}
            onDeleteSuccess={() => fetchProducts(pagination.page)}
            compact
          />
        )}
      </ErrorBoundary>

      {/* Modal de Confirmación de Eliminación */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={hideDeleteConfirmation}
        onConfirm={deleteModal.onConfirm}
        title={deleteModal.title}
        message={deleteModal.message}
        itemName={deleteModal.itemName}
        itemType={deleteModal.itemType}
        dangerLevel={deleteModal.dangerLevel}
      />
    </div>
  );
};

export default React.memo(ProductList);