import api from '../api/axios';
import ventasAPI from './ventasAPI';
import clientesAPI from './clientesAPI';
import pedidosAPI from './pedidosAPI';

class ElectronAPI {
  constructor() {
    // Simular la estructura de electronAPI
    this.productos = {
      listar: this.listarProductos.bind(this),
      obtener: this.obtenerProducto.bind(this),
      crear: this.crearProducto.bind(this),
      actualizar: this.actualizarProducto.bind(this),
      eliminar: this.eliminarProducto.bind(this),
      // Funciones para colores
      obtenerColores: this.obtenerColores.bind(this),
      crearColor: this.crearColor.bind(this),
      actualizarColor: this.actualizarColor.bind(this),
      eliminarColor: this.eliminarColor.bind(this),
      // Funciones para imágenes
      obtenerImagenes: this.obtenerImagenes.bind(this),
      subirImagen: this.subirImagen.bind(this),
      eliminarImagen: this.eliminarImagen.bind(this),
      establecerImagenPrincipal: this.establecerImagenPrincipal.bind(this),
      // Funciones para características
      obtenerCaracteristicas: this.obtenerCaracteristicas.bind(this),
      crearCaracteristica: this.crearCaracteristica.bind(this),
      actualizarCaracteristica: this.actualizarCaracteristica.bind(this),
      eliminarCaracteristica: this.eliminarCaracteristica.bind(this),
      // Funciones adicionales
      buscar: this.buscarProductos.bind(this),
      reordenar: this.reordenarProductos.bind(this),
      limpiarCache: this.limpiarCache.bind(this),
      obtenerPorId: this.obtenerProductoPorId.bind(this),
      uploadImagenPrincipal: this.uploadImagenPrincipal.bind(this)
    };

    this.categorias = {
      listar: this.listarCategorias.bind(this),
      obtener: this.obtenerCategoria.bind(this),
      crear: this.crearCategoria.bind(this),
      actualizar: this.actualizarCategoria.bind(this),
      eliminar: this.eliminarCategoria.bind(this),
      // Funciones adicionales
      ensureGeneralCategory: this.ensureGeneralCategory.bind(this),
      ensureGeneral: this.ensureGeneralCategory.bind(this), // Alias
      reordenar: this.reordenarCategorias.bind(this),
      cleanupDuplicateGeneral: this.cleanupDuplicateGeneral.bind(this)
    };

    this.pedidos = {
      obtenerTodos: pedidosAPI.obtenerTodos.bind(pedidosAPI),
      obtener: pedidosAPI.obtener.bind(pedidosAPI),
      crear: pedidosAPI.crear.bind(pedidosAPI),
      actualizar: pedidosAPI.actualizar.bind(pedidosAPI),
      cambiarEstado: pedidosAPI.cambiarEstado.bind(pedidosAPI),
      eliminar: pedidosAPI.eliminar.bind(pedidosAPI)
    };

    this.ventas = {
      on: this.onVentaEvent.bind(this),
      off: this.offVentaEvent.bind(this)
    };
  }

  // Métodos para productos
  async listarProductos(params = {}) {
    try {
      const response = await api.get('productos/productos/', { params });
      return {
        success: true,
        results: response.data.results || response.data,
        count: response.data.count || (response.data.results ? response.data.results.length : response.data.length)
      };
    } catch (error) {
      console.error('Error listando productos:', error);
      return {
        success: false,
        error: error.message,
        results: [],
        count: 0
      };
    }
  }

  async obtenerProducto(id) {
    try {
      const response = await api.get(`productos/productos/${id}/`);
      return {
        success: true,
        product: response.data
      };
    } catch (error) {
      console.error('Error obteniendo producto:', error);
      return {
        success: false,
        error: error.message,
        product: null
      };
    }
  }

