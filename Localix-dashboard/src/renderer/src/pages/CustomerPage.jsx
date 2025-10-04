// src/pages/CustomersPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Download, Plus,
  ChevronDown, ChevronUp, ArrowUpDown,
  User, Mail, Phone, ShoppingBag, Calendar,
  Edit, Trash2, DollarSign, Package, RefreshCw
} from 'lucide-react';
import CustomerModal from '../components/CustomerModal';
import { toast } from 'react-toastify';
import { useDeleteConfirmation } from '../hooks/useDeleteConfirmation';
import DeleteConfirmationModal from '../components/ui/DeleteConfirmationModal';
import { useSettings } from '../context/SettingsContext';

const CustomersPage = () => {
  // Estados para el dashboard
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'asc' });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarVentasModal, setMostrarVentasModal] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState('todos'); // 'todos', 'activos', 'inactivos'
  const [eliminandoCliente, setEliminandoCliente] = useState(null); // ID del cliente que se está eliminando
  const [clienteParaEditar, setClienteParaEditar] = useState(null); // Cliente seleccionado para editar
  const [ventasClienteSeleccionado, setVentasClienteSeleccionado] = useState([]);

  // Hook para configuración
  const { settings } = useSettings();
  const customerColors = settings.customerColors;

  // Hook para confirmación de eliminación
  const { deleteModal, hideDeleteConfirmation, confirmDeleteClient } = useDeleteConfirmation();

  // Función para generar estilos dinámicos basados en la configuración
  const getCustomerStyles = (isActive) => {
    if (isActive) {
      return {
        iconBg: { backgroundColor: customerColors.activeBg },
        iconColor: { color: customerColors.activeIcon },
        badgeBg: { backgroundColor: customerColors.activeBadgeBg },
        badgeText: { color: customerColors.activeBadgeText }
      };
    } else {
      return {
        iconBg: { backgroundColor: customerColors.inactiveBg },
        iconColor: { color: customerColors.inactiveIcon },
        badgeBg: { backgroundColor: customerColors.inactiveBg },
        badgeText: { color: customerColors.inactiveText }
      };
    }
  };

  // Cargar datos
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      console.log('🔄 [CUSTOMER PAGE] Iniciando carga de datos...');
      
      // Verificar que las APIs estén disponibles
      if (!window.clientesAPI || !window.ventasAPI) {
        console.error('❌ [CUSTOMER PAGE] APIs no disponibles:', {
          clientesAPI: !!window.clientesAPI,
          ventasAPI: !!window.ventasAPI
        });
        toast.error('Error: APIs no disponibles. Verifica la conexión.');
        return;
      }

      const [clientesRes, ventasRes] = await Promise.all([
        window.clientesAPI.obtenerTodos(),
        window.ventasAPI.obtenerVentas()
      ]);
      
      console.log('📊 [CUSTOMER PAGE] Respuesta clientes:', clientesRes);
      console.log('📊 [CUSTOMER PAGE] Respuesta ventas:', ventasRes);
      
      if (clientesRes.success) {
        // Verificar si data es un array o tiene la estructura de paginación
        let clientesData = [];
        if (Array.isArray(clientesRes.data)) {
          clientesData = clientesRes.data;
        } else if (clientesRes.data && Array.isArray(clientesRes.data.results)) {
          clientesData = clientesRes.data.results;
        } else if (clientesRes.data && typeof clientesRes.data === 'object') {
          // Si es un objeto con count y results
          clientesData = clientesRes.data.results || [];
        }
        setClientes(clientesData);
        console.log('✅ [CUSTOMER PAGE] Clientes cargados:', clientesData.length);
        
        if (isRefresh) {
          toast.success(`Datos actualizados. ${clientesData.length} clientes cargados.`);
        }
      } else {
        console.error('❌ [CUSTOMER PAGE] Error cargando clientes:', clientesRes.error);
        setClientes([]);
        toast.error(`Error al cargar clientes: ${clientesRes.error}`);
      }
      
      if (ventasRes.success) {
        // Verificar si data es un array o tiene la estructura de paginación
        let ventasData = [];
        if (Array.isArray(ventasRes.data)) {
          ventasData = ventasRes.data;
        } else if (ventasRes.data && Array.isArray(ventasRes.data.results)) {
          ventasData = ventasRes.data.results;
        } else if (ventasRes.data && typeof ventasRes.data === 'object') {
          // Si es un objeto con count y results
          ventasData = ventasRes.data.results || [];
        }
        setVentas(ventasData);
        console.log('✅ [CUSTOMER PAGE] Ventas cargadas:', ventasData.length);
      } else {
        console.error('❌ [CUSTOMER PAGE] Error cargando ventas:', ventasRes.error);
        setVentas([]);
        toast.error(`Error al cargar ventas: ${ventasRes.error}`);
      }
    } catch (error) {
      console.error('❌ [CUSTOMER PAGE] Error cargando datos:', error);
      setClientes([]);
      setVentas([]);
      toast.error(`Error de conexión: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Función para recargar datos
  const handleRefresh = () => {
    cargarDatos(true);
  };

  // Función para obtener ventas de un cliente
  const obtenerVentasCliente = (clienteId) => {
    if (!Array.isArray(ventas)) return [];
    return ventas.filter(venta => venta.cliente?.id === clienteId);
  };

  // Función para calcular total gastado por cliente
  const calcularTotalGastado = (clienteId) => {
    const ventasCliente = obtenerVentasCliente(clienteId);
    return ventasCliente.reduce((total, venta) => total + parseFloat(venta.total || 0), 0);
  };

  // Función para ordenar clientes
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

  // Filtrar y ordenar clientes
  const filteredClientes = Array.isArray(clientes) ? clientes
    .filter(cliente => {
      // Filtro por búsqueda
      const cumpleBusqueda = cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.telefono && cliente.telefono.includes(searchTerm));
      
      // Filtro por estado activo
      let cumpleFiltroActivo = true;
      if (filtroActivo === 'activos') {
        cumpleFiltroActivo = cliente.activo === true;
      } else if (filtroActivo === 'inactivos') {
        cumpleFiltroActivo = cliente.activo === false;
      }
      
      return cumpleBusqueda && cumpleFiltroActivo;
    })
    .sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Para campos numéricos como total_gastado
      if (sortConfig.key === 'total_gastado') {
        aValue = calcularTotalGastado(a.id);
        bValue = calcularTotalGastado(b.id);
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    }) : [];

  // Estadísticas de clientes
  const stats = {
    totalClientes: Array.isArray(clientes) ? clientes.length : 0,
    clientesActivos: Array.isArray(clientes) ? clientes.filter(c => c.activo === true).length : 0,
    clientesInactivos: Array.isArray(clientes) ? clientes.filter(c => c.activo === false).length : 0,
    clientesConVentas: Array.isArray(clientes) ? clientes.filter(c => obtenerVentasCliente(c.id).length > 0).length : 0,
    totalVentas: Array.isArray(ventas) ? ventas.length : 0,
    totalIngresos: Array.isArray(ventas) ? ventas.reduce((sum, venta) => sum + parseFloat(venta.total || 0), 0) : 0
  };

  // Ver ventas de cliente
  const verVentasCliente = async (cliente) => {
    setClienteSeleccionado(cliente);
    setMostrarVentasModal(true);
    
    try {
      const response = await window.clientesAPI.obtenerConVentas(cliente.id);
      
      if (response.success) {
        // Actualizar las ventas con la información detallada
        if (response.data && response.data.ventas) {
          setVentasClienteSeleccionado(response.data.ventas || []);
          // Actualizar las ventas existentes con la información detallada
          setVentas(prevVentas => {
            const ventasActualizadas = [...prevVentas];
            response.data.ventas.forEach(ventaDetallada => {
              const index = ventasActualizadas.findIndex(v => v.id === ventaDetallada.id);
              if (index !== -1) {
                ventasActualizadas[index] = {
                  ...ventasActualizadas[index],
                  ...ventaDetallada
                };
              }
            });
            return ventasActualizadas;
          });
        } else {
          setVentasClienteSeleccionado([]);
        }
      } else {
        console.error('Error obteniendo ventas del cliente:', response.error);
      }
    } catch (error) {
      console.error('Error obteniendo ventas del cliente:', error);
    }
  };

  // Editar cliente
  const editarCliente = (cliente) => {
    setClienteParaEditar(cliente);
  };

  // Manejar guardado de cliente (creación o edición)
  const handleGuardarCliente = (clienteGuardado) => {
    if (clienteParaEditar) {
      // Actualizar cliente existente
      setClientes(prevClientes => 
        prevClientes.map(c => 
          c.id === clienteGuardado.id ? clienteGuardado : c
        )
      );
      setClienteParaEditar(null);
    } else {
      // Agregar nuevo cliente
      setClientes(prevClientes => [clienteGuardado, ...prevClientes]);
    }
    
    // Cerrar el modal después de guardar exitosamente
    setIsModalOpen(false);
  };

  // Eliminar cliente
  const eliminarCliente = async (cliente) => {
    // Verificar si el cliente tiene ventas
    const ventasCliente = obtenerVentasCliente(cliente.id);
    const mensaje = ventasCliente.length > 0 
      ? `El cliente "${cliente.nombre}" tiene ${ventasCliente.length} ventas registradas. Esta acción eliminará el cliente y no se puede deshacer.`
      : `Esta acción eliminará el cliente "${cliente.nombre}" y no se puede deshacer.`;
    
    const success = await confirmDeleteClient(
      async () => {
        setEliminandoCliente(cliente.id);
        console.log('Intentando eliminar cliente:', cliente.id, cliente.nombre);
        const response = await window.clientesAPI.eliminar(cliente.id);
        console.log('Respuesta del servidor:', response);
        
        if (response.success) {
          // Remover el cliente de la lista
          setClientes(prevClientes => prevClientes.filter(c => c.id !== cliente.id));
          console.log('Cliente eliminado exitosamente');
          
          // Mostrar mensaje de éxito
          toast.success(`Cliente "${cliente.nombre}" eliminado exitosamente`);
        } else {
          console.error('Error eliminando cliente:', response.error);
          toast.error(`Error al eliminar el cliente: ${response.error}`);
          throw new Error(response.error);
        }
      },
      cliente.nombre
    );
    
    if (!success) {
      setEliminandoCliente(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-background">
      {/* Header con diseño sobrio */}
      <div className="bg-theme-surface border-b border-theme-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-theme-secondary rounded-lg">
                  <User className="h-6 w-6 text-theme-textSecondary" />
                </div>
                <h1 className="text-2xl font-semibold text-theme-text">
                  Gestión de Clientes
                </h1>
              </div>
              <p className="text-theme-textSecondary">Administra la información de tus clientes y sus historiales de compras</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Los botones se movieron a la sección de filtros */}
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas de clientes mejoradas */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Clientes */}
          <div className="bg-theme-surface rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 flex flex-col items-center group cursor-pointer border border-gray-100">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-3 group-hover:scale-105 transition-transform">
              <User size={32} className="text-blue-600" />
            </div>
            <span className="text-xs text-theme-textSecondary font-medium mb-1">Total Clientes</span>
            <span className="text-2xl font-bold text-theme-text">{stats.totalClientes}</span>
          </div>
          {/* Clientes Activos */}
          <div className="bg-theme-surface rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 flex flex-col items-center group cursor-pointer border border-gray-100">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-3 group-hover:scale-105 transition-transform">
              <User size={32} className="text-blue-600" />
            </div>
            <span className="text-xs text-theme-textSecondary font-medium mb-1">Clientes Activos</span>
            <span className="text-2xl font-bold text-blue-700">{stats.clientesActivos}</span>
          </div>
          {/* Clientes Inactivos */}
          <div className="bg-theme-surface rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 flex flex-col items-center group cursor-pointer border border-gray-100">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-theme-border mb-3 group-hover:scale-105 transition-transform">
              <User size={32} className="text-theme-textSecondary" />
            </div>
            <span className="text-xs text-theme-textSecondary font-medium mb-1">Clientes Inactivos</span>
            <span className="text-2xl font-bold text-theme-textSecondary">{stats.clientesInactivos}</span>
          </div>
          {/* Con Compras */}
          <div className="bg-theme-surface rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 flex flex-col items-center group cursor-pointer border border-gray-100">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-purple-100 mb-3 group-hover:scale-105 transition-transform">
              <ShoppingBag size={32} className="text-purple-600" />
            </div>
            <span className="text-xs text-theme-textSecondary font-medium mb-1">Con Compras</span>
            <span className="text-2xl font-bold text-purple-700">{stats.clientesConVentas}</span>
          </div>
        </div>
      </div>

      {/* Filtros con diseño sobrio */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <div className="bg-theme-surface rounded-lg border border-theme-border p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-theme-textSecondary" />
              <input
                type="text"
                placeholder="Buscar clientes por nombre, email o teléfono..."
                className="pl-10 pr-4 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full bg-theme-background text-theme-text placeholder-theme-textSecondary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-theme-textSecondary whitespace-nowrap">Filtrar por estado:</span>
              <select
                value={filtroActivo}
                onChange={(e) => setFiltroActivo(e.target.value)}
                className="px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-theme-background text-theme-text"
              >
                <option value="todos">Todos los clientes</option>
                <option value="activos">Solo activos</option>
                <option value="inactivos">Solo inactivos</option>
              </select>
              
              <button
                onClick={handleRefresh}
                disabled={loading || refreshing}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  refreshing 
                    ? 'bg-theme-secondary text-theme-textSecondary cursor-not-allowed' 
                    : 'bg-theme-secondary text-theme-text hover:bg-theme-border'
                }`}
                title="Recargar datos"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                <span className="text-sm">{refreshing ? 'Recargando...' : 'Recargar'}</span>
              </button>
              
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                <span className="text-sm">Nuevo Cliente</span>
              </button>
            </div>
          </div>
          
          {/* Controles adicionales */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <p className="text-sm text-theme-textSecondary">
                {filteredClientes && Array.isArray(filteredClientes) && filteredClientes.length > 0 
                  ? `${filteredClientes.length} cliente${filteredClientes.length !== 1 ? 's' : ''} encontrado${filteredClientes.length !== 1 ? 's' : ''}`
                  : 'No se encontraron clientes'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Clientes con diseño sobrio */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <div className="bg-theme-surface rounded-lg border border-theme-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-theme-background">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider cursor-pointer hover:bg-theme-secondary transition-colors"
                      onClick={() => requestSort('nombre')}>
                    <div className="flex items-center">
                      Cliente
                      {getSortIcon('nombre')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider cursor-pointer hover:bg-theme-secondary transition-colors"
                      onClick={() => requestSort('ventas_count')}>
                    <div className="flex items-center">
                      Ventas
                      {getSortIcon('ventas_count')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-theme-surface divide-y divide-theme-border">
                {filteredClientes.map((cliente) => {
                  const ventasCliente = obtenerVentasCliente(cliente.id);
                  
                  const styles = getCustomerStyles(cliente.activo);
                  
                  return (
                    <tr key={cliente.id} className="hover:bg-theme-background transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div 
                              className="h-10 w-10 rounded-full flex items-center justify-center"
                              style={styles.iconBg}
                            >
                              <User 
                                className="h-5 w-5" 
                                style={styles.iconColor}
                              />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-theme-text">{cliente.nombre}</span>
                              <span 
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                style={{ backgroundColor: styles.badgeBg.backgroundColor, color: styles.badgeText.color }}
                              >
                                {cliente.activo ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>
                            {cliente.tipo_documento && cliente.numero_documento && (
                              <div className="text-xs text-theme-textSecondary mt-1">
                                {cliente.tipo_documento.toUpperCase()}: {cliente.numero_documento}
                              </div>
                            )}
                            <div className="text-xs text-theme-textSecondary mt-1">
                              Registrado: {new Date(cliente.fecha_registro).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-theme-text">{cliente.email}</div>
                        {cliente.telefono && (
                          <div className="text-sm text-theme-textSecondary mt-1">{cliente.telefono}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-semibold text-theme-text">{ventasCliente.length}</div>
                        <div className="text-xs text-theme-textSecondary">compras realizadas</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">

                          <button
                            onClick={() => editarCliente(cliente)}
                            className="flex items-center gap-1 px-2 py-1 bg-theme-secondary text-theme-textSecondary rounded hover:bg-theme-border transition-colors"
                            title="Editar cliente"
                          >
                            <Edit size={14} />
                            <span className="text-xs">Editar</span>
                          </button>
                          <button
                            onClick={() => eliminarCliente(cliente)}
                            disabled={eliminandoCliente === cliente.id}
                            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                              eliminandoCliente === cliente.id
                                ? 'bg-theme-secondary text-theme-textSecondary cursor-not-allowed'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                            title="Eliminar cliente"
                          >
                            {eliminandoCliente === cliente.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-theme-border"></div>
                            ) : (
                              <Trash2 size={14} />
                            )}
                            <span className="text-xs">
                              {eliminandoCliente === cliente.id ? 'Eliminando...' : 'Eliminar'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredClientes.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 bg-theme-secondary rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-theme-textSecondary" />
              </div>
              <h3 className="text-lg font-medium text-theme-text mb-2">
                {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
              </h3>
              <p className="text-theme-textSecondary mb-4">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda.' 
                  : 'Comienza agregando tu primer cliente para gestionar tus ventas.'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Plus size={16} />
                  <span className="font-medium">Agregar Primer Cliente</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cliente */}
      {(isModalOpen || clienteParaEditar) && (
        <CustomerModal
          isOpen={isModalOpen || !!clienteParaEditar}
          onClose={() => {
            setIsModalOpen(false);
            setClienteParaEditar(null);
          }}
          onSave={handleGuardarCliente}
          customer={clienteParaEditar}
        />
      )}

      {/* Modal de Ventas del Cliente */}
      {mostrarVentasModal && clienteSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-theme-surface rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-theme-surface border-b border-theme-border">
              <div className="flex items-center justify-between p-6">
                <div>
                  <h3 className="text-xl font-semibold text-theme-text mb-2">
                    Historial de Compras
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-base font-medium text-theme-text">{clienteSeleccionado.nombre}</span>
                    </div>
                    <span className="text-theme-textSecondary">•</span>
                    <span className="text-theme-textSecondary">{clienteSeleccionado.email}</span>
                    {clienteSeleccionado.telefono && (
                      <>
                        <span className="text-theme-textSecondary">•</span>
                        <span className="text-theme-textSecondary">{clienteSeleccionado.telefono}</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => { setMostrarVentasModal(false); setVentasClienteSeleccionado([]); }}
                  className="p-2 hover:bg-theme-secondary rounded-lg transition-colors"
                >
                  <svg className="h-5 w-5 text-theme-textSecondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {((Array.isArray(ventasClienteSeleccionado) && ventasClienteSeleccionado.length > 0) || obtenerVentasCliente(clienteSeleccionado.id).length > 0) ? (
                <div className="space-y-6">
                  {/* Resumen del cliente */}
                  <div className="bg-theme-background rounded-lg p-6 border border-theme-border">
                    <h4 className="text-base font-semibold text-theme-text mb-4">Resumen del Cliente</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <ShoppingBag className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-xs text-theme-textSecondary mb-1">Total de Compras</p>
                        <p className="text-xl font-semibold text-theme-text">
                          {obtenerVentasCliente(clienteSeleccionado.id).length}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="text-xs text-theme-textSecondary mb-1">Total Gastado</p>
                        <p className="text-xl font-semibold text-theme-text">
                          $ {(calcularTotalGastado(clienteSeleccionado.id) / 100).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Calendar className="h-6 w-6 text-purple-600" />
                        </div>
                        <p className="text-xs text-theme-textSecondary mb-1">Promedio por Compra</p>
                        <p className="text-xl font-semibold text-theme-text">
                          $ {obtenerVentasCliente(clienteSeleccionado.id).length > 0 
                            ? ((calcularTotalGastado(clienteSeleccionado.id) / 100) / obtenerVentasCliente(clienteSeleccionado.id).length).toFixed(2)
                            : '0.00'}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-theme-secondary rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Calendar className="h-6 w-6 text-theme-textSecondary" />
                        </div>
                        <p className="text-xs text-theme-textSecondary mb-1">Última Compra</p>
                        <p className="text-sm font-medium text-theme-text">
                          {(Array.isArray(ventasClienteSeleccionado) && ventasClienteSeleccionado.length > 0)
                            ? new Date(ventasClienteSeleccionado[0].fecha_venta).toLocaleDateString('es-ES')
                            : (obtenerVentasCliente(clienteSeleccionado.id).length > 0
                                ? new Date(obtenerVentasCliente(clienteSeleccionado.id)[0].fecha_venta).toLocaleDateString('es-ES')
                                : 'N/A') }
                        </p>
                      </div>
                    </div>
                    
                    {/* Productos más comprados */}
                    {(() => {
                      const ventasCliente = (Array.isArray(ventasClienteSeleccionado) && ventasClienteSeleccionado.length > 0)
                        ? ventasClienteSeleccionado
                        : obtenerVentasCliente(clienteSeleccionado.id);
                      const productosComprados = {};
                      
                      ventasCliente.forEach(venta => {
                        venta.items?.forEach(item => {
                          const key = item.producto_id;
                          if (!productosComprados[key]) {
                            productosComprados[key] = {
                              ...item,
                              total_cantidad: 0
                            };
                          }
                          productosComprados[key].total_cantidad += item.cantidad;
                        });
                      });
                      
                      const productosUnicos = Object.values(productosComprados).slice(0, 6);
                      
                      if (productosUnicos.length > 0) {
                        return (
                          <div className="border-t border-theme-border pt-4">
                            <h5 className="text-sm font-medium text-theme-text mb-3">Productos Comprados</h5>
                            <div className="flex flex-wrap gap-2">
                              {productosUnicos.map((producto, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-theme-surface rounded-lg border border-theme-border">
                                  {producto.producto_imagen_url ? (
                                    <img
                                      src={producto.producto_imagen_url}
                                      alt={producto.producto_nombre}
                                      className="w-8 h-8 rounded object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div className={`w-8 h-8 bg-theme-secondary rounded flex items-center justify-center ${producto.producto_imagen_url ? 'hidden' : ''}`}>
                                    <Package size={12} className="text-theme-textSecondary" />
                                  </div>
                                  <div className="text-xs">
                                    <div className="font-medium text-theme-text truncate max-w-20">
                                      {producto.producto_nombre}
                                    </div>
                                    <div className="text-theme-textSecondary">
                                      {producto.total_cantidad} unidades
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {/* Lista de ventas */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-theme-text">Detalle de Compras</h4>
                    <div className="space-y-3">
                      {(Array.isArray(ventasClienteSeleccionado) && ventasClienteSeleccionado.length > 0 ? ventasClienteSeleccionado : obtenerVentasCliente(clienteSeleccionado.id)).map((venta) => (
                        <div key={venta.id} className="bg-theme-surface border border-theme-border rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="text-base font-semibold text-theme-text">
                                  Venta #{venta.numero_venta}
                                </h5>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  venta.estado === 'completada' 
                                    ? 'bg-blue-100 text-blue-800'
                                    : venta.estado === 'pendiente'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {venta.estado}
                                </span>
                              </div>
                              <p className="text-sm text-theme-textSecondary">
                                {new Date(venta.fecha_venta).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              <p className="text-xs text-theme-textSecondary">
                                {venta.items?.length || 0} productos • {venta.metodo_pago}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-semibold text-theme-text">
                                $ {(parseFloat(venta.total) / 100).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          
                          {/* Detalle de productos */}
                          {venta.items && venta.items.length > 0 && (
                            <div className="border-t border-gray-100 pt-4">
                              <h6 className="text-sm font-medium text-theme-text mb-3">Productos Comprados:</h6>
                              <div className="space-y-3">
                                {venta.items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-theme-background rounded-lg">
                                      {/* Imagen del producto */}
                                      <div className="flex-shrink-0">
                                        {item.producto_imagen_url ? (
                                          <img
                                            src={item.producto_imagen_url}
                                            alt={item.producto_nombre || 'Producto'}
                                            className="w-12 h-12 rounded-lg object-cover border border-theme-border"
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                              e.target.nextSibling.style.display = 'flex';
                                            }}
                                          />
                                        ) : null}
                                        <div className={`w-12 h-12 bg-theme-secondary rounded-lg border border-theme-border flex items-center justify-center ${item.producto_imagen_url ? 'hidden' : ''}`}>
                                          <Package size={16} className="text-theme-textSecondary" />
                                        </div>
                                      </div>
                                      
                                      {/* Información del producto */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-sm font-medium text-theme-text truncate">
                                            {item.producto_nombre}
                                          </span>
                                          {item.variante_nombre && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                              {item.variante_nombre}
                                            </span>
                                          )}
                                          {/* Mostrar color si existe */}
                                          {item.color && item.color.nombre && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-theme-secondary border border-theme-border" title={item.color.nombre}>
                                              <span
                                                className="inline-block w-4 h-4 rounded-full border border-theme-border"
                                                style={{ backgroundColor: item.color.hex_code }}
                                              ></span>
                                              {item.color.nombre}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-theme-textSecondary">
                                          <span>SKU: {item.producto_sku}</span>
                                          <span>•</span>
                                          <span>Cantidad: {item.cantidad}</span>
                                        </div>
                                      </div>
                                      
                                      {/* Precios */}
                                      <div className="flex-shrink-0 text-right">
                                        <div className="text-sm text-theme-textSecondary">
                                          $ {(parseFloat(item.precio_unitario) / 100).toFixed(2)} c/u
                                        </div>
                                        <div className="text-sm font-semibold text-theme-text">
                                          $ {(parseFloat(item.subtotal) / 100).toFixed(2)}
                                        </div>
                                      </div>
                                    </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto h-16 w-16 bg-theme-secondary rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="h-8 w-8 text-theme-textSecondary" />
                  </div>
                  <h3 className="text-lg font-medium text-theme-text mb-2">No hay compras registradas</h3>
                  <p className="text-theme-textSecondary">
                    Este cliente aún no ha realizado ninguna compra.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de confirmación de eliminación */}
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

export default CustomersPage;