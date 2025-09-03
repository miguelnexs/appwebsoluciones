import axios from 'axios';
import { API_URL } from './apiConfig';
import FallbackService from '../services/fallbackService';

// Limpiar interceptors existentes para evitar duplicados
axios.interceptors.request.clear();
axios.interceptors.response.clear();

// Configurar timeout por defecto más bajo
axios.defaults.timeout = 10000; // 10 segundos

const api = axios.create({
  baseURL: API_URL(''),
  timeout: 10000, // 10 segundos por defecto
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Asegurar que siempre haya un timeout configurado
    if (!config.timeout) {
      config.timeout = 10000;
    }
    
    // No establecer Content-Type para FormData, dejar que el navegador lo maneje
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // Debug logging para peticiones de colores
    if (config.url && config.url.includes('/colores/')) {
      console.log('🔍 Axios interceptor - URL:', config.url);
      console.log('🔍 Axios interceptor - Method:', config.method);
      console.log('🔍 Axios interceptor - Headers:', config.headers);
      console.log('🔍 Axios interceptor - Data:', config.data);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para manejo de errores de conectividad
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Verificar si es un error de conectividad
    if (error.code === 'ERR_NETWORK' || 
        error.code === 'ECONNABORTED' || 
        error.message === 'Network Error' ||
        (error.response && error.response.status >= 500)) {
      
      console.error('🚨 Error de conectividad con el backend:', {
        message: error.message,
        code: error.code,
        config: error.config
      });
      
      // Activar modo fallback automáticamente
      if (!FallbackService.isOfflineMode) {
        FallbackService.enableOfflineMode();
      }
      
      // Intentar obtener datos del servicio de fallback
      const url = error.config?.url || '';
      const endpoint = url.replace(/^\/?/, '').split('?')[0]; // Limpiar URL
      
      try {
        console.info(`🔄 Intentando fallback para endpoint: ${endpoint}`);
        const fallbackResponse = await FallbackService.getFallbackData(endpoint);
        return fallbackResponse;
      } catch (fallbackError) {
        console.error('❌ Error en servicio de fallback:', fallbackError);
        
        // Si el fallback también falla, crear error descriptivo
        const connectivityError = new Error(
          `No se puede conectar con el servidor backend. Verifique que el servidor esté funcionando en \`${error.config?.baseURL || 'URL no disponible'}\`.`
        );
        connectivityError.originalError = error;
        connectivityError.isConnectivityError = true;
        
        return Promise.reject(connectivityError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Ejemplo: Cambiar el estado de un pedido usando axios
//
// import api from './axios';
//
// async function cambiarEstadoPedido(pedidoId, nuevoEstado, notas = '') {
//   try {
//     const response = await api.post(`/pedidos/${pedidoId}/cambiar_estado/`, {
//       estado_pedido: nuevoEstado,
//       notas: notas,
//     });
//     console.log('Pedido actualizado:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error('Error al cambiar el estado del pedido:', error.response?.data || error.message);
//     throw error;
//   }
// }
//
// // Uso:
// // cambiarEstadoPedido(123, 'enviado', 'Pedido despachado por mensajería.');
