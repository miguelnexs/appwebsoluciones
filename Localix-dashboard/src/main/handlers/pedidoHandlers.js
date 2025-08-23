const { ipcMain, BrowserWindow } = require('electron');
const axios = require('axios');
const { handleApiError, API_BASE_URL } = require('./apiErrorHandler');

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
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    },
    timeout: 30000 // 30 segundos
  };
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}

// Variable para rastrear si los handlers ya están registrados
let handlersRegistered = false;

// Función para hacer requests a la API con autenticación
const apiRequest = async (method, endpoint, data = null) => {
  try {
    const baseConfig = await createAuthenticatedConfig();
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      ...baseConfig
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('Error en API request:', error.response?.data || error.message);
    throw new Error(await handleApiError(error));
  }
};

// Handler para obtener todos los pedidos
const handleObtenerTodos = async (event, params = {}) => {
  try {
    console.log('🔄 [HANDLER] Obteniendo pedidos desde:', `${API_BASE_URL}/api/pedidos/pedidos/`);
    const pedidos = await apiRequest('GET', '/api/pedidos/pedidos/', params);
    console.log('✅ [HANDLER] Pedidos obtenidos exitosamente:', pedidos);
    return pedidos;
  } catch (error) {
    console.error('❌ [HANDLER] Error obteniendo pedidos:', error);
    throw error;
  }
};

// Handler para obtener un pedido específico
const handleObtenerPorId = async (event, pedidoId) => {
  try {
    const pedido = await apiRequest('GET', `/api/pedidos/pedidos/${pedidoId}/`);
    return pedido;
  } catch (error) {
    console.error('Error obteniendo pedido:', error);
    throw error;
  }
};

// Handler para crear un pedido
const handleCrear = async (event, pedidoData) => {
  try {
    const pedido = await apiRequest('POST', '/api/pedidos/pedidos/', pedidoData);
    return pedido;
  } catch (error) {
    console.error('Error creando pedido:', error);
    throw error;
  }
};

// Handler para actualizar un pedido
const handleActualizar = async (event, pedidoId, pedidoData) => {
  try {
    const pedido = await apiRequest('PATCH', `/api/pedidos/pedidos/${pedidoId}/`, pedidoData);
    return pedido;
  } catch (error) {
    console.error('Error actualizando pedido:', error);
    throw error;
  }
};

// Handler para eliminar un pedido
const handleEliminar = async (event, pedidoId) => {
  try {
    await apiRequest('DELETE', `/api/pedidos/pedidos/${pedidoId}/`);
    return { success: true };
  } catch (error) {
    console.error('Error eliminando pedido:', error);
    throw error;
  }
};

// Handler para cambiar estado de un pedido
const handleCambiarEstado = async (event, pedidoId, estadoData) => {
  try {
    const pedido = await apiRequest('POST', `/api/pedidos/pedidos/${pedidoId}/cambiar_estado/`, estadoData);
    return pedido;
  } catch (error) {
    console.error('Error cambiando estado del pedido:', error);
    throw error;
  }
};

// Handler para obtener historial de un pedido
const handleObtenerHistorial = async (event, pedidoId) => {
  try {
    const historial = await apiRequest('GET', `/api/pedidos/pedidos/${pedidoId}/historial/`);
    return historial;
  } catch (error) {
    console.error('Error obteniendo historial del pedido:', error);
    throw error;
  }
};

// Handler para obtener estadísticas de pedidos
const handleObtenerEstadisticas = async (event) => {
  try {
    const estadisticas = await apiRequest('GET', '/api/pedidos/pedidos/estadisticas/');
    return estadisticas;
  } catch (error) {
    console.error('Error obteniendo estadísticas de pedidos:', error);
    throw error;
  }
};

// Handler para buscar pedidos
const handleBuscar = async (event, query) => {
  try {
    const pedidos = await apiRequest('GET', `/api/pedidos/pedidos/?search=${encodeURIComponent(query)}`);
    return pedidos;
  } catch (error) {
    console.error('Error buscando pedidos:', error);
    throw error;
  }
};

// Función de inicialización simplificada
const initializePedidoHandlers = () => {
  console.log('🔧 Inicializando handlers de pedidos...');
  
  // Verificación básica
  if (!ipcMain || !ipcMain.handle) {
    console.error('❌ ipcMain.handle no está disponible');
    return false;
  }

  try {
    // Registrar handlers directamente sin verificaciones complejas
    ipcMain.handle('pedidos:obtener-todos', handleObtenerTodos);
    ipcMain.handle('pedidos:obtener-por-id', handleObtenerPorId);
    ipcMain.handle('pedidos:crear', handleCrear);
    ipcMain.handle('pedidos:actualizar', handleActualizar);
    ipcMain.handle('pedidos:eliminar', handleEliminar);
    ipcMain.handle('pedidos:cambiar-estado', handleCambiarEstado);
    ipcMain.handle('pedidos:obtener-historial', handleObtenerHistorial);
    ipcMain.handle('pedidos:obtener-estadisticas', handleObtenerEstadisticas);
    ipcMain.handle('pedidos:buscar', handleBuscar);

    console.log('✅ Handlers de pedidos registrados exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error registrando handlers de pedidos:', error);
    return false;
  }
};

// Función para verificar si los handlers están registrados
const checkHandlersRegistered = () => {
  if (!ipcMain) return false;
  return ipcMain.listenerCount('pedidos:obtener-todos') > 0;
};

// Función para re-registrar handlers si es necesario
const ensureHandlersRegistered = () => {
  if (!checkHandlersRegistered()) {
    console.log('🔧 Re-registrando handlers de pedidos...');
    return initializePedidoHandlers();
  }
  return true;
};

module.exports = { 
  initializePedidoHandlers, 
  checkHandlersRegistered, 
  ensureHandlersRegistered 
};