const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://softwarebycg.shop/api';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface LoginResponse {
  user: User & {
    api_key?: string;
    allow_public_access?: boolean;
  };
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  slug: string;
  categoria_nombre?: string;
  categoria?: number;
  stock?: number;
  imagen_principal?: string;
  colores?: Array<{
    id: number;
    nombre: string;
    codigo_hex: string;
    stock: number;
  }>;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  slug: string;
  activa: boolean;
  orden?: number;
  imagen?: string;
  cantidad_productos?: number;
}

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getApiKey(): string | null {
    return localStorage.getItem('api_key');
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Para endpoints públicos, usar API Key si está disponible
    if (endpoint.startsWith('/public/')) {
      const apiKey = this.getApiKey();
      if (apiKey) {
        defaultHeaders['Authorization'] = `Bearer ${apiKey}`;
      }
    } else {
      // Para endpoints privados, usar JWT token
      const token = this.getAuthToken();
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error making request to ${url}:`, error);
      throw error;
    }
  }

  // Método para autenticación con JWT tokens
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await this.makeRequest<LoginResponse>('/usuarios/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      
      // Guardar tokens en localStorage
      if (response.tokens) {
        localStorage.setItem('access_token', response.tokens.access);
        localStorage.setItem('refresh_token', response.tokens.refresh);
      }

      // Guardar API key si está disponible
      if (response.user.api_key) {
        localStorage.setItem('api_key', response.user.api_key);
      }
      
      return response;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  // Método para refresh token
  async refreshToken(): Promise<{ access: string }> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.makeRequest<{ access: string }>('/auth/token/refresh/', {
        method: 'POST',
        body: JSON.stringify({ refresh: refreshToken }),
      });
      
      // Actualizar access token
      localStorage.setItem('access_token', response.access);
      
      return response;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Si el refresh falla, limpiar tokens
      this.logout();
      throw error;
    }
  }

  // Método para logout
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('api_key');
  }

  // Productos
  async getProductos(params?: {
    page?: number;
    search?: string;
    categoria?: number;
    ordering?: string;
  }): Promise<ApiResponse<Producto>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.categoria) searchParams.append('categoria', params.categoria.toString());
    if (params?.ordering) searchParams.append('ordering', params.ordering);

    const queryString = searchParams.toString();
    const endpoint = `/public/productos/${queryString ? `?${queryString}` : ''}`;
    
    try {
      return await this.makeRequest<ApiResponse<Producto>>(endpoint);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      // Si falla con endpoint público, intentar con endpoint privado
      try {
        const privateEndpoint = `/productos/${queryString ? `?${queryString}` : ''}`;
        return await this.makeRequest<ApiResponse<Producto>>(privateEndpoint);
      } catch (privateError) {
        console.error('Error al obtener productos (endpoint privado):', privateError);
        throw error; // Lanzar el error original
      }
    }
  }

  async getProducto(slug: string): Promise<Producto> {
    try {
      // Intentar primero con endpoint público
      return await this.makeRequest<Producto>(`/public/productos/${slug}/`);
    } catch (error) {
      console.error('Error al obtener producto (endpoint público):', error);
      // Si falla con endpoint público, intentar con endpoint privado
      try {
        return await this.makeRequest<Producto>(`/productos/${slug}/`);
      } catch (privateError) {
        console.error('Error al obtener producto (endpoint privado):', privateError);
        throw error; // Lanzar el error original
      }
    }
  }

  // Categorías
  async getCategorias(): Promise<Categoria[]> {
    try {
      const response = await this.makeRequest<ApiResponse<Categoria>>('/public/categorias/?activa=true');
      return response.results || [];
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      // Si falla con endpoint público, intentar con endpoint privado
      try {
        const privateResponse = await this.makeRequest<ApiResponse<Categoria>>('/categorias/?activa=true');
        return privateResponse.results || [];
      } catch (privateError) {
        console.error('Error al obtener categorías (endpoint privado):', privateError);
        throw error; // Lanzar el error original
      }
    }
  }

  async getCategoria(id: number): Promise<Categoria> {
    return this.makeRequest<Categoria>(`/public/categorias/${id}/`);
  }

  // Información del sistema
  async getApiInfo(): Promise<any> {
    return this.makeRequest<any>('/public/');
  }
}

export const apiService = new ApiService();