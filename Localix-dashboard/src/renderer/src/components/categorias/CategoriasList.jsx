import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import {
  Search, Plus, RefreshCw, Eye, Edit, Trash2,
  FolderOpen, Filter, ArrowUpDown, ChevronDown, ChevronUp,
  CheckCircle, Edit as EditIcon, AlertTriangle, XCircle, TrendingUp, Folder, Package
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import CategoriaForm from './CategoriaForm';
import { useToast } from '../../hooks/useToast';
import { RESOURCE_URL } from '../../api/apiConfig';

// Función para obtener URL de imagen
function getImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${RESOURCE_URL}${url}`;
}

// Función para truncar texto
function truncateText(text, maxLength = 50) {
  if (!text) return 'Sin descripción';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Componentes UI estandarizados
import DataTable from '../ui/DataTable';
import DraggableDataTable from '../ui/DraggableDataTable';
import ActionButtons from '../ui/ActionButtons';
import { useDeleteConfirmation } from '../../hooks/useDeleteConfirmation';
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';

const CategoriasList = () => {
  const toast = useToast();
  const { deleteModal, hideDeleteConfirmation, confirmDeleteCategory } = useDeleteConfirmation();
  
  // Estados
  const [data, setData] = useState({
    categorias: [],
    selectedCategoria: null
  });
  
  const [loading, setLoading] = useState({ 
    categorias: true, 
    initialLoad: true 
  });
  
  const [ui, setUi] = useState({
    openDialog: false,
    dialogMode: 'view', // 'view' | 'edit'
    openNewCategoriaDialog: false,
    error: null
  });
  

  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'orden', direction: 'asc' });
  const [stats, setStats] = useState({
    total: 0,
    activas: 0,
    inactivas: 0,
    conImagen: 0,
    sinImagen: 0
  });

  const { slug } = useParams();
  const navigate = useNavigate();

  // Fetch de categorías
  const fetchCategorias = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, categorias: true }));
      setUi(prev => ({ ...prev, error: null }));
      
      // Verificar si el usuario está autenticado para usar HTTP directo o IPC
      const token = localStorage.getItem('access_token');
      const isAuthenticated = !!token;
      
      let response;
      if (isAuthenticated) {
        // Usar llamada HTTP directa
        const apiResponse = await api.get('categorias/', { 
          params: { ordering: 'orden,nombre' } 
        });
        response = apiResponse.data.results || apiResponse.data; // Extraer los datos de la respuesta HTTP
      } else {
        // Usar IPC si no está autenticado
        response = await window.electronAPI.categorias.listar();
      }
      const categoriasData = Array.isArray(response) ? response : [];
      
      // Asegurar que cada categoría tenga un id para el drag-and-drop
      const categoriasWithId = categoriasData.map(categoria => ({
        ...categoria,
        id: categoria.id || categoria.slug // Usar id si existe, sino usar slug
      }));
      
      setData({
        categorias: categoriasWithId,
        selectedCategoria: null
      });
      
      // Calcular y actualizar estadísticas
      const newStats = calculateStats(categoriasData);
      setStats(newStats);
      
    } catch (err) {
      console.error('Error fetching categorías:', err);
      setUi(prev => ({ ...prev, error: err.message || 'Error al cargar las categorías' }));
      setData(prev => ({ ...prev, categorias: [] }));
    } finally {
      setLoading(prev => ({ ...prev, categorias: false, initialLoad: false }));
    }
  }, []);

  // Efecto para cargar categorías
  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);



  // Handlers optimizados
  const openDialogFor = useCallback(async (categoria, mode='view') => {
    try {
      setData(prev => ({ ...prev, selectedCategoria: categoria }));
      setUi(prev => ({ ...prev, openDialog: true, dialogMode: mode }));
    } catch (error) {
      console.error('Error opening categoria dialog:', error);
    }
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchCategorias();
  }, [fetchCategorias]);

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

  // Calcular estadísticas de categorías
  const calculateStats = useCallback((categorias) => {
    const stats = {
      total: categorias.length,
      activas: 0,
      inactivas: 0,
      conImagen: 0,
      sinImagen: 0
    };
    categorias.forEach(categoria => {
      if (categoria.activa) {
        stats.activas++;
      } else {
        stats.inactivas++;
      }
      if (categoria.imagen_url) {
        stats.conImagen++;
    } else {
        stats.sinImagen++;
      }
    });
    return stats;
  }, []);

  // Ordenar categorías
  const sortedCategorias = [...data.categorias].sort((a, b) => {
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

  // Filtrar por búsqueda
  const filteredCategorias = sortedCategorias.filter(categoria =>
    categoria.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (categoria.descripcion && categoria.descripcion.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handlers para CRUD
  const handleCreateSuccess = () => {
    fetchCategorias();
    setUi(prev => ({ ...prev, openDialog: false }));
    toast.showCategorySaved(true);
  };

  const handleUpdateSuccess = () => {
    fetchCategorias();
    setUi(prev => ({ ...prev, openDialog: false }));
    toast.showCategorySaved(false);
  };

  const handleDelete = async (slug, categoryName) => {
    const success = await confirmDeleteCategory(
      async () => {
        // Verificar si el usuario está autenticado para usar HTTP directo o IPC
        const token = localStorage.getItem('access_token');
        const isAuthenticated = !!token;
        
        if (isAuthenticated) {
          // Usar llamada HTTP directa
          await api.delete(`categorias/${slug}/`);
        } else {
          // Usar IPC si no está autenticado
          await window.electronAPI.categorias.eliminar(slug);
        }
        fetchCategorias();
      },
      categoryName
    );
    
    if (!success) {
      setUi(prev => ({ ...prev, error: 'Error al eliminar la categoría' }));
    }
  };

  // Función para manejar el reordenamiento de categorías
  const handleReorder = useCallback(async (reorderedItems) => {
    // Actualizar el estado local inmediatamente para una mejor UX
    setData(prev => ({ ...prev, categorias: reorderedItems }));
    
    // Preparar los IDs de las categorías en el nuevo orden
    const categoriaIds = reorderedItems.map(categoria => categoria.id);
    
    try {
      // Verificar si tenemos acceso a electronAPI (modo Electron)
      if (window.electronAPI && window.electronAPI.categorias) {
        // Usar IPC de Electron
        const result = await window.electronAPI.categorias.reordenar({
          categoriaIds: categoriaIds
        });
        console.log('Reordenamiento IPC exitoso:', result);
      } else {
        // Verificar autenticación para HTTP
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No hay token de autenticación disponible');
        }
        
        // Usar llamada HTTP directa para reordenar
        const response = await api.post('categorias/reorder/', {
          categoriaIds: categoriaIds
        });
        console.log('Reordenamiento HTTP exitoso:', response.data);
      }
      
      // Actualizar la tabla después del éxito
      await fetchCategorias();
      
    } catch (error) {
      console.error('Error al reordenar categorías:', error);
      
      // Manejar error 401 (token expirado)
      if (error.response && error.response.status === 401) {
        console.log('Token expirado, redirigiendo al login...');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return;
      }
      
      // Revertir cambios locales en caso de error
      await fetchCategorias();
      toast.error('Error al reordenar las categorías');
    }
  }, [fetchCategorias, toast]);





  // Configuración de columnas para la tabla estandarizada
  const getCategoriaColumns = (onView, onEdit, onDelete) => [
    {
      key: 'nombre',
      label: 'Categoría',
      sortable: true,
      render: (categoria) => (
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:bg-blue-50 p-2 rounded-lg transition-colors"
          onClick={() => navigate(`/categoria/${categoria.slug}`)}
          title="Hacer clic para ver productos de esta categoría"
        >
          <div className="flex-shrink-0 w-8 h-8">
            {categoria.imagen ? (
              <img
                src={getImageUrl(categoria.imagen)}
                alt={categoria.nombre}
                className="w-8 h-8 rounded-lg object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center ${categoria.imagen ? 'hidden' : ''}`}>
              <Folder className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-700 hover:text-blue-900 truncate">
              {categoria.nombre}
            </p>
            <p className="text-xs text-theme-textSecondary" title={categoria.descripcion}>
              {truncateText(categoria.descripcion, 40)}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'cantidad_productos',
      label: 'Productos',
      sortable: true,
      render: (categoria) => (
        <span 
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors"
          onClick={() => navigate(`/categoria/${categoria.slug}`)}
          title="Ver productos"
        >
          {categoria.cantidad_productos || 0}
        </span>
      )
    },
    {
      key: 'stock_total_categoria',
      label: 'Stock Total',
      sortable: true,
      render: (categoria) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          (categoria.stock_total_categoria || 0) > 0 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {categoria.stock_total_categoria || 0}
        </span>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      sortable: false,
      render: (categoria) => (
        <ActionButtons
          onView={() => openDialogFor(categoria, 'view')}
          onEdit={() => openDialogFor(categoria, 'edit')}
          onDelete={() => handleDelete(categoria.slug, categoria.nombre)}
          size="sm"
          variant="compact"
        />
      )
    }
  ];

  // Componentes renderizados condicionalmente
  const renderLoadingState = () => (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-600"></div>
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center py-12">
      <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-theme-text mb-2">
        Error al cargar categorías
      </h3>
      <p className="text-theme-textSecondary mb-4">{ui.error}</p>
      <button
        onClick={handleRefresh}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        <RefreshCw size={16} />
        <span className="font-medium">Reintentar</span>
      </button>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="mx-auto h-16 w-16 bg-theme-secondary rounded-full flex items-center justify-center mb-4">
        <Folder className="h-8 w-8 text-theme-textSecondary" />
      </div>
      <h3 className="text-lg font-medium text-theme-text mb-2">
        {searchQuery ? 'No se encontraron categorías' : 'No hay categorías registradas'}
      </h3>
      <p className="text-theme-textSecondary mb-4">
        {searchQuery 
          ? 'Intenta con otros términos de búsqueda.' 
          : 'Comienza agregando tu primera categoría para organizar tus productos.'
        }
      </p>
      {!searchQuery && (
        <button
          onClick={() => {
            setData(prev => ({ ...prev, selectedCategoria: null }));
            setUi(prev => ({ ...prev, openDialog: true, dialogMode: 'edit' }));
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
          <span className="font-medium">Agregar Primera Categoría</span>
        </button>
      )}
    </div>
  );

  const renderCategoriaRow = (categoria) => (
    <tr key={categoria.slug} className="hover:bg-theme-background transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {categoria.imagen_url ? (
              <img
                src={categoria.imagen_url}
                alt={categoria.nombre}
                className="h-10 w-10 rounded-lg object-cover border border-theme-border"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`h-10 w-10 bg-theme-secondary rounded-lg border border-theme-border flex items-center justify-center ${categoria.imagen_url ? 'hidden' : ''}`}>
              <Folder size={18} className="text-theme-textSecondary" />
            </div>
          </div>
          <div className="ml-3">
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-medium text-blue-700 hover:underline cursor-pointer"
                onClick={() => navigate(`/categoria/${categoria.slug}`)}
              >
                {categoria.nombre}
              </span>
            </div>
            <div className="text-xs text-theme-textSecondary mt-1">
              {categoria.descripcion || 'Sin descripción'}
            </div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-mono text-theme-text">{categoria.slug}</div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="text-sm text-theme-text">{categoria.orden}</div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          (categoria.stock_total_categoria || 0) > 0 
                            ? 'bg-blue-100 text-blue-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {categoria.stock_total_categoria || 0}
        </span>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={() => openDialogFor(categoria, 'view')}
            className="flex items-center gap-1 px-2 py-1 bg-theme-secondary text-theme-textSecondary rounded hover:bg-theme-border transition-colors"
            title="Ver detalles"
          >
            <Eye size={14} />
            <span className="text-xs">Ver</span>
          </button>
          <button
            onClick={() => openDialogFor(categoria, 'edit')}
            className="flex items-center gap-1 px-2 py-1 bg-theme-secondary text-theme-textSecondary rounded hover:bg-theme-border transition-colors"
            title="Editar categoría"
          >
            <Edit size={14} />
            <span className="text-xs">Editar</span>
          </button>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              await handleDelete(categoria.slug, categoria.nombre);
            }}
            className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            title="Eliminar categoría"
          >
            <Trash2 size={14} />
            <span className="text-xs">Eliminar</span>
          </button>
        </div>
      </td>
    </tr>
  );

  if (loading.initialLoad) return renderLoadingState();
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
                  <Folder className="h-6 w-6 text-theme-textSecondary" />
                </div>
                <h1 className="text-2xl font-semibold text-theme-text">
                  Categorías
                </h1>
              </div>
              <p className="text-theme-textSecondary">Administra las categorías de tu tienda</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Los botones se movieron a la sección de filtros */}
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas de categorías */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Categorías */}
          <div className="bg-theme-surface rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 flex flex-col items-center group cursor-pointer border border-gray-100">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-3 group-hover:scale-105 transition-transform">
              <FolderOpen className="text-blue-600" size={32} />
            </div>
            <span className="text-xs text-theme-textSecondary font-medium mb-1">Total Categorías</span>
            <span className="text-2xl font-bold text-theme-text">{stats.total}</span>
          </div>
          {/* Activas */}
          <div className="bg-theme-surface rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 flex flex-col items-center group cursor-pointer border border-gray-100">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-3 group-hover:scale-105 transition-transform">
              <CheckCircle className="text-blue-600" size={32} />
            </div>
            <span className="text-xs text-theme-textSecondary font-medium mb-1">Activas</span>
            <span className="text-2xl font-bold text-blue-700">{stats.activas}</span>
          </div>
          {/* Inactivas */}
          <div className="bg-theme-surface rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 flex flex-col items-center group cursor-pointer border border-gray-100">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mb-3 group-hover:scale-105 transition-transform">
              <XCircle className="text-red-600" size={32} />
            </div>
            <span className="text-xs text-theme-textSecondary font-medium mb-1">Inactivas</span>
            <span className="text-2xl font-bold text-red-700">{stats.inactivas}</span>
          </div>
          {/* Con Imagen */}
          <div className="bg-theme-surface rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 flex flex-col items-center group cursor-pointer border border-gray-100">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-yellow-100 mb-3 group-hover:scale-105 transition-transform">
              <Folder className="text-yellow-600" size={32} />
            </div>
            <span className="text-xs text-theme-textSecondary font-medium mb-1">Con Imagen</span>
            <span className="text-2xl font-bold text-yellow-700">{stats.conImagen}</span>
          </div>
        </div>
      </div>

      {/* Filtros con diseño sobrio */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-theme-surface rounded-lg border border-theme-border p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-theme-textSecondary" />
              <input
                type="text"
                placeholder="Buscar categorías por nombre o descripción..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full bg-theme-background text-theme-text placeholder-theme-textSecondary"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading.categorias}
                className="flex items-center gap-2 px-3 py-2 bg-theme-secondary text-theme-textSecondary rounded-lg hover:bg-theme-border transition-colors disabled:opacity-50"
                title="Refrescar"
              >
                <RefreshCw className={`w-4 h-4 ${loading.categorias ? 'animate-spin' : ''}`} />
                <span className="text-sm">Refrescar</span>
              </button>
              
              <button
                onClick={() => {
                  setData(prev => ({ ...prev, selectedCategoria: null }));
                  setUi(prev => ({ ...prev, openDialog: true, dialogMode: 'edit' }));
                }}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                <span className="text-sm">Nueva Categoría</span>
              </button>
            </div>
          </div>
          
          {/* Controles adicionales */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <p className="text-sm text-theme-textSecondary">
                {filteredCategorias && Array.isArray(filteredCategorias) && filteredCategorias.length > 0 
                  ? `${filteredCategorias.length} categoría${filteredCategorias.length !== 1 ? 's' : ''} encontrada${filteredCategorias.length !== 1 ? 's' : ''}`
                  : 'No se encontraron categorías'
                }
              </p>
            </div>
            

          </div>
        </div>
      </div>

      {/* Tabla de Categorías */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <DraggableDataTable
          columns={getCategoriaColumns(openDialogFor, openDialogFor, handleDelete)}
          data={filteredCategorias}
          sortConfig={sortConfig}
          onSort={requestSort}
          onReorder={handleReorder}
          loading={loading.categorias}
          emptyMessage="No hay categorías disponibles"
          size="md"
          striped={true}
          hover={true}
          dragDisabled={false}
        />
      </div>

      {/* Formulario de Categoría en Modal */}
      {ui.openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-theme-surface rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-theme-border">
              <h3 className="text-lg font-semibold text-theme-text">
                {data.selectedCategoria
                  ? (ui.dialogMode === 'edit' ? 'Editar Categoría' : 'Detalles de la Categoría')
                  : 'Nueva Categoría'}
              </h3>
              <button
                onClick={() => setUi(prev => ({ ...prev, openDialog: false }))}
                className="text-theme-textSecondary hover:text-theme-textSecondary p-1"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <CategoriaForm
                open={ui.openDialog}
                categoria={data.selectedCategoria}
                onClose={() => setUi(prev => ({ ...prev, openDialog: false }))}
                onCreateSuccess={handleCreateSuccess}
                onUpdateSuccess={handleUpdateSuccess}
              />
            </div>
          </div>
        </div>
      )}

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

export default CategoriasList;