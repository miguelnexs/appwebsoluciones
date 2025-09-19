import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = 'http://softwarebycg.shop/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autorización
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el token expiró (401) y no hemos intentado refrescar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/usuarios/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Reintentar la petición original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Si el refresh token también expiró, limpiar storage y redirigir
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Tipos para las respuestas de la API
export interface LoginResponse {
  success: boolean;
  message: string;
  tokens?: {
    access: string;
    refresh: string;
  };
  user?: {
    id: number;
    username: string;
    email: string;
    nombre_completo: string;
    rol: string;
    es_activo: boolean;
  };
  errors?: any;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: any;
}

// Interfaces para productos
export interface BackendProduct {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  imagen?: string;
  imagen_principal_url?: string;
  categoria: {
    id: number;
    nombre: string;
  };
  tienda: {
    id: number;
    nombre: string;
  };
  stock: number;
  es_activo: boolean;
  fecha_creacion: string;
  slug?: string;
  tipo?: string;
  estado?: string;
}

export interface ProductsResponse {
  success: boolean;
  data: BackendProduct[];
  message?: string;
}

// Servicios de autenticación
export const authService = {
  // Login
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post('/usuarios/login/', {
        username,
        password,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/usuarios/logout/', {
          refresh_token: refreshToken,
        });
      }
    } catch (error) {
      console.error('Error durante logout:', error);
    } finally {
      // Limpiar storage independientemente del resultado
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  // Verificar token
  verifyToken: async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return false;

      await api.get('/usuarios/profile/');
      return true;
    } catch (error) {
      return false;
    }
  },

  // Obtener perfil del usuario
  getProfile: async () => {
    try {
      const response = await api.get('/usuarios/profile/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Servicios de productos
export const productService = {
  // Obtener productos del usuario autenticado
  getMyProducts: async (): Promise<ProductsResponse> => {
    try {
      const response = await api.get('/productos/productos/?publicos=true&tipo=digital&estado=publicado');
      // Manejar respuesta paginada del backend
      let productosData = [];
      if (response.data && response.data.results) {
        productosData = response.data.results;
      } else if (Array.isArray(response.data)) {
        productosData = response.data;
      } else {
        productosData = [];
      }
      
      return {
        success: true,
        data: productosData
      };
    } catch (error: any) {
      console.error('Error al obtener productos:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Error al obtener productos'
      };
    }
  },

  // Obtener producto por ID
  getProductById: async (id: number): Promise<{ success: boolean; data?: BackendProduct; message?: string }> => {
    try {
      const response = await api.get(`/productos/productos/${id}/`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Error fetching product:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener el producto',
      };
    }
  },

  getProductBySlug: async (slug: string): Promise<{ success: boolean; data?: BackendProduct; message?: string }> => {
    try {
      const response = await api.get(`/productos/productos/${slug}/`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Error fetching product by slug:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener el producto',
      };
    }
  },
};

export default api;