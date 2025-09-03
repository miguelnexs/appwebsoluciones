// Configuración de URLs de la API con fallback
const PRODUCTION_API_URL = 'https://softwarebycg.shop';
const LOCAL_API_URL = 'http://localhost:8000';

// Detectar si estamos en desarrollo o producción
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// URL base de la API con fallback automático
const API_BASE_URL = isDevelopment ? LOCAL_API_URL : PRODUCTION_API_URL;

// Helper para endpoints de la API REST
export const API_URL = (path) => `${API_BASE_URL}/api/${path.replace(/^\/+/,'')}`;

// Helper para recursos estáticos (imágenes, etc.)
export const RESOURCE_URL = (path) => {
  // Si la URL ya es absoluta (http/https), devolverla tal cual
  if (path.startsWith('http')) {
    return path;
  }
  
  // Si es una ruta relativa, construir la URL completa
  const resourceBaseUrl = API_BASE_URL;
  
  return `${resourceBaseUrl}${path.startsWith('/') ? path : '/' + path}`;
};

// Exportar información de configuración
export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  isDevelopment,
  productionUrl: PRODUCTION_API_URL,
  localUrl: LOCAL_API_URL
};

export default API_BASE_URL;
