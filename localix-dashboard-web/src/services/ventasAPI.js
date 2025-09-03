import api from '../api/axios';

class VentasAPI {
  async obtenerResumen() {
    try {
      const response = await api.get('ventas/resumen/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error obteniendo resumen de ventas:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async obtenerVentas(params = {}) {
    try {
      const response = await api.get('ventas/', { params });
      return {
        success: true,
        data: response.data.results || response.data
      };
    } catch (error) {
      console.error('Error obteniendo ventas:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  async obtenerProductos(params = {}) {
    try {
      const response = await api.get('productos/productos/', { params });
      return {
        success: true,
        data: response.data.results || response.data
      };
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  async buscarProductos(query) {
    try {
      const response = await api.get('productos/productos/buscar/', { 
        params: { q: query } 
      });
      return {
        success: true,
        data: response.data.results || response.data
      };
    } catch (error) {
      console.error('Error buscando productos:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  async crearVenta(ventaData) {
    try {
      // Intentar primero con el endpoint de venta rápida
      const response = await api.post('ventas/crear_venta_rapida/', ventaData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creando venta con crear_venta_rapida:', error);
      
      // Si falla, intentar con el endpoint estándar del ModelViewSet
      try {
        const fallbackResponse = await api.post('ventas/', ventaData);
        return {
          success: true,
          data: fallbackResponse.data
        };
      } catch (fallbackError) {
        console.error('Error creando venta con endpoint estándar:', fallbackError);
        return {
          success: false,
          error: fallbackError.response?.data?.message || fallbackError.message,
          data: null
        };
      }
    }
  }

  async obtenerVenta(id) {
    try {
      const response = await api.get(`ventas/${id}/`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error obteniendo venta:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async actualizarVenta(id, ventaData) {
    try {
      const response = await api.put(`ventas/${id}/`, ventaData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error actualizando venta:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async eliminarVenta(id) {
    try {
      await api.delete(`ventas/${id}/`);
      return {
        success: true,
        data: null
      };
    } catch (error) {
      console.error('Error eliminando venta:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async obtenerEstadisticas() {
    try {
      const response = await api.get('ventas/estadisticas/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de ventas:', error);
      return {
        success: false,
        error: error.message,
        data: {
          totalVentas: 0,
          ventasHoy: 0,
          ventasSemana: 0,
          ventasMes: 0,
          ingresosTotales: 0,
          ingresosHoy: 0,
          ingresosSemana: 0,
          ingresosMes: 0
        }
      };
    }
  }
}

export default new VentasAPI();