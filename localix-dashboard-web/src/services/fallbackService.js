// Servicio de fallback para cuando el backend no esté disponible
// Proporciona datos de ejemplo para que la aplicación funcione en modo demo

export class FallbackService {
  static isOfflineMode = false;
  
  static enableOfflineMode() {
    this.isOfflineMode = true;
    console.warn('🔄 Modo offline activado - usando datos de ejemplo');
  }
  
  static disableOfflineMode() {
    this.isOfflineMode = false;
    console.info('🌐 Modo online restaurado');
  }
  
  // Datos de ejemplo para categorías
  static getCategorias() {
    return [
      { id: 1, nombre: 'Ropa', descripcion: 'Prendas de vestir' },
      { id: 2, nombre: 'Calzado', descripcion: 'Zapatos y sandalias' },
      { id: 3, nombre: 'Accesorios', descripcion: 'Complementos y accesorios' }
    ];
  }
  
  // Datos de ejemplo para productos
  static getProductos() {
    return [
      {
        id: 1,
        nombre: 'Camiseta Básica',
        descripcion: 'Camiseta de algodón 100%',
        precio: 25.99,
        categoria: 1,
        stock: 50,
        colores_disponibles: ['Blanco', 'Negro', 'Azul']
      },
      {
        id: 2,
        nombre: 'Jeans Clásicos',
        descripcion: 'Pantalón de mezclilla',
        precio: 45.99,
        categoria: 1,
        stock: 30,
        colores_disponibles: ['Azul', 'Negro']
      },
      {
        id: 3,
        nombre: 'Zapatillas Deportivas',
        descripcion: 'Calzado deportivo cómodo',
        precio: 89.99,
        categoria: 2,
        stock: 25,
        colores_disponibles: ['Blanco', 'Negro', 'Rojo']
      }
    ];
  }
  
  // Datos de ejemplo para estadísticas de ventas
  static getEstadisticasVentas() {
    return {
      ventas_hoy: 15,
      ingresos_hoy: 1250.50,
      ventas_mes: 450,
      ingresos_mes: 28750.00,
      productos_mas_vendidos: [
        { nombre: 'Camiseta Básica', cantidad: 25 },
        { nombre: 'Jeans Clásicos', cantidad: 18 },
        { nombre: 'Zapatillas Deportivas', cantidad: 12 }
      ],
      ventas_por_dia: [
        { fecha: '2024-01-15', ventas: 12, ingresos: 890.50 },
        { fecha: '2024-01-16', ventas: 18, ingresos: 1340.25 },
        { fecha: '2024-01-17', ventas: 15, ingresos: 1250.50 }
      ]
    };
  }
  
  // Datos de ejemplo para pedidos
  static getPedidos() {
    return [
      {
        id: 1,
        cliente: 'Juan Pérez',
        fecha: '2024-01-17',
        total: 125.50,
        estado: 'pendiente',
        productos: [
          { nombre: 'Camiseta Básica', cantidad: 2, precio: 25.99 },
          { nombre: 'Jeans Clásicos', cantidad: 1, precio: 45.99 }
        ]
      },
      {
        id: 2,
        cliente: 'María García',
        fecha: '2024-01-17',
        total: 89.99,
        estado: 'completado',
        productos: [
          { nombre: 'Zapatillas Deportivas', cantidad: 1, precio: 89.99 }
        ]
      }
    ];
  }
  
  // Simular respuesta exitosa de API
  static createSuccessResponse(data) {
    return Promise.resolve({
      data: data,
      status: 200,
      statusText: 'OK (Modo Demo)',
      headers: {},
      config: {}
    });
  }
  
  // Simular delay de red
  static async simulateNetworkDelay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Método principal para obtener datos con fallback
  static async getFallbackData(endpoint) {
    await this.simulateNetworkDelay();
    
    // Normalizar endpoint (remover parámetros de query y barras)
    const cleanEndpoint = endpoint.replace(/\?.*$/, '').replace(/^\/+|\/+$/g, '');
    
    console.info(`🔄 Procesando fallback para endpoint limpio: '${cleanEndpoint}'`);
    
    switch (cleanEndpoint) {
      case 'categorias':
      case 'api/categorias':
        return this.createSuccessResponse(this.getCategorias());
      
      case 'productos':
      case 'api/productos':
        return this.createSuccessResponse(this.getProductos());
      
      case 'ventas/estadisticas':
      case 'api/ventas/estadisticas':
        return this.createSuccessResponse(this.getEstadisticasVentas());
      
      case 'pedidos':
      case 'api/pedidos':
        return this.createSuccessResponse(this.getPedidos());
      
      // Endpoints específicos que aparecen en los logs
      case 'api/categorias/':
        return this.createSuccessResponse(this.getCategorias());
      
      case 'api/ventas/estadisticas/':
        return this.createSuccessResponse(this.getEstadisticasVentas());
      
      default:
        console.warn(`⚠️ Endpoint no reconocido para fallback: '${cleanEndpoint}'`);
        return this.createSuccessResponse([]);
    }
  }
}

export default FallbackService;