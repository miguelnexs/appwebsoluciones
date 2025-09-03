import api from '../api/axios';

class PedidosAPI {
  async obtenerTodos(params = {}) {
    try {
      const response = await api.get('pedidos/', { params });
      return {
        success: true,
        results: response.data.results || response.data,
        count: response.data.count || (response.data.results ? response.data.results.length : response.data.length)
      };
    } catch (error) {
      console.error('Error obteniendo pedidos:', error);
      return {
        success: false,
        error: error.message,
        results: [],
        count: 0
      };
    }
  }

  async obtener(id) {
    try {
      const response = await api.get(`pedidos/${id}/`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error obteniendo pedido:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async crear(pedidoData) {
    try {
      const response = await api.post('pedidos/', pedidoData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creando pedido:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  async actualizar(id, pedidoData) {
    try {
      const response = await api.put(`pedidos/${id}/`, pedidoData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error actualizando pedido:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  async cambiarEstado(id, nuevoEstado) {
    try {
      const response = await api.patch(`pedidos/${id}/`, {
        estado: nuevoEstado
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error cambiando estado del pedido:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  async eliminar(id) {
    try {
      await api.delete(`pedidos/${id}/`);
      return {
        success: true,
        data: null
      };
    } catch (error) {
      console.error('Error eliminando pedido:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async obtenerEstadisticas() {
    try {
      const response = await api.get('pedidos/estadisticas/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de pedidos:', error);
      return {
        success: false,
        error: error.message,
        data: {
          total: 0,
          pendientes: 0,
          completados: 0,
          cancelados: 0
        }
      };
    }
  }
}

export default new PedidosAPI();