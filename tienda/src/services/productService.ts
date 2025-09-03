import axios from 'axios';
import { API_CONFIG } from '../config/api';

export interface ColorProducto {
  id: number;
  nombre: string;
  hex_code: string;
  stock: number;
  activo: boolean;
  es_principal: boolean;
  imagenes?: Array<{
    id: number;
    url_imagen: string;
    es_principal: boolean;
  }>;
}

export interface CaracteristicaProducto {
  id: number;
  nombre: string;
  valor: string;
  orden: number;
  activo: boolean;
}

export const productService = {
  // Obtener colores de un producto
  obtenerColores: async (productoId: number): Promise<ColorProducto[]> => {
    try {
      const response = await axios.get(
        `${API_CONFIG.API_URL}/productos/productos/${productoId}/colores/`,
        {
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      
      // Manejar respuesta paginada del backend
      let coloresData = [];
      if (response.data && response.data.results) {
        coloresData = response.data.results;
      } else if (Array.isArray(response.data)) {
        coloresData = response.data;
      } else {
        coloresData = [];
      }
      
      // Filtrar solo colores activos
      return coloresData.filter((color: ColorProducto) => color.activo);
    } catch (error) {
      console.warn(`No se pudieron obtener colores para producto ${productoId}:`, error);
      return [];
    }
  },

  // Obtener colores públicos de un producto (endpoint específico para la tienda)
  obtenerColoresPublicos: async (productoId: number): Promise<ColorProducto[]> => {
    try {
      const response = await axios.get(
        `${API_CONFIG.API_URL}/productos/productos/${productoId}/colores/publico/`,
        {
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      // Si no existe el endpoint público, usar el endpoint normal
      return await productService.obtenerColores(productoId);
    }
  },

  // Obtener características de un producto
  obtenerCaracteristicas: async (productoId: number): Promise<CaracteristicaProducto[]> => {
    try {
      const response = await axios.get(
        `${API_CONFIG.API_URL}/productos/productos/${productoId}/caracteristicas-publico/`,
        {
          timeout: API_CONFIG.TIMEOUT,
        }
      );
      
      // Manejar respuesta paginada del backend
      let caracteristicasData = [];
      if (response.data && response.data.results) {
        caracteristicasData = response.data.results;
      } else if (Array.isArray(response.data)) {
        caracteristicasData = response.data;
      } else {
        caracteristicasData = [];
      }
      
      // Filtrar solo características activas y ordenar
      return caracteristicasData
        .filter((caracteristica: CaracteristicaProducto) => caracteristica.activo)
        .sort((a: CaracteristicaProducto, b: CaracteristicaProducto) => a.orden - b.orden);
    } catch (error) {
      console.warn(`No se pudieron obtener características para producto ${productoId}:`, error);
      return [];
    }
  }
};