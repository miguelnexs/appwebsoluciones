const { ipcMain } = require('electron');
const axios = require('axios');
const { API_BASE_URL } = require('./apiErrorHandler');

// 🚀 FUNCIÓN PARA OBTENER TOKEN DE AUTENTICACIÓN DESDE EL RENDERER
async function getAuthToken() {
  try {
    // Obtener el token desde el renderer process
    const { BrowserWindow } = require('electron');
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

// 🚀 FUNCIÓN PARA CREAR CONFIGURACIÓN DE AXIOS CON AUTENTICACIÓN
async function createAuthenticatedConfig() {
  const token = await getAuthToken();
  const config = {
    headers: {
      'Accept': 'application/json',
      'Cache-Control': 'max-age=300'
    },
    maxContentLength: 50 * 1024 * 1024,
    maxBodyLength: 50 * 1024 * 1024,
    timeout: 30000,
    keepAlive: true,
    keepAliveMsecs: 1000,
    maxSockets: 10,
    maxFreeSockets: 5
  };
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}

// Cache para datos del dashboard
const dashboardCache = new Map();
const CACHE_DURATION = 60000; // 1 minuto

// Obtener productos disponibles para venta
ipcMain.handle('ventas:obtener-productos', async () => {
  try {
    const config = await createAuthenticatedConfig();
    const response = await axios.get(`${API_BASE_URL}/api/ventas/productos/`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Error al obtener productos' 
    };
  }
});

// Buscar productos
ipcMain.handle('ventas:buscar-productos', async (event, query) => {
  try {
    const config = await createAuthenticatedConfig();
    const response = await axios.get(`${API_BASE_URL}/api/ventas/productos/buscar/?q=${encodeURIComponent(query)}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Error al buscar productos' 
    };
  }
});

// Obtener clientes
ipcMain.handle('ventas:obtener-clientes', async () => {
  try {
    const config = await createAuthenticatedConfig();
    const response = await axios.get(`${API_BASE_URL}/api/ventas/clientes/`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Error al obtener clientes' 
    };
  }
});

// Buscar clientes
ipcMain.handle('ventas:buscar-clientes', async (event, query) => {
  try {
    const config = await createAuthenticatedConfig();
    const response = await axios.get(`${API_BASE_URL}/api/ventas/clientes/buscar/?q=${encodeURIComponent(query)}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Error al buscar clientes' 
    };
  }
});

// Crear cliente
ipcMain.handle('ventas:crear-cliente', async (event, clienteData) => {
  try {
    const config = await createAuthenticatedConfig();
    const response = await axios.post(`${API_BASE_URL}/api/ventas/clientes/`, clienteData, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Error al crear cliente' 
    };
  }
});

// Crear cliente rápido
ipcMain.handle('ventas:crear-cliente-rapido', async (event, clienteData) => {
  try {
    const config = await createAuthenticatedConfig();
    const response = await axios.post(`${API_BASE_URL}/api/ventas/clientes/crear_rapido/`, clienteData, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Error al crear cliente' 
    };
  }
});

// Crear venta rápida
ipcMain.handle('ventas:crear-venta', async (event, ventaData) => {
  try {
    const config = await createAuthenticatedConfig();
    const response = await axios.post(`${API_BASE_URL}/api/ventas/ventas/crear_venta_rapida/`, ventaData, config);
    
    // Si la venta se creó exitosamente, emitir evento para impresión automática
    if (response.data && response.data.id) {
      // Emitir evento para que el frontend genere e imprima el PDF
      event.sender.send('venta-creada', {
        venta: response.data,
        autoPrint: true
      });
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Error al crear venta' 
    };
  }
});

// Obtener ventas recientes
ipcMain.handle('ventas:obtener-ventas', async () => {
  try {
    const config = await createAuthenticatedConfig();
    const response = await axios.get(`${API_BASE_URL}/api/ventas/ventas/`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Error al obtener ventas' 
    };
  }
});

// Obtener resumen de ventas (optimizado con caché)
ipcMain.handle('ventas:obtener-resumen', async () => {
  try {
    // Verificar caché
    const cacheKey = 'ventas-resumen';
    const cachedData = dashboardCache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data;
    }

    const config = await createAuthenticatedConfig();
    const response = await axios.get(`${API_BASE_URL}/api/ventas/resumen/`, config);
    const result = { success: true, data: response.data };
    
    // Guardar en caché
    dashboardCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Error al obtener resumen' 
    };
  }
});

// Obtener estadísticas de ventas
ipcMain.handle('ventas:obtener-estadisticas', async () => {
  try {
    // Verificar caché
    const cacheKey = 'ventas-estadisticas';
    const cachedData = dashboardCache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data;
    }

    const config = await createAuthenticatedConfig();
    const response = await axios.get(`${API_BASE_URL}/api/ventas/ventas/estadisticas/`, config);
    const result = { success: true, data: response.data };
    
    // Guardar en caché
    dashboardCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Error al obtener estadísticas de ventas' 
    };
  }
});

// ✅ Handlers de Reservas
ipcMain.handle('reservas:crear', async (event, data) => {
  try {
    const config = await createAuthenticatedConfig();
    const response = await axios.post(`${API_BASE_URL}/api/ventas/reservas/crear/`, data, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || error.message || 'Error al crear reserva' };
  }
});

ipcMain.handle('reservas:listar', async () => {
  try {
    const config = await createAuthenticatedConfig();
    const response = await axios.get(`${API_BASE_URL}/api/ventas/reservas/`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al listar reservas' };
  }
});

ipcMain.handle('reservas:obtener', async (event, id) => {
  try {
    const config = await createAuthenticatedConfig();
    const response = await axios.get(`${API_BASE_URL}/api/ventas/reservas/${id}/`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al obtener reserva' };
  }
});

ipcMain.handle('reservas:pago', async (event, id, data) => {
  try {
    const config = await createAuthenticatedConfig();
    const response = await axios.post(`${API_BASE_URL}/api/ventas/reservas/${id}/pago/`, data, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al registrar pago de reserva' };
  }
});

ipcMain.handle('reservas:finalizar', async (event, id) => {
  try {
    const config = await createAuthenticatedConfig();
    const response = await axios.post(`${API_BASE_URL}/api/ventas/reservas/${id}/finalizar/`, {}, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al finalizar reserva' };
  }
});

ipcMain.handle('reservas:cancelar', async (event, id) => {
  try {
    const config = await createAuthenticatedConfig();
    const response = await axios.post(`${API_BASE_URL}/api/ventas/reservas/${id}/cancelar/`, {}, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al cancelar reserva' };
  }
});