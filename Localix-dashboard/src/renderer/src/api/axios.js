import axios from 'axios';
import { API_URL } from './apiConfig';

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
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // No redirigir automáticamente, dejar que AuthContext maneje los errores 401
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