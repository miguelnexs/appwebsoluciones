import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

interface UserStats {
  totalPedidos: number;
  totalGastado: number;
  pedidosRecientes: Array<{
    id: number;
    fecha: string;
    total: number;
    estado: string;
    productos: Array<{
      id: number;
      nombre: string;
      cantidad: number;
      precio: number;
    }>;
  }>;
  productosComprados: Array<{
    id: number;
    nombre: string;
    imagen?: string;
    categoria: string;
    vecesComprado: number;
    ultimaCompra: string;
  }>;
  categoriasPreferidas: Array<{
    categoria: string;
    cantidad: number;
    porcentaje: number;
  }>;
}

interface TiendaData {
  productos: Array<{
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen?: string;
    categoria: string;
    stock: number;
    activo: boolean;
  }>;
  categorias: Array<{
    id: number;
    nombre: string;
    descripcion?: string;
    imagen?: string;
    activa: boolean;
  }>;
  configuracion: {
    nombre: string;
    logo?: string;
    descripcion?: string;
    colores?: {
      primario: string;
      secundario: string;
    };
    contacto?: {
      telefono?: string;
      email?: string;
      direccion?: string;
      website?: string;
    };
  };
}

// Hook para obtener estadísticas del usuario
export const useUserStats = () => {
  const { user, tokens } = useAuth();

  return useQuery<UserStats>({
    queryKey: ['userStats', user?.id],
    queryFn: async () => {
      if (!tokens?.access) {
        throw new Error('No hay token de acceso');
      }

      const response = await axios.get(
        `${API_CONFIG.API_URL}/tienda/user-stats/`,
        {
          headers: {
            'Authorization': `Bearer ${tokens.access}`,
            'Content-Type': 'application/json',
          },
          timeout: API_CONFIG.TIMEOUT,
        }
      );

      return response.data;
    },
    enabled: !!user && !!tokens?.access,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
  });
};

// Hook para obtener datos de la tienda personalizada
export const useTiendaData = () => {
  const { user, tokens } = useAuth();

  return useQuery<TiendaData>({
    queryKey: ['tiendaData', user?.tienda?.id],
    queryFn: async () => {
      if (!tokens?.access || !user?.tienda?.id) {
        throw new Error('No hay token de acceso o tienda asociada');
      }

      const response = await axios.get(
        `${API_CONFIG.API_URL}/tienda/${user.tienda.id}/data/`,
        {
          headers: {
            'Authorization': `Bearer ${tokens.access}`,
            'Content-Type': 'application/json',
          },
          timeout: API_CONFIG.TIMEOUT,
        }
      );

      return response.data;
    },
    enabled: !!user?.tienda?.id && !!tokens?.access,
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 1,
  });
};

// Hook para obtener productos personalizados para el usuario
export const usePersonalizedProducts = () => {
  const { user, tokens } = useAuth();

  return useQuery({
    queryKey: ['personalizedProducts', user?.id],
    queryFn: async () => {
      if (!tokens?.access) {
        // Si no está autenticado, devolver productos generales
        const response = await axios.get(
          `${API_CONFIG.API_URL}/productos/`,
          {
            timeout: API_CONFIG.TIMEOUT,
          }
        );
        return response.data;
      }

      // Si está autenticado, obtener productos personalizados
      const response = await axios.get(
        `${API_CONFIG.API_URL}/productos/personalized/`,
        {
          headers: {
            'Authorization': `Bearer ${tokens.access}`,
            'Content-Type': 'application/json',
          },
          timeout: API_CONFIG.TIMEOUT,
        }
      );

      return response.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
    retry: 1,
  });
};

// Hook para obtener recomendaciones basadas en el historial del usuario
export const useRecommendations = () => {
  const { user, tokens } = useAuth();

  return useQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: async () => {
      if (!tokens?.access) {
        return [];
      }

      const response = await axios.get(
        `${API_CONFIG.API_URL}/productos/recommendations/`,
        {
          headers: {
            'Authorization': `Bearer ${tokens.access}`,
            'Content-Type': 'application/json',
          },
          timeout: API_CONFIG.TIMEOUT,
        }
      );

      return response.data;
    },
    enabled: !!user && !!tokens?.access,
    staleTime: 30 * 60 * 1000, // 30 minutos
    retry: 1,
  });
};