  async crearProducto(productoData) {
    try {
      // Si hay imagen_principal, crear FormData
      if (productoData.imagen_principal && productoData.imagen_principal instanceof File) {
        const formData = new FormData();
        
        // Agregar todos los campos del producto excepto la imagen
        Object.keys(productoData).forEach(key => {
          if (key !== 'imagen_principal') {
            formData.append(key, productoData[key]);
          }
        });
        
        // Agregar la imagen
        formData.append('imagen_principal', productoData.imagen_principal);
        
        const response = await api.post('productos/productos/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        return {
          success: true,
          producto: response.data
        };
      } else {
        // Si no hay imagen, enviar como JSON normal
        const response = await api.post('productos/productos/', productoData);
        return {
          success: true,
          producto: response.data
        };
      }
    } catch (error) {
      console.error('Error creando producto:', error);
      throw error;
    }
  }

  async actualizarProducto(id, productoData) {
    try {
      console.log('🔍 DEBUG actualizarProducto - ID:', id);
      console.log('🔍 DEBUG actualizarProducto - productoData:', {
        ...productoData,
        imagen_principal: productoData.imagen_principal ? {
          name: productoData.imagen_principal.name,
          type: productoData.imagen_principal.type,
          size: productoData.imagen_principal.size,
          isFile: productoData.imagen_principal instanceof File
        } : 'NO_IMAGE'
      });
      
      // Si hay imagen_principal, crear FormData
      if (productoData.imagen_principal && productoData.imagen_principal instanceof File) {
        console.log('✅ Usando FormData para actualización con imagen');
        const formData = new FormData();
        
        // Limpiar y agregar todos los campos excepto la imagen
        Object.keys(productoData).forEach(key => {
          if (key !== 'imagen_principal') {
            let value = productoData[key];
            
            // Convertir campos numéricos
             if (key === 'precio') {
               value = parseFloat(value) || 0;
             } else if (key === 'precio_comparacion') {
               const precioComparacion = parseFloat(value) || 0;
               const precioBase = parseFloat(productoData.precio) || 0;
               
               // Solo agregar precio_comparacion si es mayor que precio
               if (precioComparacion > precioBase && precioComparacion > 0) {
                 value = precioComparacion;
               } else {
                 console.log('🚫 precio_comparacion omitido en FormData (debe ser mayor que precio)');
                 return; // Skip this field
               }
             } else if (key === 'stock') {
               value = parseInt(value) || 0;
             }
            
            console.log(`📝 Agregando campo ${key}:`, value);
            formData.append(key, value);
          }
        });
        
        // Agregar la imagen
        console.log('🖼️ Agregando imagen_principal:', {
          name: productoData.imagen_principal.name,
          type: productoData.imagen_principal.type,
          size: productoData.imagen_principal.size
        });
        formData.append('imagen_principal', productoData.imagen_principal);
        
        console.log('🚀 Enviando PUT con FormData a:', `productos/productos/${id}/`);
        const response = await api.put(`productos/productos/${id}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log('✅ Respuesta exitosa:', response.data);
        return response.data;
      } else {
        console.log('📄 Usando JSON para actualización sin imagen');
        // Limpiar campos problemáticos antes del envío
        const cleanData = { ...productoData };
        
        // Convertir otros campos numéricos
         if (cleanData.precio) {
           cleanData.precio = parseFloat(cleanData.precio) || 0;
         }
         
         // Validar precio_comparacion - debe ser mayor que precio o se elimina
         if (cleanData.precio_comparacion) {
           const precioComparacion = parseFloat(cleanData.precio_comparacion) || 0;
           const precioBase = parseFloat(cleanData.precio) || 0;
           
           if (precioComparacion > precioBase && precioComparacion > 0) {
             cleanData.precio_comparacion = precioComparacion;
           } else {
             // Si precio_comparacion no es válido, eliminarlo del payload
             delete cleanData.precio_comparacion;
             console.log('🚫 precio_comparacion eliminado (debe ser mayor que precio)');
           }
         } else {
           // Si no hay precio_comparacion, asegurarse de que no esté en el payload
           delete cleanData.precio_comparacion;
         }
        if (cleanData.stock) {
          cleanData.stock = parseInt(cleanData.stock) || 0;
        }
        
        console.log('🚀 Enviando PUT con JSON a:', `productos/productos/${id}/`);
        console.log('📋 Datos limpios:', cleanData);
        const response = await api.put(`productos/productos/${id}/`, cleanData);
        console.log('✅ Respuesta exitosa:', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('❌ Error actualizando producto:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  }

  async eliminarProducto(id) {
    try {
      await api.delete(`productos/productos/${id}/`);
      return {
        success: true,
        data: null
      };
    } catch (error) {
      console.error('Error eliminando producto:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Métodos para categorías
  async listarCategorias(params = {}) {
    try {
      const response = await api.get('categorias/', { params });
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error listando categorías:', error);
      return [];
    }
  }

  async obtenerCategoria(id) {
    try {
      const response = await api.get(`categorias/${id}/`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error obteniendo categoría:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async crearCategoria(categoriaData) {
    try {
      const response = await api.post('categorias/', categoriaData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creando categoría:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  async actualizarCategoria(id, categoriaData) {
    try {
      const response = await api.put(`categorias/${id}/`, categoriaData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error actualizando categoría:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  async eliminarCategoria(id) {
    try {
      await api.delete(`categorias/${id}/`);
      return {
        success: true,
        data: null
      };
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Funciones adicionales de categorías
  async ensureGeneralCategory() {
    try {
      const response = await api.post('categorias/ensure-general/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error asegurando categoría general:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  async reordenarCategorias(params = {}) {
    try {
      const response = await api.post('categorias/reordenar/', params);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error reordenando categorías:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async cleanupDuplicateGeneral() {
    try {
      const response = await api.post('categorias/cleanup-duplicate-general/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error limpiando categorías generales duplicadas:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  // Métodos para colores de productos
  async obtenerColores(productoId) {
    try {
      const response = await api.get(`productos/productos/${productoId}/colores/`);
      return {
        success: true,
        data: response.data.results || response.data
      };
    } catch (error) {
      console.error('Error obteniendo colores:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  async crearColor(productoId, colorData) {
    try {
      console.log('🎨 DEBUG crearColor - productoId:', productoId);
      console.log('🎨 DEBUG crearColor - colorData:', colorData);
      console.log('🎨 DEBUG crearColor - URL:', `productos/productos/${productoId}/colores/`);
      
      // Preparar datos del color como form-urlencoded (igual que Electron)
      const colorFormData = {
        producto: productoId,
        nombre: colorData.nombre,
        hex_code: colorData.hex_code || colorData.codigo_color, // Usar hex_code como en Electron
        stock: colorData.stock || 0,
        orden: colorData.orden || 1,
        activo: colorData.activo !== undefined ? colorData.activo : true,
        es_principal: colorData.es_principal || false
      };
      
      console.log('🎨 DEBUG colorFormData preparado:', colorFormData);
      
      // Convertir a URLSearchParams para form-urlencoded
      const params = new URLSearchParams();
      Object.keys(colorFormData).forEach(key => {
        if (colorFormData[key] !== undefined && colorFormData[key] !== null) {
          params.append(key, colorFormData[key].toString());
        }
      });
      
      console.log('🎨 DEBUG params string:', params.toString());
      
      const response = await api.post(`productos/productos/${productoId}/colores/`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      console.log('✅ crearColor - Respuesta exitosa:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error creando color:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error headers:', error.response?.headers);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  async actualizarColor(productoId, colorId, colorData) {
    try {
      console.log('🎨 DEBUG actualizarColor - productoId:', productoId);
      console.log('🎨 DEBUG actualizarColor - colorId:', colorId);
      console.log('🎨 DEBUG actualizarColor - colorData:', colorData);
      
      // Preparar datos del color como form-urlencoded (igual que Electron)
      const colorFormData = {
        nombre: colorData.nombre,
        hex_code: colorData.hex_code || colorData.codigo_color, // Usar hex_code como en Electron
        stock: colorData.stock || 0,
        orden: colorData.orden || 1,
        activo: colorData.activo !== undefined ? colorData.activo : true,
        es_principal: colorData.es_principal || false
      };
      
      console.log('🎨 DEBUG colorFormData preparado:', colorFormData);
      
      // Convertir a URLSearchParams para form-urlencoded
      const params = new URLSearchParams();
      Object.keys(colorFormData).forEach(key => {
        if (colorFormData[key] !== undefined && colorFormData[key] !== null) {
          params.append(key, colorFormData[key].toString());
        }
      });
      
      console.log('🎨 DEBUG params string:', params.toString());
      
      const response = await api.put(`productos/productos/${productoId}/colores/${colorId}/`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      console.log('✅ actualizarColor - Respuesta exitosa:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error actualizando color:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  async eliminarColor(productoId, colorId) {
    try {
      await api.delete(`productos/productos/${productoId}/colores/${colorId}/`);
      return {
        success: true,
        data: null
      };
    } catch (error) {
      console.error('Error eliminando color:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Métodos para imágenes de colores
  async obtenerImagenes(colorId) {
    try {
      const response = await api.get(`productos/colores/${colorId}/imagenes/`);
      return {
        success: true,
        data: response.data.results || response.data
      };
    } catch (error) {
      console.error('Error obteniendo imágenes:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  async subirImagen(colorId, imageData) {
    try {
      const response = await api.post(`productos/colores/${colorId}/imagenes/`, imageData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  async eliminarImagen(colorId, imagenId) {
    try {
      await api.delete(`productos/colores/${colorId}/imagenes/${imagenId}/`);
      return {
        success: true,
        data: null
      };
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async establecerImagenPrincipal(colorId, imagenId) {
    try {
      const response = await api.patch(`productos/colores/${colorId}/imagenes/${imagenId}/principal/`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error estableciendo imagen principal:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Métodos para características de productos
  async obtenerCaracteristicas(productoId) {
    try {
      const response = await api.get(`productos/productos/${productoId}/caracteristicas/`);
      return {
        success: true,
        data: response.data.results || response.data
      };
    } catch (error) {
      console.error('Error obteniendo características:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  async crearCaracteristica(productoId, caracteristicaData) {
    try {
      const response = await api.post(`productos/productos/${productoId}/caracteristicas/`, caracteristicaData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creando característica:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  async actualizarCaracteristica(productoId, caracteristicaId, caracteristicaData) {
    try {
      const response = await api.put(`productos/productos/${productoId}/caracteristicas/${caracteristicaId}/`, caracteristicaData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error actualizando característica:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  async eliminarCaracteristica(productoId, caracteristicaId) {
    try {
      await api.delete(`productos/productos/${productoId}/caracteristicas/${caracteristicaId}/`);
      return {
        success: true,
        data: null
      };
    } catch (error) {
      console.error('Error eliminando característica:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Funciones adicionales de productos
  async buscarProductos(params = {}) {
    try {
      const response = await api.get('productos/productos/buscar/', { params });
      return {
        success: true,
        results: response.data.results || response.data,
        count: response.data.count || (response.data.results ? response.data.results.length : response.data.length)
      };
    } catch (error) {
      console.error('Error buscando productos:', error);
      return {
        success: false,
        error: error.message,
        results: [],
        count: 0
      };
    }
  }

  async reordenarProductos(params = {}) {
    try {
      const response = await api.post('productos/productos/reordenar/', params);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error reordenando productos:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async limpiarCache() {
    try {
      // En la versión web, simplemente retornamos éxito
      // ya que no hay caché real que limpiar
      return {
        success: true,
        message: 'Caché limpiado correctamente'
      };
    } catch (error) {
      console.error('Error limpiando caché:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async obtenerProductoPorId(productId) {
    try {
      const response = await api.get(`productos/productos/${productId}/`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error obteniendo producto por ID:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async uploadImagenPrincipal(params = {}) {
    try {
      const { productId, imageData } = params;
      const response = await api.post(`productos/productos/${productId}/imagen-principal/`, imageData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error subiendo imagen principal:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  // Simulación de eventos de ventas
  onVentaEvent(event, callback) {
    // En la versión web, no hay eventos reales de Electron
    // Retornar una función de cleanup vacía
    return () => {};
  }

  offVentaEvent(event, callback) {
    // En la versión web, no hay eventos reales de Electron
    return () => {};
  }
}

export default new ElectronAPI();