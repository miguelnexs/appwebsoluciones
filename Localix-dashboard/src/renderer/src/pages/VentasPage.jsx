import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Package, X, Plus, Minus, Save, Trash2, User, 
  Search, CreditCard, Truck, MapPin, Clock, Check, AlertCircle,
  Star, Eye, Filter, RefreshCw, ShoppingBag, Calculator, Percent,
  Printer, Bookmark
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { generarReciboVenta } from '../utils/ventaPDFGenerator';
import { useAuth } from '../context/AuthContext';

import ProductSearch from '../components/ventas/ProductSearch';
import ProductList from '../components/ventas/ProductList';
import ProductModal from '../components/ventas/ProductModal';
import ClientSection from '../components/ventas/ClientSection';
import ClientModal from '../components/ventas/ClientModal';
import QuickClientModal from '../components/ventas/QuickClientModal';
import SaleConfirmationModal from '../components/ventas/SaleConfirmationModal';
import PrinterConfigModal from '../components/ventas/PrinterConfigModal';
import { useOrderNotifications } from '../context/OrderNotificationsContext';

const VentasPage = () => {
  const navigate = useNavigate();
  const { addOrderNotification } = useOrderNotifications();
  const { user, isAuthenticated } = useAuth();
  
  // Estados principales
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estados de la venta actual
  const [carrito, setCarrito] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [clienteNombre, setClienteNombre] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [tipoVenta, setTipoVenta] = useState('fisica');
  const [precioEnvio, setPrecioEnvio] = useState(0);
  const [porcentajeDescuento, setPorcentajeDescuento] = useState(0);
  const [observaciones, setObservaciones] = useState('');
  // Modo separado
  const [modoSeparado, setModoSeparado] = useState(false);
  const [depositoSeparado, setDepositoSeparado] = useState('0');
  const [vencimientoSeparado, setVencimientoSeparado] = useState('');
  
  // Estados de búsqueda
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  
  // Estados de modales
  const [mostrarModalCliente, setMostrarModalCliente] = useState(false);
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  const [mostrarModalCrearCliente, setMostrarModalCrearCliente] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [modalVenta, setModalVenta] = useState({ open: false, venta: null });
  const [mostrarConfigImpresora, setMostrarConfigImpresora] = useState(false);
  
  // Estados de nuevo cliente
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tipo_documento: 'dni',
    numero_documento: '',
    direccion: ''
  });

  // Estados para selección de color
  const [colorSeleccionado, setColorSeleccionado] = useState(null);
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);
  
  // Estados de búsqueda de clientes
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [resultadosBusquedaCliente, setResultadosBusquedaCliente] = useState([]);

  // Listener para impresión automática de PDF
  useEffect(() => {
    const handleVentaCreada = async (event, data) => {
      if (data.venta && data.autoPrint) {
        try {
          // Generar e imprimir el PDF automáticamente
          await generarReciboVenta(data.venta, true);
          toast.success('✅ Venta completada y recibo impreso automáticamente');
        } catch (error) {
          console.error('Error al generar PDF:', error);
          toast.error('❌ Error al imprimir el recibo');
        }
      }
    };

    // Escuchar el evento de venta creada
    if (window.electronAPI && window.electronAPI.ventas && typeof window.electronAPI.ventas.on === 'function') {
      const unsubscribe = window.electronAPI.ventas.on('venta-creada', handleVentaCreada);
      
      return () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }
    
    return () => {};
  }, []);
  const [mostrarResultadosCliente, setMostrarResultadosCliente] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const recargarClientes = async () => {
    try {
      const response = await window.clientesAPI.obtenerTodos();
      
      if (response.success) {
        let clientesData = [];
        
        if (Array.isArray(response.data)) {
          clientesData = response.data;
        } else if (response.data && Array.isArray(response.data.results)) {
          clientesData = response.data.results;
        } else if (response.data && typeof response.data === 'object') {
          clientesData = response.data.results || [];
        }
        setClientes(clientesData);
      }
    } catch (error) {
      // Error silencioso para evitar spam en consola
    }
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [productosRes, clientesRes, ventasRes] = await Promise.all([
        window.ventasAPI.obtenerProductos(),
        window.clientesAPI.obtenerTodos(),
        window.ventasAPI.obtenerVentas()
      ]);
      
      if (productosRes.success) {
        let productosData = Array.isArray(productosRes.data) ? productosRes.data : [];
        // El backend ya filtra por usuario, no necesitamos filtrar aquí
        setProductos(productosData);
      } else {
        setProductos([]);
      }
      
      if (clientesRes.success) {
        let clientesData = [];
        
        if (Array.isArray(clientesRes.data)) {
          clientesData = clientesRes.data;
        } else if (clientesRes.data && Array.isArray(clientesRes.data.results)) {
          clientesData = clientesRes.data.results;
        } else if (clientesRes.data && typeof clientesRes.data === 'object') {
          clientesData = clientesRes.data.results || [];
        }
        setClientes(clientesData);
      } else {
        setClientes([]);
      }
      
      if (ventasRes.success) {
        const ventasData = Array.isArray(ventasRes.data) ? ventasRes.data : [];
        setVentas(ventasData);
      }
    } catch (error) {
      // Error silencioso para evitar spam en consola
    } finally {
      setLoading(false);
    }
  };

  const buscarProductos = useCallback(async (query) => {
    if (!query.trim()) {
      setResultadosBusqueda([]);
      setMostrarResultados(false);
      return;
    }

    try {
      const response = await window.ventasAPI.buscarProductos(query);
      if (response.success) {
        // El backend ya filtra por usuario, no necesitamos filtrar aquí
        let productosData = response.data || [];
        setResultadosBusqueda(productosData);
        setMostrarResultados(true);
      }
    } catch (error) {
      // Error silencioso para evitar spam en consola
    }
  }, [user, isAuthenticated]);

  const buscarClientes = useCallback(async (query) => {
    if (!query.trim()) {
      setResultadosBusquedaCliente([]);
      setMostrarResultadosCliente(false);
      return;
    }

    try {
      const response = await window.clientesAPI.buscar(query);
      if (response.success) {
        const clientesData = Array.isArray(response.data) ? response.data : [];
        setResultadosBusquedaCliente(clientesData);
        setMostrarResultadosCliente(true);
      }
    } catch (error) {
      setResultadosBusquedaCliente([]);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      buscarProductos(busquedaProducto);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [busquedaProducto, buscarProductos]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      buscarClientes(busquedaCliente);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [busquedaCliente, buscarClientes]);

  const calcularSubtotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const calcularDescuento = () => {
    const subtotal = calcularSubtotal();
    return (subtotal * porcentajeDescuento) / 100;
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    const envio = tipoVenta === 'envio' ? precioEnvio : 0;
    const descuento = calcularDescuento();
    return subtotal + envio - descuento;
  };

  const calcularStockDisponible = (item) => {
    if (item.color) {
      return item.color.stock;
    } else if (item.variante) {
      return item.variante.stock;
    } else {
      return item.producto.stock;
    }
  };

  const calcularStockRestante = (item) => {
    const stockDisponible = calcularStockDisponible(item);
    return Math.max(0, stockDisponible - item.cantidad);
  };

  const agregarAlCarrito = (producto, variante = null, color = null, cantidad = 1) => {
    if (producto.colores_disponibles && producto.colores_disponibles.length > 0 && !color) {
      toast.error(`El producto "${producto.nombre}" tiene colores disponibles. Debe seleccionar un color específico.`);
      return;
    }
    
    let stockDisponible;
    if (color) {
      stockDisponible = color.stock;
    } else if (variante) {
      stockDisponible = variante.stock;
    } else {
      stockDisponible = producto.stock;
    }
    
    if (stockDisponible < cantidad) {
      toast.error(`Stock insuficiente. Solo hay ${stockDisponible} unidades disponibles.`);
      return;
    }
    
    const precioFinal = producto.precio + (variante ? variante.precio_extra : 0);
    
    const itemExistente = carrito.find(item => 
      item.producto.id === producto.id && 
      item.variante?.id === variante?.id &&
      item.color?.id === color?.id
    );

    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + cantidad;
      if (nuevaCantidad > stockDisponible) {
        toast.error(`Stock insuficiente. Solo puedes agregar ${stockDisponible - itemExistente.cantidad} unidades más.`);
        return;
      }
      
      setCarrito(carrito.map(item => 
        item === itemExistente 
          ? { ...item, cantidad: nuevaCantidad }
          : item
      ));
      toast.success(`Cantidad actualizada para ${producto.nombre}${color ? ` - ${color.nombre}` : ''}${variante ? ` - ${variante.valor}` : ''}`);
    } else {
      setCarrito([...carrito, {
        producto,
        variante,
        color,
        cantidad,
        precio: precioFinal
      }]);
      toast.success(`${producto.nombre}${color ? ` - ${color.nombre}` : ''}${variante ? ` - ${variante.valor}` : ''} agregado al carrito`);
    }
    
    setMostrarResultados(false);
    setBusquedaProducto('');
    setColorSeleccionado(null);
    setCantidadSeleccionada(1);
  };

  const manejarSeleccionProducto = (producto) => {
    if (producto.colores_disponibles && producto.colores_disponibles.length > 0) {
      setProductoSeleccionado(producto);
      setColorSeleccionado(null);
      setCantidadSeleccionada(1);
      setMostrarModalProducto(true);
    } else {
      agregarAlCarrito(producto, null, null, 1);
    }
  };

  const removerDelCarrito = (index) => {
    const item = carrito[index];
    setCarrito(carrito.filter((_, i) => i !== index));
    toast.info(`${item.producto.nombre} eliminado del carrito`);
  };

  const actualizarCantidad = (index, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    
    const item = carrito[index];
    let stockDisponible;
    
    if (item.color) {
      stockDisponible = item.color.stock;
    } else if (item.variante) {
      stockDisponible = item.variante.stock;
    } else {
      stockDisponible = item.producto.stock;
    }
    
    if (nuevaCantidad > stockDisponible) {
      toast.error(`Stock insuficiente. Solo hay ${stockDisponible} unidades disponibles.`);
      return;
    }
    
    setCarrito(carrito.map((item, i) => 
      i === index ? { ...item, cantidad: nuevaCantidad } : item
    ));
  };

  const crearCliente = async () => {
    try {
      const response = await window.clientesAPI.crear(nuevoCliente);
      if (response.success) {
        setClientes([response.data, ...clientes]);
        setClienteSeleccionado(response.data);
        setMostrarModalCliente(false);
        setNuevoCliente({
          nombre: '',
          email: '',
          telefono: '',
          tipo_documento: 'dni',
          numero_documento: '',
          direccion: ''
        });
      }
    } catch (error) {
      // Error silencioso para evitar spam en consola
    }
  };

  const crearClienteRapido = async () => {
    try {
      const response = await window.clientesAPI.crearRapido(nuevoCliente);
      if (response.success) {
        setClientes([response.data, ...clientes]);
        setClienteSeleccionado(response.data);
        setMostrarModalCrearCliente(false);
        setNuevoCliente({
          nombre: '',
          email: '',
          telefono: '',
          tipo_documento: 'dni',
          numero_documento: '',
          direccion: ''
        });
      }
    } catch (error) {
      // Error silencioso para evitar spam en consola
    }
  };

  const finalizarVenta = async () => {
    if (carrito.length === 0) {
      toast.error('Debes agregar al menos un producto al carrito para realizar la venta.');
      return;
    }
    if (!clienteSeleccionado && !clienteNombre.trim()) {
      toast.error('Debes seleccionar un cliente o ingresar un nombre para venta anónima.');
      return;
    }
    const productosSinColor = carrito.filter(item => item.producto.colores_disponibles && item.producto.colores_disponibles.length > 0 && !item.color);
    if (productosSinColor.length > 0) {
      const nombres = productosSinColor.map(item => item.producto.nombre).join(', ');
      toast.error(`Los siguientes productos requieren selección de color: ${nombres}`);
      return;
    }
    setLoading(true);
    try {
      if (modoSeparado) {
        const reservaData = {
          items: carrito.map(item => ({
            producto_id: item.producto.id,
            variante_id: item.variante?.id || null,
            color_id: item.color?.id || null,
            cantidad: item.cantidad,
            descuento_item: 0
          })),
          monto_deposito: depositoSeparado || '0',
          notas: observaciones,
        };
        if (clienteSeleccionado) {
          reservaData.cliente_id = clienteSeleccionado.id;
        }
        if (vencimientoSeparado) {
          reservaData.fecha_vencimiento = vencimientoSeparado;
        }
        const resReserva = await window.reservasAPI.crear(reservaData);
        if (resReserva.success) {
          setCarrito([]);
          setDepositoSeparado('0');
          setVencimientoSeparado('');
          setModoSeparado(false);
          toast.success('✅ Separado creado correctamente');
          // Notificación en sidebar como pedido
          addOrderNotification({
            id: resReserva.data?.id,
            numero_venta: `RES-${resReserva.data?.id}`,
            total: resReserva.data?.monto_total,
            cliente_nombre: clienteSeleccionado?.nombre || clienteNombre || 'Cliente',
            items: (resReserva.data?.items || []).map(it => ({ producto: it.producto, cantidad: it.cantidad }))
          });
          cargarDatos();
          return;
        } else {
          toast.error(resReserva.error || 'Error al crear separado');
          return;
        }
      }
      const ventaData = {
        items: carrito.map(item => ({
          producto_id: item.producto.id,
          variante_id: item.variante?.id || null,
          color_id: item.color?.id || null,
          cantidad: item.cantidad,
          descuento_item: 0
        })),
        tipo_venta: tipoVenta,
        precio_envio: tipoVenta === 'envio' ? precioEnvio : 0,
        porcentaje_descuento: porcentajeDescuento,
        metodo_pago: metodoPago,
        observaciones: observaciones,
        vendedor: 'Sistema'
      };
      
      if (clienteSeleccionado) {
        ventaData.cliente_id = clienteSeleccionado.id;
      } else if (clienteNombre.trim()) {
        ventaData.cliente_nombre = clienteNombre.trim();
      }
      
      const response = await window.ventasAPI.crearVenta(ventaData);
      if (response.success && response.data && response.data.id) {
        setCarrito([]);
        setClienteSeleccionado(null);
        setClienteNombre('');
        setPrecioEnvio(0);
        setTipoVenta('fisica');
        setObservaciones('');
        setMetodoPago('efectivo');
        
        const productosVendidos = response.data.items?.map(item => {
          let color = item.color?.nombre ? ` (${item.color.nombre})` : '';
          return `${item.producto}${color} x${item.cantidad}`;
        }).join(', ');
        
        if (response.data.items && response.data.items.length > 2) {
          toast.success(`¡Venta múltiple creada exitosamente! Venta: ${response.data.numero_venta} Total: $ ${response.data.total}${productosVendidos ? ` | Productos: ${productosVendidos}` : ''}`);
        } else {
          toast.success(`¡Venta creada exitosamente! Venta: ${response.data.numero_venta} Total: $ ${response.data.total}${productosVendidos ? ` | Productos: ${productosVendidos}` : ''}`);
        }
        
        // Agregar notificación al sidebar
        addOrderNotification({
          id: response.data.id,
          numero_venta: response.data.numero_venta,
          total: response.data.total,
          cliente_nombre: clienteSeleccionado?.nombre || clienteNombre || 'Cliente anónimo',
          items: response.data.items
        });
        
        // Generar e imprimir PDF automáticamente
        try {
          await generarReciboVenta(response.data, true);
          toast.success('✅ Venta completada y recibo impreso automáticamente');
        } catch (error) {
          console.error('Error al generar PDF:', error);
          toast.error('❌ Error al imprimir el recibo');
        }
        
        cargarDatos();
        setModalVenta({ open: true, venta: response.data });
        
        // Redirigir a pedidos después de completar la venta
        setTimeout(() => {
          navigate('/orders');
        }, 2000); // Esperar 2 segundos para que el usuario vea la confirmación
      } else {
        const errorMessage = response.error || 'Error al crear la venta.';
        toast.error(errorMessage);
      }
    } catch (error) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Error al finalizar la venta');
      }
    } finally {
      setLoading(false);
    }
  };

  const limpiarCarrito = () => {
    if (carrito.length === 0) {
      toast.info('El carrito ya está vacío');
      return;
    }
    setCarrito([]);
    setClienteSeleccionado(null);
    setClienteNombre('');
    setPrecioEnvio(0);
    setPorcentajeDescuento(0);
    setTipoVenta('fisica');
    setObservaciones('');
    toast.success('Carrito limpiado exitosamente');
  };

  const getStockTotal = (producto) => {
    if (Array.isArray(producto.colores_disponibles) && producto.colores_disponibles.length > 0) {
      return producto.colores_disponibles.reduce((acc, color) => acc + (parseInt(color.stock) || 0), 0);
    }
    return parseInt(producto.stock_total_calculado || producto.stock) || 0;
  };

  const getTotalItems = () => {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
  };

  if (loading) {
    return (
              <div className="flex items-center justify-center h-screen bg-gradient-to-br from-theme-surface to-theme-secondary">
        <div className="text-center">
                      <div className="animate-spin rounded-full h-32 w-32 border-8 border-theme-border border-t-theme-accent mx-auto mb-4"></div>
          <p className="text-lg font-medium text-theme-textSecondary">Cargando sistema de ventas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ventas-container h-screen">
      {/* Header de la página */}
      <div className="bg-theme-surface border-b border-theme-border shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-theme-primary to-theme-accent rounded-xl shadow-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-theme-text">Sistema de Ventas</h1>
                <p className="text-sm text-theme-textSecondary">Gestiona tus ventas de forma rápida y eficiente</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-theme-success/20 text-theme-success rounded-lg">
                <ShoppingBag className="w-4 h-4" />
                <span className="text-sm font-medium">{getTotalItems()} productos</span>
              </div>
              <button
                onClick={limpiarCarrito}
                className="flex items-center gap-2 px-4 py-2 text-theme-error hover:bg-theme-error/10 rounded-lg transition-colors"
                disabled={carrito.length === 0}
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Limpiar Todo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Layout principal de 3 columnas */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Columna 1: Búsqueda y productos */}
        <div className="w-1/3 glass-card border-r border-theme-border flex flex-col main-section">
          <div className="p-6 border-b border-theme-border">
            <h2 className="text-lg font-semibold text-theme-text mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-theme-textSecondary" />
              Buscar Productos
            </h2>
            <ProductSearch
              busquedaProducto={busquedaProducto}
              setBusquedaProducto={setBusquedaProducto}
              resultadosBusqueda={resultadosBusqueda}
              mostrarResultados={mostrarResultados}
              manejarSeleccionProducto={manejarSeleccionProducto}
              getStockTotal={getStockTotal}
            />
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <ProductList
              productos={productos}
              manejarSeleccionProducto={manejarSeleccionProducto}
              getStockTotal={getStockTotal}
            />
          </div>
        </div>

        {/* Columna 2: Carrito estático */}
        <div className="w-1/3 glass-card-blue border-r border-theme-border flex flex-col main-section">
          <div className="p-6 bg-theme-surface border-b border-theme-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-theme-text flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-theme-accent" />
                Carrito de Compras
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-theme-accent/20 text-theme-accent rounded-full">
                <span className="text-sm font-bold">{getTotalItems()}</span>
                <span className="text-xs">items</span>
              </div>
            </div>
          </div>

          {/* Lista de productos en el carrito */}
          <div className="flex-1 overflow-y-auto p-4">
            {carrito.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 bg-theme-secondary rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-12 h-12 text-theme-textSecondary" />
                </div>
                <h3 className="text-lg font-medium text-theme-textSecondary mb-2">Carrito vacío</h3>
                <p className="text-sm text-theme-textSecondary">Agrega productos para comenzar una venta</p>
              </div>
            ) : (
              <div className="space-y-3">
                {carrito.map((item, index) => (
                  <div key={`${item.producto.id}-${index}`} className="cart-item-card rounded-xl p-4 shadow-sm border border-theme-border cart-item-enter">
                    <div className="flex gap-3">
                      {/* Imagen del producto */}
                      <div className="relative flex-shrink-0 w-16 h-16 bg-theme-secondary rounded-lg overflow-hidden">
                        {item.producto.imagen_principal_url ? (
                          <img
                            src={item.producto.imagen_principal_url}
                            alt={item.producto.nombre}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full bg-gradient-to-br from-theme-surface to-theme-secondary flex items-center justify-center ${
                          item.producto.imagen_principal_url ? 'hidden' : ''
                        }`}>
                          <Package className="w-6 h-6 text-theme-textSecondary" />
                        </div>
                        
                        {/* Badge de cantidad */}
                        <div className="absolute -top-2 -right-2 bg-theme-accent text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {item.cantidad}
                        </div>
                      </div>
                      
                      {/* Información del producto */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-theme-text text-sm mb-1 line-clamp-2">
                          {item.producto.nombre}
                        </h4>
                        {item.color && (
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="w-3 h-3 rounded-full border border-theme-border"
                              style={{ backgroundColor: item.color.codigo_hex || '#ccc' }}
                            ></div>
                            <span className="text-xs text-theme-textSecondary">{item.color.nombre}</span>
                          </div>
                        )}
                        
                        {/* Controles de cantidad */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => actualizarCantidad(index, item.cantidad - 1)}
                              className="quantity-btn p-1 rounded-md bg-theme-secondary text-theme-textSecondary disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={item.cantidad <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-theme-text bg-theme-accent/20 rounded px-2 py-1">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => actualizarCantidad(index, item.cantidad + 1)}
                              className="quantity-btn p-1 rounded-md bg-theme-secondary text-theme-textSecondary disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={calcularStockRestante(item) <= 0}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removerDelCarrito(index)}
                            className="p-1 rounded-md text-theme-error hover:bg-theme-error/10 transition-colors"
                            title="Eliminar producto"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Stock visual y precio */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-theme-textSecondary">
                              Stock: {calcularStockRestante(item)} disponibles
                            </span>
                            <div className="text-right">
                              <p className="font-bold text-theme-text text-sm">
                                ${(item.precio * item.cantidad).toLocaleString()}
                              </p>
                              <p className="text-xs text-theme-textSecondary">
                                ${item.precio.toLocaleString()} c/u
                              </p>
                            </div>
                          </div>
                          {/* Barra de stock visual */}
                          <div className="w-full bg-theme-border rounded-full h-2">
                            <div 
                              className="stock-indicator-fill h-2 rounded-full" 
                              style={{
                                width: `${Math.min(100, (calcularStockRestante(item) / calcularStockDisponible(item)) * 100)}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resumen del carrito */}
          {carrito.length > 0 && (
            <div className="p-4 bg-theme-surface border-t border-theme-border">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-theme-textSecondary">Subtotal:</span>
                  <span className="font-medium">${calcularSubtotal().toLocaleString()}</span>
                </div>
                {porcentajeDescuento > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-theme-textSecondary">Descuento ({porcentajeDescuento}%):</span>
                    <span className="font-medium text-theme-error">-${calcularDescuento().toFixed(2)}</span>
                  </div>
                )}
                {tipoVenta === 'envio' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-theme-textSecondary">Envío:</span>
                    <span className="font-medium">${precioEnvio.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-theme-text pt-2 border-t border-theme-border">
                  <span>Total:</span>
                  <span>${calcularTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Columna 3: Cliente y configuración */}
        <div className="w-1/3 glass-card flex flex-col main-section">
          <div className="p-6 border-b border-theme-border">
            <h2 className="text-lg font-semibold text-theme-text mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-theme-textSecondary" />
              Cliente y Configuración
            </h2>
            
            <ClientSection
              clienteSeleccionado={clienteSeleccionado}
              setClienteSeleccionado={setClienteSeleccionado}
              busquedaCliente={busquedaCliente}
              setBusquedaCliente={setBusquedaCliente}
              resultadosBusquedaCliente={resultadosBusquedaCliente}
              mostrarResultadosCliente={mostrarResultadosCliente}
              setMostrarResultadosCliente={setMostrarResultadosCliente}
              clientes={clientes}
              setMostrarModalCliente={setMostrarModalCliente}
              setMostrarModalCrearCliente={setMostrarModalCrearCliente}
              clienteNombre={clienteNombre}
              setClienteNombre={setClienteNombre}
              recargarClientes={recargarClientes}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Configuración de venta */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-textSecondary mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Método de Pago
                </label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-theme-accent text-sm"
                >
                  <option value="efectivo">💵 Efectivo</option>
                  <option value="transferencia">🏦 Transferencia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-textSecondary mb-2 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Tipo de Venta
                </label>
                <select
                  value={tipoVenta}
                  onChange={(e) => setTipoVenta(e.target.value)}
                  className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-theme-accent text-sm"
                >
                  <option value="fisica">🏪 Venta Física</option>
                  <option value="envio">📦 Venta con Envío</option>
                </select>
              </div>

              {tipoVenta === 'envio' && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-theme-textSecondary mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Precio de Envío ($)
                  </label>
                  <input
                    type="number"
                    value={precioEnvio}
                    onChange={(e) => setPrecioEnvio(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-theme-accent text-sm"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-theme-textSecondary mb-2 flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Descuento (%)
                </label>
                <input
                  type="number"
                  value={porcentajeDescuento}
                  onChange={(e) => setPorcentajeDescuento(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-theme-accent text-sm"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0.00"
                />
                {porcentajeDescuento > 0 && (
                  <p className="text-sm text-theme-textSecondary mt-1">
                    Descuento: ${calcularDescuento().toFixed(2)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-textSecondary mb-2">
                  Observaciones
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-theme-accent text-sm resize-none"
                  rows="3"
                  placeholder="Notas adicionales sobre la venta..."
                />
              </div>
            </div>
          </div>

          {/* Botón de finalizar venta */}
          <div className="p-6 border-t border-theme-border bg-theme-background">
            <div className="flex flex-col gap-4">
              {/* Toggle de Separado */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setModoSeparado(!modoSeparado)}
                  className={`px-3 py-2 rounded-lg border ${modoSeparado ? 'bg-theme-accent text-white border-theme-accent' : 'bg-theme-surface text-theme-text border-theme-border'}`}
                  title="Activar modo Separado"
                >
                  <Bookmark className="w-4 h-4 inline mr-2" />
                  {modoSeparado ? 'Modo Separado activado' : 'Separar (reserva)'}
                </button>
                {modoSeparado && (
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <label className="block text-xs text-theme-textSecondary">Depósito</label>
                      <input
                        type="number"
                        value={depositoSeparado}
                        onChange={(e) => setDepositoSeparado(e.target.value)}
                        className="px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-theme-accent text-sm w-32"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-theme-textSecondary">Vence</label>
                      <input
                        type="datetime-local"
                        value={vencimientoSeparado}
                        onChange={(e) => setVencimientoSeparado(e.target.value)}
                        className="px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-theme-accent text-sm"
                      />
                    </div>
                    <p className="text-xs text-theme-textSecondary">Stock se reserva, no se descuenta hasta finalizar.</p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setMostrarConfigImpresora(true)}
                  className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                  title="Configurar impresora"
                >
                  <Printer className="w-4 h-4" />
                  Impresora
                </button>
                
                <button
                  onClick={finalizarVenta}
                  disabled={loading || carrito.length === 0}
                  className="checkout-button flex-1 text-white py-3 px-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {modoSeparado ? 'Creando Separado...' : 'Procesando Venta...'}
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {modoSeparado ? 'Crear Separado' : 'Finalizar Venta'}
                      {carrito.length > 0 && (
                        <span className="ml-2 px-2 py-1 bg-theme-surface/20 rounded-full text-sm">
                          ${calcularTotal().toLocaleString()}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {mostrarModalProducto && productoSeleccionado && (
        <ProductModal
          productoSeleccionado={productoSeleccionado}
          setMostrarModalProducto={setMostrarModalProducto}
          colorSeleccionado={colorSeleccionado}
          setColorSeleccionado={setColorSeleccionado}
          cantidadSeleccionada={cantidadSeleccionada}
          setCantidadSeleccionada={setCantidadSeleccionada}
          agregarAlCarrito={agregarAlCarrito}
        />
      )}

      {mostrarModalCliente && (
        <ClientModal
          mostrarModalCliente={mostrarModalCliente}
          setMostrarModalCliente={setMostrarModalCliente}
          clientes={clientes}
          setClienteSeleccionado={setClienteSeleccionado}
          nuevoCliente={nuevoCliente}
          setNuevoCliente={setNuevoCliente}
          crearCliente={crearCliente}
        />
      )}

      {mostrarModalCrearCliente && (
        <QuickClientModal
          mostrarModalCrearCliente={mostrarModalCrearCliente}
          setMostrarModalCrearCliente={setMostrarModalCrearCliente}
          nuevoCliente={nuevoCliente}
          setNuevoCliente={setNuevoCliente}
          crearClienteRapido={crearClienteRapido}
        />
      )}

      {modalVenta.open && modalVenta.venta && (
        <SaleConfirmationModal
          modalVenta={modalVenta}
          setModalVenta={setModalVenta}
        />
      )}

      {mostrarConfigImpresora && (
        <PrinterConfigModal
          isOpen={mostrarConfigImpresora}
          onClose={() => setMostrarConfigImpresora(false)}
        />
      )}

      <ToastContainer 
        position="bottom-right" 
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default VentasPage;