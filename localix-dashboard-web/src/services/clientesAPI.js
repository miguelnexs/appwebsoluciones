import api from '../api/axios';

class ClientesAPI {
  async obtenerTodos(params = {}) {
    try {
      const response = await api.get('ventas/clientes/', { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error obteniendo clientes:', error);
      return {
        success: false,
        error: error.message,
        data: { results: [] }
      };
    }
  }

  async obtener(id) {
    try {
      const response = await api.get(`ventas/clientes/${id}/`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error obteniendo cliente:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async crear(clienteData) {
    try {
      const response = await api.post('ventas/clientes/', clienteData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creando cliente:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  async crearRapido(clienteData) {
    try {
      // Para creación rápida, usar el mismo endpoint pero con datos mínimos
      const response = await api.post('ventas/clientes/', {
        ...clienteData,
        is_active: true
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creando cliente rápido:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  async actualizar(id, clienteData) {
    try {
      const response = await api.put(`ventas/clientes/${id}/`, clienteData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error actualizando cliente:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  async eliminar(id) {
    try {
      await api.delete(`ventas/clientes/${id}/`);
      return {
        success: true,
        data: null
      };
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async buscar(query, params = {}) {
    try {
      const response = await api.get('ventas/clientes/', {
        params: {
          search: query,
          ...params
        }
      });
      return {
        success: true,
        data: response.data.results || response.data
      };
    } catch (error) {
      console.error('Error buscando clientes:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }
}

export default new ClientesAPI();