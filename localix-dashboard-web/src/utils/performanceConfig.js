// Configuración de rendimiento para la aplicación
export const PERFORMANCE_CONFIG = {
  // Configuración de caché
  CACHE: {
    DURATION: 30000, // 30 segundos
    MAX_SIZE: 100, // Máximo 100 elementos en caché
  },
  
  // Configuración de debounce para búsquedas
  DEBOUNCE: {
    SEARCH: 300, // 300ms para búsquedas
    SCROLL: 100, // 100ms para eventos de scroll
  },
  
  // Configuración de paginación
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 50,
  },
  
  // Configuración de imágenes
  IMAGES: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    COMPRESSION_QUALITY: 0.8,
  },
  
  // Configuración de logs
  LOGS: {
    ENABLE_DEBUG: false, // Deshabilitar logs de debug en producción
    ENABLE_PERFORMANCE: false, // Deshabilitar logs de rendimiento
  },
};

// Función para verificar si estamos en modo desarrollo
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

// Función para habilitar logs solo en desarrollo
export const log = (message, data = null) => {
  if (PERFORMANCE_CONFIG.LOGS.ENABLE_DEBUG || isDevelopment()) {
    console.log(message, data);
  }
};

// Función para medir rendimiento
export const measurePerformance = (name, fn) => {
  if (PERFORMANCE_CONFIG.LOGS.ENABLE_PERFORMANCE || isDevelopment()) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  }
  return fn();
};

// Función para debounce
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Función para throttle
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export default PERFORMANCE_CONFIG; 
