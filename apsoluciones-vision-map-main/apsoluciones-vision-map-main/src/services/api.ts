const API_BASE_URL = 'http://softwarebycg.shop/api';

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
    // Obtener el token del usuario autenticado desde localStorage
    const userData = localStorage.getItem('apsoluciones_user');
    if (userData) {
      const user = JSON.parse(userData);
      // Para este caso, usaremos el token del backend de Django
      return localStorage.getItem('token');
    }
    return null;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Agregar token de autenticación si existe
    const token = this.getAuthToken();
    if (token) {
      defaultHeaders['Authorization'] = `Token ${token}`;
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

  // Método para autenticación con el backend de Django
  async login(username: string, password: string): Promise<{ token: string; user: any } | null> {
    try {
      const response = await this.makeRequest<{ token: string; user: any }>('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      
      // Guardar el token en localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      return response;
    } catch (error) {
      console.error('Error en login:', error);
      return null;
    }
  }

  // Método para logout
  logout(): void {
    localStorage.removeItem('token');
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
    const endpoint = `/productos/${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<ApiResponse<Producto>>(endpoint);
  }

  async getProducto(slug: string): Promise<Producto> {
    return this.makeRequest<Producto>(`/productos/${slug}/`);
  }

  // Categorías
  async getCategorias(): Promise<Categoria[]> {
    const response = await this.makeRequest<ApiResponse<Categoria>>('/categorias/?activa=true');
    return response.results || [];
  }

  async getCategoria(id: number): Promise<Categoria> {
    return this.makeRequest<Categoria>(`/categorias/${id}/`);
  }

  // Información del sistema
  async getApiInfo(): Promise<any> {
    return this.makeRequest<any>('/');
  }
}

export const apiService = new ApiService();