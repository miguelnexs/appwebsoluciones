import axios from 'axios';
import { API_CONFIG } from '../config/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    tienda?: {
      id: number;
      nombre: string;
      logo?: string;
      descripcion?: string;
      direccion?: string;
      telefono?: string;
      email?: string;
      website?: string;
    };
  };
}

export interface RefreshTokenResponse {
  access: string;
}

class AuthService {
  private baseURL = API_CONFIG.API_URL;

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/auth/token/`,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Credenciales incorrectas');
        } else if (error.response?.status === 400) {
          throw new Error('Datos de login inválidos');
        } else if (error.response?.status >= 500) {
          throw new Error('Error del servidor. Intenta más tarde');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Tiempo de espera agotado. Verifica tu conexión');
        } else if (!error.response) {
          throw new Error('No se pudo conectar al servidor');
        }
      }
      throw new Error('Error inesperado durante el login');
    }
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/auth/token/refresh/`,
        { refresh: refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Token de actualización inválido');
        }
      }
      throw new Error('Error al actualizar el token');
    }
  }

  async getUserProfile(accessToken: string): Promise<LoginResponse['user']> {
    try {
      const response = await axios.get(
        `${this.baseURL}/auth/user/profile/`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Token de acceso inválido');
        }
      }
      throw new Error('Error al obtener el perfil del usuario');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseURL}/auth/token/blacklist/`,
        { refresh: refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: API_CONFIG.TIMEOUT,
        }
      );
    } catch (error) {
      // Ignorar errores de logout, ya que el token local se eliminará de todos modos
      console.warn('Error durante el logout:', error);
    }
  }

  // Validar si un token está expirado
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true; // Si no se puede decodificar, considerarlo expirado
    }
  }
}

export const authService = new AuthService();
export default authService;