const { contextBridge, ipcRenderer } = require('electron');

// Utility function to safely prepare image files for IPC
const prepareImageFile = (imageFile) => {
  if (!imageFile) return null;

  try {
    let imageBuffer;
    if (imageFile.data instanceof Buffer) {
      imageBuffer = imageFile.data;
    } else if (imageFile.data instanceof Uint8Array) {
      imageBuffer = Buffer.from(imageFile.data);
    } else if (typeof imageFile.data === 'object' && imageFile.data.type === 'Buffer') {
      imageBuffer = Buffer.from(imageFile.data.data);
    } else if (typeof imageFile.data === 'string') {
      // Si viene como base64
      imageBuffer = Buffer.from(imageFile.data.split(',')[1], 'base64');
    } else {
      throw new Error('Formato de imagen no soportado');
    }
    return {
      name: String(imageFile.name || `image_${Date.now()}`),
      data: imageBuffer,
      type: String(imageFile.type || 'application/octet-stream'),
      size: Number(imageFile.size || imageBuffer.length),
      lastModified: Number(imageFile.lastModified || Date.now())
    };
  } catch (error) {
    throw new Error('Error al procesar la imagen: ' + error.message);
  }
};

// Enhanced API error handling system
const setupApiErrorHandling = () => {
  const errorListeners = new Set();

  const onError = (callback) => {
    if (typeof callback !== 'function') {
      return () => {};
    }

    const handler = (_, error) => {
      try {
        callback(error);
      } catch (err) {
        // Error silencioso
      }
    };

    errorListeners.add(handler);
    ipcRenderer.on('api-error', handler);

    return () => {
      errorListeners.delete(handler);
      ipcRenderer.off('api-error', handler);
    };
  };

  const removeAllErrorListeners = () => {
    errorListeners.forEach(handler => {
      ipcRenderer.off('api-error', handler);
    });
    errorListeners.clear();
  };

  return { onError, removeAllErrorListeners };
};

