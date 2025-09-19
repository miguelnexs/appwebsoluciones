const { ipcMain, app, BrowserWindow } = require('electron');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');
const querystring = require('querystring');
const { handleApiError, API_BASE_URL } = require('./apiErrorHandler');
const { buildFormData } = require('./handlerUtils');
const sharp = require('sharp');
const crypto = require('crypto');

// Función para obtener el token de autenticación
async function getAuthToken() {
  try {
    const windows = BrowserWindow.getAllWindows();
    
    if (windows.length > 0) {
      const mainWindow = windows[0];
      const token = await mainWindow.webContents.executeJavaScript(`
        localStorage.getItem('access_token')
      `);
      return token;
    }
    return null;
  } catch (error) {
    console.warn('No se pudo obtener el token de autenticación:', error.message);
    return null;
  }
}

// Función para crear configuración de axios con autenticación
async function createAuthenticatedConfig() {
  const token = await getAuthToken();
  
  const config = {
    headers: {
      'Accept': 'application/json',
      'Cache-Control': 'no-cache'
    },
    maxContentLength: 50 * 1024 * 1024, // 50MB
    maxBodyLength: 50 * 1024 * 1024,    // 50MB
    timeout: 30000 // 30 segundos
  };
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}

// Cache simple para evitar llamadas repetitivas
const apiCache = new Map();
const CACHE_DURATION = 30000; // 30 segundos

// Configuración mejorada para Axios
const AXIOS_CONFIG = {
  headers: {
    'Accept': 'application/json',
    'Cache-Control': 'no-cache'
  },
  maxContentLength: 50 * 1024 * 1024, // 50MB
  maxBodyLength: 50 * 1024 * 1024,    // 50MB
  timeout: 30000 // 30s por defecto; las subidas usan streams y pueden tardar más
};

// Constantes de configuración
const IMAGE_CONFIG = {
  MAX_SIZE_MB: 10,
  MIN_DIMENSION: 300,
  TARGET_DIMENSION: 2000,
  QUALITY: 85,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp']
};

/**
 * Funciones de caché para optimizar llamadas a la API
 */
const getCacheKey = (endpoint, params = {}) => {
  return `${endpoint}?${JSON.stringify(params)}`;
};

