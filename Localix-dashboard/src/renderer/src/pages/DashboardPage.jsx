// src/pages/DashboardPage.jsx
import React, { useMemo, lazy, Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  ShoppingBag, Users, DollarSign, Package, 
  TrendingUp, Activity, CreditCard, Star,
  Plus, Search, Filter, Download, RefreshCw, Loader, AlertTriangle, CheckCircle,
  ArrowUp, ArrowDown, Eye, ShoppingCart, Clock, Zap,
  Store, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Calendar, Bell,
  UserPlus, PackagePlus, TrendingDown, Target, Sparkles, GripVertical
} from 'lucide-react';
import OrderStatusBadge from '../components/OrderStatusBadge';
import DashboardSkeleton from '../components/ui/DashboardSkeleton';
import useDashboard from '../hooks/useDashboard';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

// Lazy loading para componentes pesados
const BarChart = lazy(() => import('../components/charts/BarChart'));
const LineChart = lazy(() => import('../components/charts/LineChart'));
const PieChart = lazy(() => import('../components/charts/PieChart'));

const DashboardPage = React.memo(() => {
  const navigate = useNavigate();
  const { dashboardData, loading, error, refreshData } = useDashboard();
  const { currentTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();

  // Estado para el orden de los widgets
  const [widgetOrder, setWidgetOrder] = useState([
    'ingresos',
    'pedidos', 
    'clientes',
    'ganancia'
  ]);

  // Sensores para el drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Función para manejar el drag and drop
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setWidgetOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Componente SortableWidget
  const SortableWidget = ({ widget }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: widget.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-theme-surface rounded-xl border border-theme-border p-6 hover:shadow-lg transition-all duration-200 relative ${
          isDragging ? 'shadow-2xl scale-105 z-50' : ''
        }`}
      >
        <div className="absolute top-2 right-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full" title="Datos personales"></div>
          <div 
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing p-1 rounded hover:bg-theme-secondary transition-colors"
          >
            <GripVertical className="w-4 h-4 text-theme-textSecondary" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-theme-textSecondary mb-1">{widget.title}</p>
            <p className="text-2xl font-bold text-theme-text">{widget.value}</p>
            <div className={`flex items-center mt-2 ${widget.textColor} text-xs`}>
              <CheckCircle className="w-3 h-3 mr-1" />
              <span>{widget.subtitle}</span>
            </div>
          </div>
          <div className={`p-3 ${widget.bgColor} rounded-xl`}>
            {widget.icon}
          </div>
        </div>
      </div>
    );
  };

  // KPIs optimizados desde resumen
  const {
    totalVentas = 0,
    totalIngresos = 0,
    totalIngresosTodos = 0,
    totalPedidos = 0,
    totalClientes = 0,
    totalProductos = 0,
    gananciaTotal = 0,
    pedidosEntregados = 0
  } = dashboardData.resumen || {};

  // Definición de widgets
  const widgets = {
    ingresos: {
      id: 'ingresos',
      title: 'Tus Ingresos Entregados',
      value: `$${totalIngresos.toLocaleString('es-CO', {minimumFractionDigits: 2})}`,
      subtitle: `${pedidosEntregados} entregados`,
      icon: <DollarSign className="w-6 h-6 text-green-600" />,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    pedidos: {
      id: 'pedidos',
      title: 'Tus Pedidos',
      value: totalPedidos,
      subtitle: 'Solo tus datos',
      icon: <ShoppingBag className="w-6 h-6 text-blue-600" />,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    clientes: {
      id: 'clientes',
      title: 'Tus Clientes',
      value: totalClientes,
      subtitle: 'Tu base activa',
      icon: <Users className="w-6 h-6 text-orange-600" />,
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600'
    },
    ganancia: {
      id: 'ganancia',
      title: 'Tu Ganancia Total',
      value: `$${gananciaTotal.toLocaleString('es-CO', {minimumFractionDigits: 2})}`,
      subtitle: 'Tu beneficio neto',
      icon: <DollarSign className="w-6 h-6 text-green-600" />,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    }
  };

  // Gráfica de ventas optimizada
  const salesData = useMemo(() => {
    const { ventasRecientes } = dashboardData;
    if (!Array.isArray(ventasRecientes) || ventasRecientes.length === 0) {
      return { labels: [], datasets: [] };
    }

    const meses = {};
    ventasRecientes.forEach(v => {
      let fecha = v?.fecha_venta || v?.fecha || v?.created_at;
      if (typeof fecha === 'string' && fecha.includes('T')) {
        fecha = fecha.split('T')[0];
      }
      const dateObj = new Date(fecha);
      if (isNaN(dateObj)) return;
      const key = `${dateObj.getFullYear()}-${(dateObj.getMonth()+1).toString().padStart(2, '0')}`;
      meses[key] = (meses[key] || 0) + (parseFloat(v?.total || 0) / 100);
    });

    const labels = Object.keys(meses).sort();
    return {
      labels,
      datasets: [{
        label: 'Ventas',
        data: labels.map(l => meses[l]),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        borderRadius: 4,
      }]
    };
  }, [dashboardData.ventasRecientes]);

  // Estado del inventario (pie chart)
  const inventoryData = useMemo(() => {
    if (!Array.isArray(dashboardData.estadisticas) || dashboardData.estadisticas.length === 0) {
      return { labels: [], datasets: [] };
    }
    
    const disponible = dashboardData.estadisticas.filter(p => p?.stock > (p?.stock_minimo || 5)).length;
    const bajo = dashboardData.estadisticas.filter(p => p?.gestion_stock !== false && p?.stock > 0 && p?.stock <= (p?.stock_minimo || 5)).length;
    const agotado = dashboardData.estadisticas.filter(p => p?.gestion_stock !== false && p?.stock <= 0).length;
    
    return {
      labels: ['Disponible', 'Stock Bajo', 'Agotado'],
      datasets: [{
        data: [disponible, bajo, agotado],
        backgroundColor: [
          'rgba(34, 197, 94, 0.7)',
          'rgba(251, 191, 36, 0.7)', 
          'rgba(239, 68, 68, 0.7)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 1,
      }]
    };
  }, [dashboardData.estadisticas]);

  // Pedidos recientes
  const recentOrders = useMemo(() => {
    if (!Array.isArray(dashboardData.pedidosRecientes) || dashboardData.pedidosRecientes.length === 0) return [];
    
    const mapEstadoToBadge = (estado) => {
      switch (estado) {
        case 'pendiente':
        case 'confirmado':
        case 'en_preparacion':
          return 'processing';
        case 'enviado':
          return 'shipped';
        case 'entregado':
          return 'completed';
        case 'cancelado':
          return 'cancelled';
        default:
          return 'processing';
      }
    };
    
    return dashboardData.pedidosRecientes.slice(0, 5).map(p => ({
      id: p?.numero_pedido || p?.id,
      customer: p?.cliente?.nombre || 'Cliente',
      amount: p?.total_pedido || p?.venta?.total || 0,
      status: mapEstadoToBadge(p?.estado_pedido || p?.estado),
      date: p?.fecha_creacion || p?.created_at
    }));
  }, [dashboardData.pedidosRecientes]);

  // Botones de acción rápida - MEJOR DISTRIBUIDOS
  const quickActions = [
    {
      id: 'quick-sale',
      title: 'Venta Rápida',
      icon: <ShoppingCart className="w-5 h-5" />,
      color: 'bg-green-50 text-green-700 border-green-200',
      hoverColor: 'hover:bg-green-100',
      action: () => navigate('/quick-sales')
    },
    {
      id: 'new-product',
      title: 'Nuevo Producto',
      icon: <PackagePlus className="w-5 h-5" />,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      hoverColor: 'hover:bg-blue-100',
      action: () => navigate('/product/new')
    },
    {
      id: 'view-orders',
      title: 'Pedidos',
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      hoverColor: 'hover:bg-orange-100',
      action: () => navigate('/orders')
    },
    {
      id: 'manage-inventory',
      title: 'Inventario',
      icon: <Package className="w-5 h-5" />,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      hoverColor: 'hover:bg-purple-100',
      action: () => navigate('/products')
    },
    {
      id: 'customers',
      title: 'Clientes',
      icon: <UserPlus className="w-5 h-5" />,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      hoverColor: 'hover:bg-indigo-100',
      action: () => navigate('/customers')
    },
    {
      id: 'categories',
      title: 'Categorías',
      icon: <Store className="w-5 h-5" />,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      hoverColor: 'hover:bg-teal-100',
      action: () => navigate('/categories')
    }
  ];

  // Verificar autenticación
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-theme-background">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold text-theme-text mb-2">No autenticado</h2>
        <p className="text-theme-textSecondary mb-4 text-center max-w-md">
          Por favor inicia sesión para ver los datos del dashboard.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="bg-theme-primary hover:bg-theme-accent text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Ir al Login
        </button>
      </div>
    );
  }

  // Loader optimizado
  if (loading.initial) {
    return <DashboardSkeleton />;
  }

  // Error state más simple
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-theme-background">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-theme-text mb-2">Error al cargar</h2>
        <p className="text-theme-textSecondary mb-4 text-center max-w-md">{error}</p>
        <button
          onClick={refreshData}
          className="bg-theme-primary hover:bg-theme-accent text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-background">
      {/* Header mejorado con información del usuario */}
      <div className="bg-theme-surface border-b border-theme-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.nombre?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-theme-text">Dashboard Personal</h1>
                  <div className="flex items-center gap-2">
                    <p className="text-theme-textSecondary text-sm">
                      Datos exclusivos de {user?.nombre || user?.username || 'Usuario'}
                    </p>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Datos en tiempo real"></div>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 inline-flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700 text-xs font-medium">
                  Solo tus datos • Privacidad garantizada
                </span>
              </div>
            </div>
            
            <button 
              onClick={refreshData}
              disabled={loading.refresh}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-theme-surface border border-theme-border rounded-lg hover:bg-theme-primary hover:text-white transition-colors text-theme-text"
            >
              <RefreshCw className={`h-4 w-4 ${loading.refresh ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* KPIs Draggables - Sin Productos */}
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={widgetOrder}
            strategy={horizontalListSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {widgetOrder.map((widgetId) => {
                const widget = widgets[widgetId];
                return (
                  <SortableWidget key={widget.id} widget={widget} />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        {/* Botones de Acción Rápida - MEJOR DISTRIBUIDOS */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-theme-text mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className={`p-4 border-2 rounded-xl ${action.color} ${action.hoverColor} transition-all duration-200 text-center text-sm font-medium hover:scale-105 hover:shadow-md`}
              >
                <div className="flex flex-col items-center space-y-2">
                  {action.icon}
                  <span>{action.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Gráficos - MEJOR ESPACIADOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de Ventas */}
          <div className="bg-theme-surface rounded-xl border border-theme-border p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-theme-text">Tendencia de Ventas</h3>
              <TrendingUp className="w-5 h-5 text-theme-textSecondary" />
            </div>
            <div className="h-72">
              {salesData.labels.length === 0 ? (
                <div className="flex items-center justify-center h-full text-theme-textSecondary">
                  <div className="text-center">
                    <LineChartIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No hay datos disponibles</p>
                  </div>
                </div>
              ) : (
                <Suspense fallback={<div className="h-72 bg-theme-secondary animate-pulse rounded-lg"></div>}>
                  <LineChart 
                    data={salesData} 
                    options={{ 
                      plugins: { 
                        legend: { display: false }, 
                        tooltip: { enabled: true } 
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: { color: 'rgba(0,0,0,0.05)' }
                        },
                        x: {
                          grid: { display: false }
                        }
                      }
                    }} 
                  />
                </Suspense>
              )}
            </div>
          </div>

          {/* Estado del Inventario */}
          <div className="bg-theme-surface rounded-xl border border-theme-border p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-theme-text">Estado del Inventario</h3>
              <Activity className="w-5 h-5 text-theme-textSecondary" />
            </div>
            <div className="h-72">
              {inventoryData.labels.length === 0 ? (
                <div className="flex items-center justify-center h-full text-theme-textSecondary">
                  <div className="text-center">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No hay datos disponibles</p>
                  </div>
                </div>
              ) : (
                <Suspense fallback={<div className="h-72 bg-theme-secondary animate-pulse rounded-lg"></div>}>
                  <PieChart 
                    data={inventoryData} 
                    options={{ 
                      plugins: { 
                        legend: { 
                          display: true,
                          position: 'bottom',
                          labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: { size: 12 }
                          }
                        }, 
                        tooltip: { enabled: true } 
                      }
                    }} 
                  />
                </Suspense>
              )}
            </div>
          </div>
        </div>

        {/* Productos con Mayor Ganancia */}
        <div className="bg-theme-surface rounded-xl border border-theme-border overflow-hidden mb-8">
          <div className="p-6 border-b border-theme-border">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-theme-text">Productos con Mayor Ganancia</h3>
              <button 
                onClick={() => navigate('/products')}
                className="text-sm text-theme-accent hover:text-opacity-80 font-medium transition-colors"
              >
                Ver todos
              </button>
            </div>
          </div>
          
          {dashboardData.estadisticas.filter(producto => producto.precio && producto.costo).length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-theme-textSecondary mx-auto mb-4" />
              <h4 className="text-lg font-medium text-theme-text mb-2">No hay datos de ganancia</h4>
              <p className="text-theme-textSecondary text-sm mb-6">Agrega costos a tus productos para ver las ganancias</p>
              <button 
                onClick={() => navigate('/products')}
                className="bg-theme-primary hover:bg-theme-accent text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
              >
                Gestionar productos
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-theme-secondary">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider">Precio Venta</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider">Costo</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider">Ganancia Unit.</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider">Margen %</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {dashboardData.estadisticas
                    .filter(producto => producto.precio && producto.costo)
                    .sort((a, b) => {
                      const gananciaA = parseFloat(a.precio) - parseFloat(a.costo);
      const gananciaB = parseFloat(b.precio) - parseFloat(b.costo);
                      return gananciaB - gananciaA;
                    })
                    .slice(0, 5)
                    .map(producto => {
                      const precio = parseFloat(producto.precio);
      const costo = parseFloat(producto.costo);
                      const ganancia = precio - costo;
                      const margen = costo > 0 ? ((ganancia / costo) * 100) : 0;
                      
                      return (
                        <tr key={producto.id} className="hover:bg-theme-secondary cursor-pointer transition-colors" onClick={() => navigate(`/products/${producto.id}`)}>
                          <td className="px-6 py-4 text-sm font-medium text-theme-text">{producto.nombre}</td>
                          <td className="px-6 py-4 text-sm text-theme-textSecondary">
                            ${(precio / 100).toLocaleString('es-CO', {minimumFractionDigits: 2})}
                          </td>
                          <td className="px-6 py-4 text-sm text-theme-textSecondary">
                            ${(costo / 100).toLocaleString('es-CO', {minimumFractionDigits: 2})}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-green-600">
                            ${(ganancia / 100).toLocaleString('es-CO', {minimumFractionDigits: 2})}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-green-600">
                            {margen.toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 text-sm text-theme-textSecondary">
                            {producto.stock || 0}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pedidos Recientes - MEJOR DISEÑO */}
        <div className="bg-theme-surface rounded-xl border border-theme-border overflow-hidden">
          <div className="p-6 border-b border-theme-border">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-theme-text">Pedidos Recientes</h3>
              <button 
                onClick={() => navigate('/orders')}
                className="text-sm text-theme-accent hover:text-opacity-80 font-medium transition-colors"
              >
                Ver todos
              </button>
            </div>
          </div>
          
          {recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-theme-textSecondary mx-auto mb-4" />
              <h4 className="text-lg font-medium text-theme-text mb-2">No hay pedidos recientes</h4>
              <p className="text-theme-textSecondary text-sm mb-6">Los nuevos pedidos aparecerán aquí</p>
              <button 
                onClick={() => navigate('/quick-sales')}
                className="bg-theme-primary hover:bg-theme-accent text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
              >
                Crear primera venta
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-theme-secondary">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider">Pedido</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider">Monto</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-theme-textSecondary uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-theme-secondary cursor-pointer transition-colors" onClick={() => navigate('/orders')}>
                      <td className="px-6 py-4 text-sm font-medium text-theme-text">#{order.id}</td>
                      <td className="px-6 py-4 text-sm text-theme-textSecondary">{order.customer}</td>
                      <td className="px-6 py-4 text-sm text-theme-textSecondary">
                        {new Date(order.date).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-theme-text">
                        ${typeof order.amount === 'number' ? (order.amount / 100).toFixed(2) : ((parseFloat(order.amount) || 0) / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default DashboardPage;