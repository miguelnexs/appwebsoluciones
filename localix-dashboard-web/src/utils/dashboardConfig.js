// Configuración optimizada para el dashboard
export const DASHBOARD_CONFIG = {
  // Configuración de caché
  CACHE: {
    DURATION: 60000, // 1 minuto
    MAX_SIZE: 50, // Máximo 50 elementos
  },
  
  // Configuración de carga
  LOADING: {
    SKELETON_DURATION: 1000, // 1 segundo para skeleton
    TIMEOUT: 15000, // 15 segundos timeout
  },
  
  // Configuración de datos
  DATA: {
    VENTAS_LIMIT: 10, // Máximo 10 ventas recientes
    PEDIDOS_LIMIT: 5, // Máximo 5 pedidos recientes
    PRODUCTOS_LIMIT: 1000, // Máximo 1000 productos para estadísticas
  },
  
  // Configuración de gráficos
  CHARTS: {
    ANIMATION_DURATION: 1000,
    RESPONSIVE: true,
    MAINTAIN_ASPECT_RATIO: false,
  },
  
  // Configuración de refresco
  REFRESH: {
    AUTO_REFRESH_INTERVAL: 300000, // 5 minutos
    MANUAL_REFRESH_DEBOUNCE: 2000, // 2 segundos
  },
};

// Función para limpiar caché del dashboard
export const clearDashboardCache = () => {
  // Limpiar caché de ventas
  if (window.ventasAPI?.clearCache) {
    window.ventasAPI.clearCache();
  }
  
  // Limpiar caché de productos
  if (window.electronAPI?.productos?.limpiarCache) {
    window.electronAPI.productos.limpiarCache();
  }
};

// Función para optimizar datos del dashboard
export const optimizeDashboardData = (data) => {
  return {
    ...data,
    ventasRecientes: data.ventasRecientes?.slice(0, DASHBOARD_CONFIG.DATA.VENTAS_LIMIT) || [],
    pedidosRecientes: data.pedidosRecientes?.slice(0, DASHBOARD_CONFIG.DATA.PEDIDOS_LIMIT) || [],
    estadisticas: data.estadisticas?.slice(0, DASHBOARD_CONFIG.DATA.PRODUCTOS_LIMIT) || [],
  };
};

// Función para medir rendimiento del dashboard
export const measureDashboardPerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`⏱️ Dashboard ${name}: ${(end - start).toFixed(2)}ms`);
  }
  
  return result;
};

export default DASHBOARD_CONFIG; 