// Main API exposure with context isolation
const exposeElectronAPI = () => {
  const { onError, removeAllErrorListeners } = setupApiErrorHandling();

  // Helper function for safe IPC invocation with serialization
  const safeInvoke = (channel, ...args) => {
    try {
      // Serialize complex data before sending
      const serializedArgs = args.map(arg => {
        if (arg?.data && (arg.data instanceof Buffer || arg.data instanceof Uint8Array)) {
          const buffer = Buffer.isBuffer(arg.data) ? arg.data : Buffer.from(arg.data);
          return { ...arg, data: buffer.toJSON() };
        }
        return arg;
      });
      
      return ipcRenderer.invoke(channel, ...serializedArgs).then(result => {
        return result;
      }).catch(error => {
        const errorMsg = error.message || 'Error desconocido';
        const newError = new Error(errorMsg);
        newError.channel = channel;
        newError.originalError = error.name || 'Error';
        throw newError;
      });
    } catch (error) {
      throw error;
    }
  };

  const api = {
    // Categories API
    categorias: {
      listar: (params = {}) => safeInvoke('categorias:listar', params),
      ensureGeneral: () => safeInvoke('categorias:ensureGeneral'),
      cleanupDuplicateGeneral: () => safeInvoke('categorias:cleanupDuplicateGeneral'),
      obtener: (slug) => {
        if (!slug) throw new Error('Slug is required');
        return safeInvoke('categorias:obtener', slug);
      },
      crear: (categoriaData) => {
        if (!categoriaData?.nombre) throw new Error('Category name is required');
        return safeInvoke('categorias:crear', categoriaData);
      },
      actualizar: ({ slug, data }) => {
        if (!slug) throw new Error('Slug is required');
        return safeInvoke('categorias:actualizar', { slug, data });
      },
      eliminar: (slug) => {
        if (!slug) throw new Error('Slug is required');
        return safeInvoke('categorias:eliminar', slug);
      },
      reordenar: (ordenData) => {
        if (!ordenData) throw new Error('Order data is required');
        return safeInvoke('categorias:reordenar', ordenData);
      }
    },

    // Products API
    productos: {
      listar: (params = {}) => safeInvoke('productos:listar', params),
      obtener: (slug) => {
        if (!slug) throw new Error('Slug is required');
        return safeInvoke('productos:obtener', slug);
      },
      crear: (productoData) => {
        if (!productoData?.nombre) throw new Error('Product name is required');
        let payload = { ...productoData };
        if (productoData.imagen_principal) {
          try {
            payload.imagen_principal = prepareImageFile(productoData.imagen_principal);
          } catch (e) {
            // Error silencioso
          }
        }
        return safeInvoke('productos:crear', payload);
      },
      actualizar: (slug, productData) => {
        if (!slug) throw new Error('Slug is required');
        let payload = { ...productData };
        if (productData?.imagen_principal) {
          try {
            payload.imagen_principal = prepareImageFile(productData.imagen_principal);
          } catch (e) {
            // Error silencioso
          }
        }
        return safeInvoke('productos:actualizar', { slug, productData: payload });
      },
      eliminar: (slug) => {
        if (!slug) throw new Error('Slug is required');
        return safeInvoke('productos:eliminar', slug);
      },
      testUpdate: (slug, productData) => {
        if (!slug) throw new Error('Slug is required');
        return safeInvoke('productos:test-update', { slug, productData });
      },
      
      // Color handlers
      obtenerColores: (productId) => {
        if (!productId) throw new Error('Product ID is required');
        return safeInvoke('productos:obtenerColores', productId);
      },
      crearColor: (productId, colorData) => {
        if (!productId) throw new Error('Product ID is required');
        if (!colorData?.nombre) throw new Error('Color name is required');
        return safeInvoke('productos:crearColor', productId, colorData);
      },
      actualizarColor: (productId, colorId, colorData) => {
        if (!productId) throw new Error('Product ID is required');
        if (!colorId) throw new Error('Color ID is required');
        return safeInvoke('productos:actualizarColor', productId, colorId, colorData);
      },
      eliminarColor: (productId, colorId) => {
        if (!productId) throw new Error('Product ID is required');
        if (!colorId) throw new Error('Color ID is required');
        return safeInvoke('productos:eliminarColor', productId, colorId);
      },
      
      // Características handlers
      obtenerCaracteristicas: (productId) => {
        if (!productId) throw new Error('Product ID is required');
        return safeInvoke('productos:obtenerCaracteristicas', productId);
      },
      crearCaracteristica: (productId, caracteristicaData) => {
        if (!productId) throw new Error('Product ID is required');
        if (!caracteristicaData?.nombre) throw new Error('Characteristic name is required');
        return safeInvoke('productos:crearCaracteristica', productId, caracteristicaData);
      },
      actualizarCaracteristica: (productId, caracteristicaId, caracteristicaData) => {
        if (!productId) throw new Error('Product ID is required');
        if (!caracteristicaId) throw new Error('Characteristic ID is required');
        return safeInvoke('productos:actualizarCaracteristica', productId, caracteristicaId, caracteristicaData);
      },
      eliminarCaracteristica: (productId, caracteristicaId) => {
        if (!productId) throw new Error('Product ID is required');
        if (!caracteristicaId) throw new Error('Characteristic ID is required');
        return safeInvoke('productos:eliminarCaracteristica', productId, caracteristicaId);
      },
      
      // Image handlers
      obtenerImagenes: (colorId) => {
        if (!colorId) throw new Error('Color ID is required');
        return safeInvoke('productos:obtenerImagenes', colorId);
      },
      subirImagen: (colorId, formData) => {
        if (!colorId) throw new Error('Color ID is required');
        if (!formData?.imagen) throw new Error('Image is required');
        return safeInvoke('productos:subirImagen', colorId, formData);
      },
      eliminarImagen: (colorId, imagenId) => {
        if (!colorId) throw new Error('Color ID is required');
        if (!imagenId) throw new Error('Image ID is required');
        return safeInvoke('productos:eliminarImagen', colorId, imagenId);
      },
      establecerImagenPrincipal: (colorId, imagenId) => {
        if (!colorId) throw new Error('Color ID is required');
        if (!imagenId) throw new Error('Image ID is required');
        return safeInvoke('productos:establecerImagenPrincipal', colorId, imagenId);
      },
      reordenarImagenes: (colorId, ordenData) => {
        if (!colorId) throw new Error('Color ID is required');
        if (!ordenData) throw new Error('Order data is required');
        return safeInvoke('productos:reordenarImagenes', colorId, ordenData);
      },
      reordenar: (ordenData) => {
        if (!ordenData) throw new Error('Order data is required');
        return safeInvoke('productos:reordenar', ordenData);
      },
      uploadImagenPrincipal: ({ slug, imageFile }) => {
        if (!slug) throw new Error('Slug is required');
        if (!imageFile) throw new Error('Image file is required');
        const preparedImage = prepareImageFile(imageFile);
        return safeInvoke('upload-producto-imagen-principal', { slug, imageFile: preparedImage });
      },
      cargarProductosYCategorias: async (_opts = {}) => {
        const [productosRes, categoriasRes] = await Promise.allSettled([
          safeInvoke('productos:listar', { ordering: '-fecha_creacion' }),
          safeInvoke('categorias:listar', { ordering: 'orden,nombre' })
        ]);
        const products = productosRes.status === 'fulfilled' ? productosRes.value : [];
        const categories = categoriasRes.status === 'fulfilled' ? categoriasRes.value : [];
        return { products, categories };
      },
      limpiarCache: () => safeInvoke('productos:limpiarCache')
    },

    // Ventas API
    ventas: {
      obtenerEstadisticas: () => safeInvoke('ventas:obtener-resumen')
    },

    // Test API
    testUpload: (data) => {
      return safeInvoke('test-upload', data);
    },

    // Product Variants API
    variantes: {
      listarPorProducto: (productoSlug) => {
        if (!productoSlug) throw new Error('Product slug is required');
        return safeInvoke('get-variantes-producto', productoSlug);
      },
      crear: (productoSlug, varianteData) => {
        if (!productoSlug) throw new Error('Product slug is required');
        if (!varianteData?.nombre) throw new Error('Variant name is required');
        return safeInvoke('create-variante-producto', { productoSlug, varianteData });
      },
      actualizar: (id, cambios) => {
        if (!id) throw new Error('Variant ID is required');
        return safeInvoke('update-variante-producto', { id, varianteData: cambios });
      },
      eliminar: (id) => {
        if (!id) throw new Error('Variant ID is required');
        return safeInvoke('delete-variante-producto', id);
      }
    },

    // File System API
    archivos: {
      seleccionarImagen: async () => {
        try {
          const result = await safeInvoke('open-image-dialog');
          if (!result) return null;
          
          return {
            name: String(result.fileName || ''),
            path: String(result.filePath || ''),
            size: Number(result.size || 0),
            type: String(result.mimeType || 'application/octet-stream'),
            lastModified: Number(result.lastModified || Date.now()),
            data: new Uint8Array(result.data || [])
          };
        } catch (error) {
          return null;
        }
      },
      uint8ToBlob: (uint8Array, mimeType = 'application/octet-stream') => {
        try {
          if (!(uint8Array instanceof Uint8Array)) {
            throw new Error('Input must be a Uint8Array');
          }
          return new Blob([uint8Array], { type: String(mimeType) });
        } catch (error) {
          return null;
        }
      },
      createObjectURL: (blob) => {
        try {
          if (!(blob instanceof Blob)) {
            throw new Error('Input must be a Blob');
          }
          return URL.createObjectURL(blob);
        } catch (error) {
          return '';
        }
      },
      revokeObjectURL: (url) => {
        try {
          if (typeof url === 'string' && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        } catch (error) {
          // Error silencioso
        }
      }
    },

    // Event System
    eventos: {
      onError,
      limpiarListeners: removeAllErrorListeners
    },

    // Export API
    exportToExcel: (data) => safeInvoke('exportToExcel', data),
  };

  return api;
};

// Safe exposure with error handling
if (process.contextIsolated) {
  try {
    const electronAPI = exposeElectronAPI();
    contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  } catch (error) {
    // Fallback minimal API
    contextBridge.exposeInMainWorld('electronAPI', {
      error: 'Failed to initialize API',
      details: error.message,
      isFallback: true
    });
  }
} else {
  // Minimal API when context isolation is disabled
  window.electronAPI = {
    error: 'Context isolation is disabled',
    isFallback: true
  };
}

// APIs de ventas
contextBridge.exposeInMainWorld('ventasAPI', {
  obtenerProductos: () => ipcRenderer.invoke('ventas:obtener-productos'),
  buscarProductos: (query) => ipcRenderer.invoke('ventas:buscar-productos', query),
  obtenerClientes: () => ipcRenderer.invoke('ventas:obtener-clientes'),
  crearCliente: (clienteData) => ipcRenderer.invoke('ventas:crear-cliente', clienteData),
  crearVenta: (ventaData) => ipcRenderer.invoke('ventas:crear-venta', ventaData),
  obtenerVentas: () => ipcRenderer.invoke('ventas:obtener-ventas'),
  obtenerResumen: () => ipcRenderer.invoke('ventas:obtener-resumen'),
});

// APIs de clientes
contextBridge.exposeInMainWorld('clientesAPI', {
  obtenerTodos: () => ipcRenderer.invoke('clientes:obtener-todos'),
  obtenerPorId: (clienteId) => ipcRenderer.invoke('clientes:obtener-por-id', clienteId),
  crear: (clienteData) => ipcRenderer.invoke('clientes:crear', clienteData),
  crearRapido: (clienteData) => ipcRenderer.invoke('clientes:crear-rapido', clienteData),
  actualizar: (clienteId, clienteData) => ipcRenderer.invoke('clientes:actualizar', clienteId, clienteData),
  eliminar: (clienteId) => ipcRenderer.invoke('clientes:eliminar', clienteId),
  buscar: (query) => ipcRenderer.invoke('clientes:buscar', query),
  obtenerVentas: (clienteId) => ipcRenderer.invoke('clientes:obtener-ventas', clienteId),
  obtenerConVentas: (clienteId) => ipcRenderer.invoke('clientes:obtener-con-ventas', clienteId),
  obtenerEstadisticas: () => ipcRenderer.invoke('clientes:obtener-estadisticas'),
});

// APIs de pedidos
contextBridge.exposeInMainWorld('pedidosAPI', {
  obtenerTodos: (params = {}) => ipcRenderer.invoke('pedidos:obtener-todos', params),
  obtenerPorId: (pedidoId) => ipcRenderer.invoke('pedidos:obtener-por-id', pedidoId),
  crear: (pedidoData) => ipcRenderer.invoke('pedidos:crear', pedidoData),
  actualizar: (pedidoId, pedidoData) => ipcRenderer.invoke('pedidos:actualizar', pedidoId, pedidoData),
  eliminar: (pedidoId) => ipcRenderer.invoke('pedidos:eliminar', pedidoId),
  cambiarEstado: (pedidoId, estadoData) => ipcRenderer.invoke('pedidos:cambiar-estado', pedidoId, estadoData),
  obtenerHistorial: (pedidoId) => ipcRenderer.invoke('pedidos:obtener-historial', pedidoId),
  obtenerEstadisticas: () => ipcRenderer.invoke('pedidos:obtener-estadisticas'),
  buscar: (query) => ipcRenderer.invoke('pedidos:buscar', query),
});

// APIs de PDF e impresión
contextBridge.exposeInMainWorld('pdfAPI', {
  imprimir: (pdfBlob, fileName) => ipcRenderer.invoke('pdf:print', pdfBlob, fileName),
  guardar: (pdfBlob, fileName) => ipcRenderer.invoke('pdf:save', pdfBlob, fileName),
  imprimirRecibo: (ventaData) => ipcRenderer.invoke('venta:imprimir-recibo', ventaData),
  obtenerImpresoraPorDefecto: () => ipcRenderer.invoke('printer:get-default'),
  listarImpresoras: () => ipcRenderer.invoke('printer:list'),
});
