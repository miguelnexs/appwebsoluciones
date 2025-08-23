import axios from 'axios';
import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.API_URL;

export interface VentaRapidaData {
  cliente: {
    nombre: string;
    telefono: string;
    email: string;
    tipo_documento: string;
    numero_documento: string;
    direccion: string;
  };
  items: Array<{
    producto: number;
    cantidad: number;
    color?: string;
    variante?: string;
  }>;
  metodo_pago: string;
  observaciones?: string;
}

export const ventaService = {
  crearVentaRapida: async (data: VentaRapidaData) => {
    try {
      const response = await axios.post(`${API_URL}/ventas/crear_venta_rapida/`, data);
      return response.data;
    } catch (error) {
      console.error('Error al crear venta rápida:', error);
      throw error;
    }
  },
};