const getFromCache = (key) => {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCache = (key, data) => {
  apiCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

const clearCache = () => {
  apiCache.clear();
};

/**
 * Genera un hash único para nombres de archivo
 * @param {Buffer} buffer - Datos de la imagen
 * @returns {string} Hash MD5
 */
const generateFileHash = (buffer) => {
  return crypto.createHash('md5').update(buffer).digest('hex');
};

/**
 * Procesa y optimiza una imagen
 * @param {Buffer} imageBuffer - Buffer con los datos de la imagen
 * @returns {Promise<Buffer>} Imagen procesada
 */
const processImage = async (imageBuffer) => {
  try {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    // Configurar el procesamiento base
    let processedImage = image
      .rotate() // Corrige orientación EXIF
      .resize({
        width: IMAGE_CONFIG.TARGET_DIMENSION,
        height: IMAGE_CONFIG.TARGET_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true
      });
    
    // Manejar imágenes con transparencia (RGBA)
    if (metadata.channels === 4 || metadata.hasAlpha) {
      // Para imágenes con transparencia, crear fondo blanco y componer
      processedImage = processedImage
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .jpeg({ quality: IMAGE_CONFIG.QUALITY });
    } else {
      // Para imágenes sin transparencia, convertir directamente
      processedImage = processedImage
        .jpeg({ quality: IMAGE_CONFIG.QUALITY });
    }
    
    return await processedImage
      .withMetadata()
      .toBuffer();
  } catch (error) {
    throw new Error(`Error al procesar imagen: ${error.message}`);
  }
};

/**
 * Valida y prepara un archivo de imagen para subida
 * @param {object} imageData - Datos de la imagen
 * @returns {Promise<object>} Información del archivo procesado
 */
const prepareImageForUpload = async (imageData) => {
  try {
    console.log('=== PREPARE IMAGE FOR UPLOAD ===');
    console.log('imageData completo:', imageData);
    console.log('Tipo de imageData:', typeof imageData);
    console.log('imageData.data:', imageData?.data);
    console.log('Tipo de imageData.data:', typeof imageData?.data);
    console.log('imageData.data es array:', Array.isArray(imageData?.data));
    console.log('imageData.data es Uint8Array:', imageData?.data instanceof Uint8Array);
    console.log('imageData.data es Buffer:', Buffer.isBuffer(imageData?.data));
    
    // Validar que tenemos datos de imagen
    if (!imageData) {
      throw new Error('No se proporcionaron datos de imagen');
    }

    // Si la imagen ya tiene un path (archivo temporal), usarlo directamente
    if (imageData.path && fs.existsSync(imageData.path)) {
      console.log('Usando imagen existente en path:', imageData.path);
      const stats = fs.statSync(imageData.path);
      return {
        path: imageData.path,
        type: imageData.type || 'image/jpeg',
        name: imageData.name || path.basename(imageData.path),
        size: stats.size,
        width: imageData.width,
        height: imageData.height,
        lastModified: imageData.lastModified || Date.now()
      };
    }

    // Si tenemos datos de imagen
    if (!imageData.data) {
      console.error('imageData.data está vacío o no existe');
      console.error('Estructura completa de imageData:', JSON.stringify(imageData, null, 2));
      throw new Error('No se proporcionaron datos de imagen válidos');
    }

    // Convertir a Buffer según el tipo de entrada
    let imageBuffer;
    if (Buffer.isBuffer(imageData.data)) {
      imageBuffer = imageData.data;
      console.log('Datos de imagen como Buffer, tamaño:', imageBuffer.length);
    } else if (imageData.data instanceof Uint8Array) {
      imageBuffer = Buffer.from(imageData.data);
      console.log('Datos de imagen como Uint8Array, tamaño:', imageBuffer.length);
    } else if (Array.isArray(imageData.data)) {
      // Si viene como array desde el frontend (convertido por convertFileToBuffer)
      imageBuffer = Buffer.from(imageData.data);
      console.log('Datos de imagen como Array convertido desde frontend, tamaño:', imageBuffer.length);
    } else if (typeof imageData.data === 'string') {
      // Si viene como base64
      const base64Data = imageData.data.includes(',') ? 
        imageData.data.split(',')[1] : imageData.data;
      imageBuffer = Buffer.from(base64Data, 'base64');
      console.log('Datos de imagen como base64, tamaño:', imageBuffer.length);
    } else if (imageData.data instanceof ArrayBuffer) {
      imageBuffer = Buffer.from(imageData.data);
      console.log('Datos de imagen como ArrayBuffer, tamaño:', imageBuffer.length);
    } else {
      console.error('Tipo de datos no soportado:', typeof imageData.data);
      console.error('Estructura de datos:', imageData);
      throw new Error('Formato de datos de imagen no soportado');
    }

    // Validar que el buffer no esté vacío
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error('Los datos de imagen están vacíos');
    }

    console.log('Buffer creado exitosamente, tamaño:', imageBuffer.length);
    console.log('=== FIN PREPARE IMAGE FOR UPLOAD ===');

    // Validar tamaño del archivo
    if (imageBuffer.length > IMAGE_CONFIG.MAX_SIZE_MB * 1024 * 1024) {
      throw new Error(`El tamaño de la imagen excede el límite de ${IMAGE_CONFIG.MAX_SIZE_MB}MB`);
    }

    // Procesar imagen
    const processedBuffer = await processImage(imageBuffer);
    const metadata = await sharp(processedBuffer).metadata();

    // Validar dimensiones mínimas
    if (metadata.width < IMAGE_CONFIG.MIN_DIMENSION || metadata.height < IMAGE_CONFIG.MIN_DIMENSION) {
      console.warn(`Advertencia: La imagen es menor que el tamaño recomendado de ${IMAGE_CONFIG.MIN_DIMENSION}x${IMAGE_CONFIG.MIN_DIMENSION} píxeles`);
    }

    // Determinar extensión y tipo MIME
    let ext, mimeType;
    switch (metadata.format) {
      case 'png':
        ext = '.png';
        mimeType = 'image/png';
        break;
      case 'webp':
        ext = '.webp';
        mimeType = 'image/webp';
        break;
      default:
        ext = '.jpg';
        mimeType = 'image/jpeg';
    }

    // Crear nombre de archivo seguro con hash
    const originalName = imageData.name || 'image';
    const safeName = originalName.replace(/[^a-z0-9_.-]/gi, '_');
    const fileHash = generateFileHash(processedBuffer);
    const tempFileName = `product_${fileHash}_${safeName}${ext}`;
    const tempFilePath = path.join(app.getPath('temp'), tempFileName);

    // Guardar archivo temporal
    await fsp.writeFile(tempFilePath, processedBuffer);
    console.log('Archivo temporal creado:', tempFilePath);

    return {
      path: tempFilePath,
      type: mimeType,
      name: tempFileName,
      width: metadata.width,
      height: metadata.height,
      size: processedBuffer.length,
      lastModified: imageData.lastModified || Date.now()
    };
  } catch (error) {
    console.error('Error en prepareImageForUpload:', error);
    throw new Error(`Error al preparar imagen: ${error.message}`);
  }
};

/**
 * Maneja la subida de archivos con FormData
 * @param {string} url - URL del endpoint
 * @param {object} data - Datos a enviar
 * @param {object} file - Archivo a subir
 * @param {object} event - Evento de Electron para progreso
 * @returns {Promise<object>} Respuesta de la API
 */
const createOrUpdateProduct = async (url, data, method = 'post') => {
  try {
    console.log('=== CREATE OR UPDATE PRODUCT ===');
    console.log('URL:', url);
    console.log('Method:', method);
    console.log('Data keys:', Object.keys(data));
    
    let productData = { ...data };

    // 1. Manejar la imagen principal si existe
    if (productData.imagen_principal && productData.imagen_principal.data) {
      console.log('Procesando imagen principal...');
      // Reutilizar la misma lógica de preparación usada en uploads independientes
      const tempFile = await prepareImageForUpload(productData.imagen_principal);

      // Reemplazar el objeto de imagen con un stream del archivo temporal
      productData.imagen_principal = fs.createReadStream(tempFile.path);
      // Guardar la ruta para poder eliminarlo después
      productData.imagen_principal.tempPath = tempFile.path;
      console.log('Imagen procesada y lista para envío');
    }

    // 2. Construir el FormData
    const formData = new FormData();
    // Convertir números y booleanos a string para que FormData los acepte
    const arrayIdFields = {};
    const sanitizedData = {};
    Object.entries(productData).forEach(([k, v]) => {
      if (Array.isArray(v) && k.endsWith('_ids')) {
        arrayIdFields[k] = v;
        return; // no incluir en sanitizedData
      }
      if (typeof v === 'number' || typeof v === 'boolean') {
        sanitizedData[k] = v.toString();
      } else if (k === 'imagen_principal') {
        // dejo como está (ReadStream)
        sanitizedData[k] = v;
      } else if (Buffer.isBuffer(v) || v instanceof fs.ReadStream) {
        sanitizedData[k] = v;
      } else if (Array.isArray(v)) {
        sanitizedData[k] = JSON.stringify(v);
      } else {
        sanitizedData[k] = v;
      }
    });

    console.log('Datos sanitizados:', Object.keys(sanitizedData));
    console.log('Campos de array:', Object.keys(arrayIdFields));

    buildFormData(formData, sanitizedData);
    // Añadir cada id de los campos *_ids por separado
    Object.entries(arrayIdFields).forEach(([field, ids]) => {
      ids.forEach(id => formData.append(field, id.toString()));
    });

    const baseConfig = await createAuthenticatedConfig();
    const config = {
      ...baseConfig,
      headers: {
        ...baseConfig.headers,
        ...formData.getHeaders()
      }
    };

    console.log('Realizando petición HTTP...');
    // 3. Realizar la petición
    const response = await axios[method](url, formData, config);

    console.log('Respuesta recibida:', response.status);
    console.log('Datos de respuesta:', response.data);

    // 4. Limpiar el archivo temporal si se creó
    if (productData.imagen_principal && productData.imagen_principal.tempPath) {
      await fsp.unlink(productData.imagen_principal.tempPath).catch(err => console.error('Error al limpiar archivo temporal:', err));
    }

    return response.data;
  } catch (error) {
    console.error('Error en createOrUpdateProduct:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.message);
    
    // Limpiar en caso de error también
    if (data.imagen_principal && data.imagen_principal.tempPath) {
        await fsp.unlink(data.imagen_principal.tempPath).catch(err => console.error('Error al limpiar archivo temporal en error:', err));
    }
    throw new Error(await handleApiError(error));
  }
};

/**
 * Configura los manejadores de productos
 */
module.exports = function setupProductHandlers() {
  // Obtener listado de productos
  ipcMain.handle('productos:listar', async (_, params = {}) => {
    try {
      const cacheKey = getCacheKey('productos/listar', params);
      const cachedData = getFromCache(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/productos/`, {
        params: {
          ordering: '-fecha_creacion',
          ...params
        },
        ...AXIOS_CONFIG
      });
      
      setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw new Error(await handleApiError(error));
    }
  });

  // Obtener un producto específico por slug
  ipcMain.handle('productos:obtener', async (_, slug) => {
    try {
      const config = await createAuthenticatedConfig();
      const response = await axios.get(
        `${API_BASE_URL}/api/productos/${slug}/`, 
        config
      );
      return response.data;
    } catch (error) {
      throw new Error(await handleApiError(error));
    }
  });

  // Obtener un producto específico por ID
  ipcMain.handle('productos:obtenerPorId', async (_, productId) => {
    try {
      console.log('🔍 Obteniendo producto por ID:', productId);
      
      const config = await createAuthenticatedConfig();
      
      // Primero intentar obtener la lista de productos y buscar por ID
      const listResponse = await axios.get(
        `${API_BASE_URL}/api/productos/`, 
        {
          ...config,
          params: {
            id: productId
          }
        }
      );
      
      if (listResponse.data && listResponse.data.results && listResponse.data.results.length > 0) {
        const product = listResponse.data.results[0];
        console.log('✅ Producto encontrado por ID:', product.slug);
        return { product };
      }
      
      throw new Error('Producto no encontrado');
    } catch (error) {
      console.error('❌ Error obteniendo producto por ID:', error.message);
      throw new Error(await handleApiError(error));
    }
  });

  // Test handler para verificar comunicación
  ipcMain.handle('test-upload', async (event, data) => {
    console.log('[MAIN] ===== TEST UPLOAD =====');
    console.log('[MAIN] Data recibida:', data);
    return { success: true, message: 'Test successful' };
  });

  // Limpiar caché de productos
  ipcMain.handle('productos:limpiarCache', async () => {
    try {
      clearCache();
      return { success: true, message: 'Cache limpiado exitosamente' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Subir imagen principal
  ipcMain.handle('upload-producto-imagen-principal', async (event, { slug, imageFile }) => {
    console.log('[MAIN] ===== INICIANDO upload-producto-imagen-principal =====');
    console.log('[MAIN] slug:', slug);
    console.log('[MAIN] imageFile recibido:', imageFile);
    
    try {
      if (!slug) {
        console.error('[MAIN] Error: Slug del producto es requerido');
        throw new Error('Slug del producto es requerido');
      }
      if (!imageFile?.data) {
        console.error('[MAIN] Error: Archivo de imagen es requerido');
        throw new Error('Archivo de imagen es requerido');
      }

      console.log('[MAIN] Preparando imagen para subida...');
      const tempFile = await prepareImageForUpload(imageFile);
      console.log('[MAIN] tempFile generado:', tempFile);
      
      const formData = new FormData();
      const fileStream = fs.createReadStream(tempFile.path);

      formData.append('imagen_principal', fileStream, {
        filename: tempFile.name,
        contentType: tempFile.type,
        knownLength: tempFile.size
      });

      const baseConfig = await createAuthenticatedConfig();
      const config = {
        ...baseConfig,
        headers: {
          ...formData.getHeaders(),
          ...baseConfig.headers
        },
        onUploadProgress: (progressEvent) => {
          if (event) {
            event.sender.send('upload-progress', {
              loaded: progressEvent.loaded,
              total: progressEvent.total || tempFile.size,
              percentage: Math.round((progressEvent.loaded / (progressEvent.total || tempFile.size)) * 100)
            });
          }
        }
      };

      console.log('[MAIN] Enviando imagen al backend...');
      let response;
      try {
        response = await axios.post(
          `${API_BASE_URL}/api/productos/${slug}/upload_imagen_principal/`,
          formData,
          config
        );
        
        console.log('[MAIN] Respuesta del backend recibida:', response?.status);
        
        // Espera a que el stream termine antes de borrar el archivo
        await new Promise((resolve, reject) => {
          fileStream.on('close', resolve);
          fileStream.on('error', reject);
          fileStream.on('finish', resolve); // por si acaso
        });
      } catch (axiosError) {
        console.error('[MAIN] Error en axios:', axiosError);
        console.error('[MAIN] Error response:', axiosError.response?.data);
        throw axiosError;
      } finally {
        // Borra el archivo temporal siempre, incluso si hay error
        try {
          if (fs.existsSync(tempFile.path)) {
            fs.unlinkSync(tempFile.path);
            console.log('[MAIN] Archivo temporal borrado');
          }
        } catch (e) {
          console.error('[MAIN] Error al borrar archivo temporal:', e);
        }
      }
      
      console.log('[MAIN] Respuesta del backend:', response?.data);
      const result = response?.data || { success: true };
      console.log('[MAIN] ===== upload-producto-imagen-principal COMPLETADO =====');
      return result;
    } catch (error) {
      console.error('[MAIN] ===== ERROR en upload-producto-imagen-principal =====');
      console.error('[MAIN] Error completo:', error);
      console.error('[MAIN] Error message:', error.message);
      console.error('[MAIN] Error stack:', error.stack);
      
      const errorMessage = await handleApiError(error);
      console.error('[MAIN] Error procesado:', errorMessage);
      throw new Error(errorMessage);
    }
  });

  // Eliminar imagen principal
  ipcMain.handle('remove-producto-imagen-principal', async (_, slug) => {
    try {
      if (!slug) throw new Error('Slug del producto es requerido');
      
      const config = await createAuthenticatedConfig();
      const response = await axios.delete(
        `${API_BASE_URL}/api/productos/${slug}/remove_imagen_principal/`,
        config
      );
      return response.data;
    } catch (error) {
      throw new Error(await handleApiError(error));
    }
  });

  // Crear nuevo producto
  ipcMain.handle('productos:crear', async (_, productData) => {
    try {
      console.log('🚀 Handler: === INICIANDO CREACIÓN DE PRODUCTO ===');
      console.log('📦 Handler: Datos completos recibidos:', JSON.stringify(productData, null, 2));
      console.log('📦 Handler: Campos específicos:', {
        nombre: productData?.nombre,
        sku: productData?.sku,
        descripcion_corta: productData?.descripcion_corta,
        descripcion_larga: productData?.descripcion_larga,
        precio: productData?.precio,
        categoria_id: productData?.categoria_id,
        imagen_principal: productData?.imagen_principal ? 'PRESENTE' : 'AUSENTE'
      });
      
      // Verificar campos requeridos
      if (!productData?.sku) {
        console.log('❌ Handler: SKU faltante - esto causará error 400');
      }
      
      if (!productData?.nombre) throw new Error('Nombre del producto es requerido');
      
      console.log('Handler: Creando producto');
      const baseConfig = await createAuthenticatedConfig();
      let config = { ...baseConfig };
      const formData = new FormData();

      // Agregar campos básicos
      const basicFields = [
        'nombre', 'sku', 'tipo', 'estado', 'descripcion_corta', 'descripcion_larga',
        'precio', 'precio_comparacion', 'costo', 'gestion_stock', 'stock', 'stock_minimo',
        'peso', 'dimensiones', 'meta_titulo', 'meta_descripcion'
      ];

      basicFields.forEach(field => {
        if (productData[field] !== undefined) {
          formData.append(field, productData[field]?.toString() || '');
        }
      });
      
      if (productData.categoria_id) {
        formData.append('categoria_id', productData.categoria_id);
      }

      // Agregar imagen principal si existe
      if (productData.imagen_principal?.data) {
        console.log('Handler: Procesando imagen principal...');
        try {
          let buffer;
          if (typeof productData.imagen_principal.data === 'string') {
            // Si es base64
            const base64Data = productData.imagen_principal.data.includes(',') ? 
              productData.imagen_principal.data.split(',')[1] : productData.imagen_principal.data;
            buffer = Buffer.from(base64Data, 'base64');
          } else if (productData.imagen_principal.data instanceof ArrayBuffer) {
            buffer = Buffer.from(productData.imagen_principal.data);
          } else if (Array.isArray(productData.imagen_principal.data)) {
            buffer = Buffer.from(productData.imagen_principal.data);
          } else if (typeof productData.imagen_principal.data === 'object' && productData.imagen_principal.data.type === 'Buffer') {
            buffer = Buffer.from(productData.imagen_principal.data.data);
          } else {
            throw new Error('Formato de imagen no soportado');
          }
          
          formData.append('imagen_principal', buffer, {
            filename: productData.imagen_principal.name || 'imagen.jpg',
            contentType: productData.imagen_principal.type || 'image/jpeg'
          });
          console.log('Handler: Imagen principal agregada al FormData');
        } catch (imgError) {
          console.error('Error procesando imagen:', imgError);
          throw new Error(`Error procesando imagen: ${imgError.message}`);
        }
      }

      // Axios config para FormData
      config.headers = {
        ...config.headers,
        ...formData.getHeaders()
      };

      // Log detallado de todos los campos antes de enviar
      console.log('📋 Handler: Campos que se enviarán al backend:');
      // Nota: FormData de Node.js no tiene método entries(), omitiendo log detallado
      console.log('📋 Handler: FormData preparado para envío');
      
      console.log('Handler: Enviando FormData a backend');
      try {
        const response = await axios.post(`${API_BASE_URL}/api/productos/productos/`, formData, config);
        console.log('Handler: Respuesta exitosa del servidor');
        
        // Asegurar que la respuesta tenga la estructura correcta
        const responseData = response.data;
        if (responseData.producto) {
          // Log de debugging para verificar el slug
          console.log('Handler: Producto creado con slug:', responseData.producto.slug);
          console.log('Handler: Producto creado con ID:', responseData.producto.id);
        }
        
        return responseData;
      } catch (axiosError) {
        console.error('Handler: === ERROR EN CREAR PRODUCTO ===');
        console.error('Handler: Error status:', axiosError.response?.status);
        console.error('Handler: Error message:', axiosError.message);
        console.error('Handler: Error response data:', axiosError.response?.data);
        console.error('Handler: Error config:', {
          url: axiosError.config?.url,
          method: axiosError.config?.method,
          headers: axiosError.config?.headers
        });
        
        // Extraer mensaje de error más específico
        let errorMessage = 'Error al crear el producto';
        if (axiosError.response?.data?.detail) {
          errorMessage = axiosError.response.data.detail;
        } else if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        } else if (axiosError.response?.data?.mensaje) {
          errorMessage = axiosError.response.data.mensaje;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
        
        // Crear un nuevo error con un mensaje claro y serializable
        const error = new Error(`Error al crear el producto: ${errorMessage}`);
        throw error;
      }
    } catch (error) {
      console.error('Handler: Error general:', error.message);
      throw new Error(`Error al crear producto: ${error.message}`);
    }
  });

  // Test handler para debug
  ipcMain.handle('productos:test-update', async (_, { slug, productData }) => {
    try {
      console.log('=== TEST UPDATE PRODUCT ===');
      console.log('Slug:', slug);
      console.log('Product data:', JSON.stringify(productData, null, 2));
      
      // Test simple update without image
      const testData = {
        nombre: productData.nombre || 'Test Product',
        sku: productData.sku || 'TEST-SKU',
        precio: productData.precio || 0,
        descripcion_corta: productData.descripcion_corta || '',
        descripcion_larga: productData.descripcion_larga || '',
        tipo: productData.tipo || 'fisico',
        estado: productData.estado || 'borrador',
        gestion_stock: productData.gestion_stock || false,
        stock: productData.stock || 0,
        costo: productData.costo || 0
      };
      
      console.log('Test data:', JSON.stringify(testData, null, 2));
      
      const response = await axios.patch(
        `${API_BASE_URL}/api/productos/${slug}/`,
        testData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      console.log('Test update successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Test update failed:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw new Error(await handleApiError(error));
    }
  });

  // Actualizar producto existente
  ipcMain.handle('productos:actualizar', async (_, { slug, productData }) => {
    try {
      if (!slug) throw new Error('Slug del producto es requerido');
      
      console.log('Handler: Actualizando producto:', slug);
      const baseConfig = await createAuthenticatedConfig();
      let config = { ...baseConfig };
      const formData = new FormData();

      // Agregar campos básicos
      formData.append('nombre', productData.nombre || '');
      formData.append('sku', productData.sku || '');
      formData.append('tipo', productData.tipo || 'fisico');
      formData.append('estado', productData.estado || 'borrador');
      formData.append('descripcion_corta', productData.descripcion_corta || '');
      formData.append('descripcion_larga', productData.descripcion_larga || '');
      formData.append('precio', productData.precio || 0);
      formData.append('precio_comparacion', productData.precio_comparacion || '');
      formData.append('costo', productData.costo || 0);
      formData.append('gestion_stock', productData.gestion_stock ? 'true' : 'false');
      formData.append('stock', productData.stock || 0);
      formData.append('stock_minimo', productData.stock_minimo || 5);
      formData.append('peso', productData.peso || 0);
      formData.append('dimensiones', productData.dimensiones || '');
      formData.append('meta_titulo', productData.meta_titulo || '');
      formData.append('meta_descripcion', productData.meta_descripcion || '');
      
      if (productData.categoria_id) {
        formData.append('categoria_id', productData.categoria_id);
      }

      // Agregar imagen principal si existe (como en categorías)
      if (productData.imagen_principal && productData.imagen_principal.data && productData.imagen_principal.name && productData.imagen_principal.type) {
        console.log('Handler: Procesando imagen principal...');
        let buffer;
        if (typeof productData.imagen_principal.data === 'string') {
          // Si es base64
          buffer = Buffer.from(productData.imagen_principal.data, 'base64');
        } else if (productData.imagen_principal.data instanceof ArrayBuffer) {
          buffer = Buffer.from(productData.imagen_principal.data);
        } else if (Array.isArray(productData.imagen_principal.data)) {
          buffer = Buffer.from(productData.imagen_principal.data);
        } else {
          throw new Error('Formato de imagen no soportado');
        }
        formData.append('imagen_principal', buffer, {
          filename: productData.imagen_principal.name,
          contentType: productData.imagen_principal.type
        });
        console.log('Handler: Imagen principal agregada al FormData');
      }

      // Axios config para FormData
      config.headers = {
        ...config.headers,
        ...formData.getHeaders()
      };

      console.log('Handler: Enviando FormData a backend');
      const response = await axios.patch(`${API_BASE_URL}/api/productos/${slug}/`, formData, config);
      console.log('Handler: Respuesta exitosa:', response.data);
      return response.data;
    } catch (error) {
      console.error('Handler: === ERROR EN ACTUALIZAR PRODUCTO ===');
      console.error('Handler: Error completo:', error);
      console.error('Handler: Error response:', error.response?.data);
      console.error('Handler: Error status:', error.response?.status);
      console.error('Handler: Error message:', error.message);
      throw new Error(await handleApiError(error));
    }
  });

  // Eliminar producto
  ipcMain.handle('productos:eliminar', async (_, slug) => {
    try {
      if (!slug) throw new Error('Slug del producto es requerido');
      
      console.log('🗑️ Eliminando producto:', slug);
      
      const config = await createAuthenticatedConfig();
      const response = await axios.delete(
        `${API_BASE_URL}/api/productos/productos/${slug}/`, 
        config
      );
      
      console.log('✅ Producto eliminado exitosamente:', slug, 'Status:', response.status);
      
      // 🚀 LIMPIAR CACHE RELACIONADO después de eliminar
      clearCache();
      console.log('🧹 Cache limpiado después de eliminar producto');
      
      return { success: true, slug };
    } catch (error) {
      console.error('❌ Error eliminando producto:', slug, error.message);
      throw new Error(await handleApiError(error));
    }
  });

  // Reordenar productos
  ipcMain.handle('productos:reordenar', async (_, { productos }) => {
    try {
      console.log('🔄 Reordenando productos:', productos);
      
      const config = await createAuthenticatedConfig();
      const response = await axios.post(
        `${API_BASE_URL}/api/productos/productos/reorder/`, 
        { productos },
        config
      );
      
      console.log('✅ Productos reordenados exitosamente');
      
      // Limpiar cache después de reordenar
      clearCache();
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error reordenando productos:', error.message);
      throw new Error(await handleApiError(error));
    }
  });

  // Obtener información de la imagen
  ipcMain.handle('get-producto-imagen-info', async (_, slug) => {
    try {
      if (!slug) throw new Error('Slug del producto es requerido');
      
      const config = await createAuthenticatedConfig();
      const response = await axios.get(
        `${API_BASE_URL}/api/productos/productos/${slug}/imagen_principal_info/`,
        config
      );
      return response.data;
    } catch (error) {
      throw new Error(await handleApiError(error));
    }
  });

  // ===== HANDLERS PARA COLORES =====
  
  // Obtener colores de un producto (optimizado)
  ipcMain.handle('productos:obtenerColores', async (event, productId) => {
    try {
      const cacheKey = getCacheKey(`productos/${productId}/colores`);
      const cachedData = getFromCache(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      // Configuración optimizada para colores (timeout más corto)
      const baseConfig = await createAuthenticatedConfig();
      const colorsConfig = {
        ...baseConfig,
        timeout: 20000, // aumentar para evitar ECONNABORTED en Render cold start
        headers: {
          ...baseConfig.headers,
          'Cache-Control': 'max-age=30' // Cache de 30 segundos
        }
      };
      
      const response = await axios.get(`${API_BASE_URL}/api/productos/productos/${productId}/colores/`, colorsConfig);
      
      // ✅ Manejar respuesta paginada del backend
      let coloresData = [];
      if (response.data && response.data.results) {
        // El backend devuelve una respuesta paginada
        coloresData = response.data.results;
      } else if (Array.isArray(response.data)) {
        // El backend devuelve un array directo
        coloresData = response.data;
      } else {
        coloresData = [];
      }
      
      const result = { success: true, data: coloresData };
      setCache(cacheKey, result);
      return result;
    } catch (error) {
      return handleApiError(error, 'Error al obtener colores del producto');
    }
  });

  // Crear color para un producto
  ipcMain.handle('productos:crearColor', async (event, productId, colorData) => {
    try {
      // Limpiar caché relacionado con este producto
      const cacheKey = getCacheKey(`productos/${productId}/colores`);
      apiCache.delete(cacheKey);
      
      console.log('=== CREANDO COLOR ===');
      console.log('Product ID:', productId);
      console.log('Color data:', colorData);
      
      // Preparar datos del color
      const colorFormData = {
        producto: productId,
        nombre: colorData.nombre,
        hex_code: colorData.hex_code, // ✅ Enviar hex_code en lugar de codigo_color
        stock: colorData.stock || 0,
        orden: colorData.orden || 1,
        activo: colorData.activo !== undefined ? colorData.activo : true, // ✅ Agregar campo activo
        es_principal: colorData.es_principal || false
      };
      
      console.log('Datos del color preparados:', colorFormData);
      
      const baseConfig = await createAuthenticatedConfig();
      const response = await axios.post(
        `${API_BASE_URL}/api/productos/productos/${productId}/colores/`, 
        querystring.stringify(colorFormData),
        {
          ...baseConfig,
          headers: {
            ...baseConfig.headers,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      console.log('Color creado exitosamente:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creando color:', error);
      return handleApiError(error, 'Error al crear color');
    }
  });

  // Actualizar color
  ipcMain.handle('productos:actualizarColor', async (event, productId, colorId, colorData) => {
    try {
      // Limpiar caché relacionado con este producto
      const cacheKey = getCacheKey(`productos/${productId}/colores`);
      apiCache.delete(cacheKey);
      
      console.log('=== ACTUALIZANDO COLOR ===');
      console.log('Product ID:', productId);
      console.log('Color ID:', colorId);
      console.log('Color data:', colorData);
      
      // Preparar datos del color
      const colorFormData = {
        nombre: colorData.nombre,
        hex_code: colorData.hex_code, // ✅ Enviar hex_code en lugar de codigo_color
        stock: colorData.stock || 0,
        orden: colorData.orden || 1,
        activo: colorData.activo !== undefined ? colorData.activo : true, // ✅ Agregar campo activo
        es_principal: colorData.es_principal || false
      };
      
      console.log('Datos del color preparados para actualizar:', colorFormData);
      
      const baseConfig = await createAuthenticatedConfig();
      const response = await axios.put(
        `${API_BASE_URL}/api/productos/productos/${productId}/colores/${colorId}/`, 
        querystring.stringify(colorFormData),
        {
          ...baseConfig,
          headers: {
            ...baseConfig.headers,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      console.log('Color actualizado exitosamente:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error actualizando color:', error);
      return handleApiError(error, 'Error al actualizar color');
    }
  });

  // Eliminar color
  ipcMain.handle('productos:eliminarColor', async (event, productId, colorId) => {
    try {
      const config = await createAuthenticatedConfig();
      await axios.delete(`${API_BASE_URL}/api/productos/productos/${productId}/colores/${colorId}/`, config);
      return { success: true };
    } catch (error) {
      return handleApiError(error, 'Error al eliminar color');
    }
  });

  // ===== HANDLERS PARA IMÁGENES DE COLORES =====
  
  // Obtener imágenes de un color
  ipcMain.handle('productos:obtenerImagenes', async (event, colorId) => {
    try {
      console.log('=== OBTENIENDO IMÁGENES ===');
      console.log('Color ID:', colorId);
      
      const config = await createAuthenticatedConfig();
      const response = await axios.get(`${API_BASE_URL}/api/productos/colores/${colorId}/imagenes/`, config);
      console.log('📡 Respuesta del backend:', response.data);
      
      // ✅ Manejar respuesta paginada del backend
      let imagenesData = [];
      if (response.data && response.data.results) {
        // El backend devuelve una respuesta paginada
        imagenesData = response.data.results;
        console.log('📊 Imágenes obtenidas (paginadas):', imagenesData.length);
      } else if (Array.isArray(response.data)) {
        // El backend devuelve un array directo
        imagenesData = response.data;
        console.log('📊 Imágenes obtenidas (array directo):', imagenesData.length);
      } else {
        console.log('⚠️  Formato de respuesta inesperado:', typeof response.data);
        imagenesData = [];
      }
      
      // Log detallado de cada imagen
      imagenesData.forEach((imagen, index) => {
        console.log(`🖼️  Imagen ${index + 1}:`, {
          id: imagen.id,
          url: imagen.url_imagen,
          orden: imagen.orden,
          es_principal: imagen.es_principal
        });
      });
      
      return { success: true, data: imagenesData };
    } catch (error) {
      console.error('❌ Error obteniendo imágenes:', error);
      return handleApiError(error, 'Error al obtener imágenes del color');
    }
  });

  // Subir imagen para un color
  ipcMain.handle('productos:subirImagen', async (event, colorId, formData) => {
    try {
      console.log('=== SUBIENDO IMAGEN ===');
      console.log('Color ID:', colorId);
      console.log('FormData recibido:', formData);
      
      // Verificar que se recibió la imagen
      if (!formData || !formData.imagen) {
        console.error('❌ No se recibió formData o formData.imagen');
        console.error('❌ formData:', formData);
        throw new Error('Image is required');
      }
      
      // Verificar que la imagen tiene datos
      if (!formData.imagen.data || !Array.isArray(formData.imagen.data)) {
        console.error('❌ No se recibieron datos de imagen válidos');
        console.error('❌ formData.imagen:', formData.imagen);
        throw new Error('Image data is required');
      }
      
      // Preparar FormData para la subida usando la librería form-data
      const FormData = require('form-data');
      const uploadFormData = new FormData();
      
      // Agregar archivo de imagen
      const imageFile = formData.imagen;
      console.log('📁 Archivo de imagen:', {
        name: imageFile.name,
        type: imageFile.type,
        size: imageFile.size,
        dataLength: imageFile.data.length
      });
      
      // Convertir el archivo a Buffer
      let imageBuffer;
      if (imageFile.data && Array.isArray(imageFile.data)) {
        // Si el archivo tiene datos como array (Uint8Array convertido)
        imageBuffer = Buffer.from(imageFile.data);
        console.log('✅ Datos convertidos de array a Buffer');
      } else if (imageFile.data instanceof Buffer) {
        // Si ya es un Buffer
        imageBuffer = imageFile.data;
        console.log('✅ Datos ya son Buffer');
      } else if (imageFile.data instanceof Uint8Array) {
        // Si es Uint8Array
        imageBuffer = Buffer.from(imageFile.data);
        console.log('✅ Datos convertidos de Uint8Array a Buffer');
      } else {
        console.error('❌ Formato de archivo no soportado:', typeof imageFile.data);
        console.error('❌ Estructura del archivo:', Object.keys(imageFile));
        throw new Error('Formato de archivo no soportado');
      }
      
      // Agregar el archivo al FormData
      uploadFormData.append('imagen', imageBuffer, {
        filename: imageFile.name || 'imagen.jpg',
        contentType: imageFile.type || 'image/jpeg'
      });
      
      // Agregar orden si existe
      if (formData.orden !== undefined) {
        uploadFormData.append('orden', formData.orden.toString());
      }
      
      console.log('📤 Enviando FormData al backend...');
      console.log('📊 Tamaño del buffer:', imageBuffer.length);
      console.log('📊 Headers del FormData:', uploadFormData.getHeaders());
      
      const baseConfig = await createAuthenticatedConfig();
      const response = await axios.post(
        `${API_BASE_URL}/api/productos/colores/${colorId}/imagenes/`,
        uploadFormData,
        {
          ...baseConfig,
          headers: {
            ...baseConfig.headers,
            ...uploadFormData.getHeaders()
          }
        }
      );
      
      console.log('✅ Imagen subida exitosamente:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error subiendo imagen:', error);
      return handleApiError(error, 'Error al subir imagen');
    }
  });

  // Eliminar imagen
  ipcMain.handle('productos:eliminarImagen', async (event, colorId, imagenId) => {
    try {
      const config = await createAuthenticatedConfig();
      await axios.delete(`${API_BASE_URL}/api/productos/colores/${colorId}/imagenes/${imagenId}/`, config);
      return { success: true };
    } catch (error) {
      return handleApiError(error, 'Error al eliminar imagen');
    }
  });

  // Establecer imagen principal
  ipcMain.handle('productos:establecerImagenPrincipal', async (event, colorId, imagenId) => {
    try {
      const config = await createAuthenticatedConfig();
      const response = await axios.post(`${API_BASE_URL}/api/productos/colores/${colorId}/imagenes/${imagenId}/establecer-principal/`, {}, config);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error, 'Error al establecer imagen principal');
    }
  });

  // Reordenar imágenes
  ipcMain.handle('productos:reordenarImagenes', async (event, colorId, ordenData) => {
    try {
      const config = await createAuthenticatedConfig();
      const response = await axios.post(`${API_BASE_URL}/api/productos/colores/${colorId}/imagenes/reordenar/`, ordenData, config);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error, 'Error al reordenar imágenes');
    }
  });

  // ===== HANDLERS PARA CARACTERÍSTICAS =====
  
  // Obtener características de un producto
  ipcMain.handle('productos:obtenerCaracteristicas', async (event, productId) => {
    try {
      const cacheKey = getCacheKey(`productos/${productId}/caracteristicas`);
      const cachedData = getFromCache(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      const baseConfig = await createAuthenticatedConfig();
      const response = await axios.get(`${API_BASE_URL}/api/productos/productos/${productId}/caracteristicas/`, baseConfig);
      
      // Manejar respuesta paginada del backend
      let caracteristicasData = [];
      if (response.data && response.data.results) {
        caracteristicasData = response.data.results;
      } else if (Array.isArray(response.data)) {
        caracteristicasData = response.data;
      } else {
        caracteristicasData = [];
      }
      
      const result = { success: true, data: caracteristicasData };
      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error al obtener características:', error);
      const errorMessage = await handleApiError(error);
      return { success: false, message: errorMessage };
    }
  });

  // Crear característica para un producto
  ipcMain.handle('productos:crearCaracteristica', async (event, productId, caracteristicaData) => {
    try {
      // Limpiar caché relacionado con este producto
      const cacheKey = getCacheKey(`productos/${productId}/caracteristicas`);
      apiCache.delete(cacheKey);
      
      console.log('=== CREANDO CARACTERÍSTICA ===');
      console.log('Product ID:', productId);
      console.log('Característica data:', caracteristicaData);
      
      // Preparar datos de la característica
      const caracteristicaFormData = {
        producto: productId,
        nombre: caracteristicaData.nombre,
        valor: caracteristicaData.valor,
        orden: caracteristicaData.orden || 1,
        activo: caracteristicaData.activo !== undefined ? caracteristicaData.activo : true
      };
      
      console.log('Datos de la característica preparados:', caracteristicaFormData);
      
      const baseConfig = await createAuthenticatedConfig();
      const response = await axios.post(
        `${API_BASE_URL}/api/productos/productos/${productId}/caracteristicas/`, 
        querystring.stringify(caracteristicaFormData),
        {
          ...baseConfig,
          headers: {
            ...baseConfig.headers,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      console.log('Característica creada exitosamente:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creando característica:', error);
      const errorMessage = await handleApiError(error);
      return { success: false, message: errorMessage };
    }
  });

  // Actualizar característica
  ipcMain.handle('productos:actualizarCaracteristica', async (event, productId, caracteristicaId, caracteristicaData) => {
    try {
      // Limpiar caché relacionado con este producto
      const cacheKey = getCacheKey(`productos/${productId}/caracteristicas`);
      apiCache.delete(cacheKey);
      
      console.log('=== ACTUALIZANDO CARACTERÍSTICA ===');
      console.log('Product ID:', productId);
      console.log('Característica ID:', caracteristicaId);
      console.log('Característica data:', caracteristicaData);
      
      // Preparar datos de la característica
      const caracteristicaFormData = {
        nombre: caracteristicaData.nombre,
        valor: caracteristicaData.valor,
        orden: caracteristicaData.orden || 1,
        activo: caracteristicaData.activo !== undefined ? caracteristicaData.activo : true
      };
      
      console.log('Datos de la característica preparados para actualizar:', caracteristicaFormData);
      
      const baseConfig = await createAuthenticatedConfig();
      const response = await axios.put(
        `${API_BASE_URL}/api/productos/productos/${productId}/caracteristicas/${caracteristicaId}/`, 
        querystring.stringify(caracteristicaFormData),
        {
          ...baseConfig,
          headers: {
            ...baseConfig.headers,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      console.log('Característica actualizada exitosamente:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error actualizando característica:', error);
      const errorMessage = await handleApiError(error);
      return { success: false, message: errorMessage };
    }
  });

  // Eliminar característica
  ipcMain.handle('productos:eliminarCaracteristica', async (event, productId, caracteristicaId) => {
    try {
      // Limpiar caché relacionado con este producto
      const cacheKey = getCacheKey(`productos/${productId}/caracteristicas`);
      apiCache.delete(cacheKey);
      
      const config = await createAuthenticatedConfig();
      await axios.delete(`${API_BASE_URL}/api/productos/productos/${productId}/caracteristicas/${caracteristicaId}/`, config);
      return { success: true };
    } catch (error) {
      console.error('Error eliminando característica:', error);
      const errorMessage = await handleApiError(error);
      return { success: false, message: errorMessage };
    }
  });

};

