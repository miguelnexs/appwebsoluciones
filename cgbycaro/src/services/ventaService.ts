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
    producto_id: number;
    cantidad: number;
    color_id?: number;
    precio_unitario: number;
  }>;
  metodo_pago: string;
  observaciones?: string;
}

export const ventaService = {
  crearVentaRapida: async (data: VentaRapidaData) => {
    try {
      // Preparar los datos según el formato esperado por el endpoint /api/pedidos/procesar/
      const pedidoData = {
        cliente: data.cliente,
        pedido: {
          tipo_venta: 'digital',
          direccion_entrega: data.cliente.direccion,
          telefono_contacto: data.cliente.telefono,
          instrucciones_entrega: data.observaciones || '',
          metodo_pago: data.metodo_pago,
          notas: data.observaciones || ''
        },
        items: data.items
      };

      const response = await axios.post(`${API_URL}/pedidos/procesar/`, pedidoData);
      return response.data;
    } catch (error) {
      console.error('Error al crear venta rápida:', error);
      throw error;
    }
  },
};