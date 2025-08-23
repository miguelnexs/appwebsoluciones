// Configuración centralizada de la API
export const API_CONFIG = {
  BASE_URL: 'http://softwarebycg.shop',
  TIMEOUT: 30000,
  API_URL: 'http://softwarebycg.shop/api',
  
  // Endpoints específicos
  ENDPOINTS: {
    PRODUCTOS: '/api/productos/productos/',
    CATEGORIAS: '/api/categorias/',
    VENTAS: '/api/ventas/',
    PEDIDOS: '/api/pedidos/',
  }
};

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BASE_URL}${cleanEndpoint}`;
};

// Función helper para manejar URLs de imágenes con mejor manejo de errores
export const getImageUrl = (url: string): string => {
  if (!url) return '';
  
  // Si ya es una URL completa del backend, devolverla tal cual
  if (url.startsWith('http://softwarebycg.shop')) {
    return url;
  }
  
  // Si es relativa, anteponer la URL del servidor
  if (url.startsWith('/')) {
    return `http://softwarebycg.shop${url}`;
  }
  
  // Si es otra cosa, devolver como está
  return url;
};

// Función mejorada para manejar imágenes con fallback
export const getImageUrlWithFallback = (url: string, fallbackUrl?: string): string => {
  if (!url) {
    return fallbackUrl || '/placeholder-image.jpg';
  }
  
  // Procesar la URL normalmente
  const processedUrl = getImageUrl(url);
  return processedUrl;
};

// Función para verificar si una imagen existe
export const checkImageExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn(`Error verificando imagen: ${url}`, error);
    return false;
  }
};

// Función para obtener una imagen con retry
export const getImageWithRetry = async (url: string, maxRetries = 3): Promise<string> => {
  const processedUrl = getImageUrlWithFallback(url);
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const exists = await checkImageExists(processedUrl);
      if (exists) {
        return processedUrl;
      }
    } catch (error) {
      console.warn(`Intento ${i + 1} falló para: ${processedUrl}`);
    }
    
    // Esperar antes del siguiente intento
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  // Si todos los intentos fallan, devolver la URL procesada de todas formas
  return processedUrl;
};

export default API_CONFIG;
