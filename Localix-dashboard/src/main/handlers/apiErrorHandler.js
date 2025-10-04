const { ipcMain, BrowserWindow } = require('electron');
const axios = require('axios');

// Configuración base del API
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

// Evitar configurar interceptores múltiples veces
if (!global.__mainAxiosInterceptorsConfigured) {
  // Estado de refresh para evitar múltiples solicitudes simultáneas
  let isRefreshing = false;
  let failedQueue = [];

  function processQueue(error, token = null) {
    failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    failedQueue = [];
  }

  // Helper para leer desde localStorage del Renderer
  async function getLocalStorageItem(key) {
    try {
      const windows = BrowserWindow.getAllWindows();
      if (windows.length > 0) {
        const mainWindow = windows[0];
        const value = await mainWindow.webContents.executeJavaScript(`localStorage.getItem('${key}')`);
        return value;
      }
      return null;
    } catch (err) {
      console.warn('No se pudo leer localStorage desde main process:', err.message);
      return null;
    }
  }

  async function setLocalStorageItem(key, value) {
    try {
      const windows = BrowserWindow.getAllWindows();
      if (windows.length > 0) {
        const mainWindow = windows[0];
        await mainWindow.webContents.executeJavaScript(`localStorage.setItem('${key}', '${value}')`);
      }
    } catch (err) {
      console.warn('No se pudo escribir en localStorage desde main process:', err.message);
    }
  }

  async function getAccessToken() {
    return await getLocalStorageItem('access_token');
  }

  async function getRefreshToken() {
    return await getLocalStorageItem('refresh_token');
  }

  // Refrescar el access token usando el refresh token
  async function refreshAccessToken() {
    const refresh = await getRefreshToken();
    if (!refresh) {
      throw new Error('No hay refresh token disponible');
    }

    // Cliente separado para evitar bucles de interceptores
    const refreshClient = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      timeout: 10000,
    });

    const response = await refreshClient.post('/api/usuarios/refresh/', { refresh });
    const { access } = response.data || {};
    if (!access) {
      throw new Error('Respuesta de refresh inválida');
    }
    await setLocalStorageItem('access_token', access);
    return access;
  }

  // Interceptor de solicitud: adjuntar Authorization automáticamente si falta
  axios.interceptors.request.use(
    async (config) => {
      config.headers = config.headers || {};
      if (!config.headers['Accept']) {
        config.headers['Accept'] = 'application/json';
      }
      // No sobrescribir si ya está presente
      if (!config.headers['Authorization']) {
        const access = await getAccessToken();
        if (access) {
          config.headers['Authorization'] = `Bearer ${access}`;
        }
      }
      if (!config.timeout) {
        config.timeout = 30000;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor de respuesta: manejar 401 y refrescar
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error?.response?.status;
      const originalRequest = error.config || {};

      if (status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // En cola mientras se refresca
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return axios(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newAccess = await refreshAccessToken();
          processQueue(null, newAccess);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
          return axios(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          // Notificar al renderer que la sesión expiró
          if (ipcMain) {
            ipcMain.emit('session-expired', refreshErr.message || 'Sesión expirada');
          }
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  global.__mainAxiosInterceptorsConfigured = true;
}

async function handleApiError(error) {
  console.error('API Error:', error);
  
  let errorMessage = 'Error desconocido';
  
  if (error.response) {
    // Error de respuesta HTTP (4xx, 5xx)
    const { status, data } = error.response;
    
    console.log('Error response status:', status);
    console.log('Error response data:', data);
    
    if (status === 401) {
      errorMessage = 'No autorizado - Por favor inicie sesión nuevamente';
    } else if (status === 403) {
      errorMessage = 'Acceso denegado - No tiene permisos para esta acción';
    } else if (status === 404) {
      errorMessage = 'Recurso no encontrado';
    } else if (status === 500) {
      errorMessage = 'Error interno del servidor';
    } else if (status === 400 && data) {
      // Mostrar primer mensaje de error detallado si existe
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (typeof data === 'object') {
        // Tomar la primera clave y su mensaje
        const firstKey = Object.keys(data)[0];
        const firstMsg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
        
        // Mostrar el mensaje de error tal como viene del backend
        errorMessage = `${firstKey}: ${firstMsg}`;
      }
    } else if (data && data.detail) {
      errorMessage = data.detail;
    } else if (data && data.message) {
      errorMessage = data.message;
    } else {
      errorMessage = `Error ${status}`;
    }
  } else if (error.request) {
    // La solicitud fue hecha pero no se recibió respuesta
    errorMessage = 'No se recibió respuesta del servidor';
  } else if (error.message) {
    // Error antes de que se enviara la solicitud
    errorMessage = error.message;
  }

  console.log('Final error message:', errorMessage);

  // Si estás en el proceso principal, puedes usar ipcMain para enviar el error
  if (ipcMain) {
    ipcMain.emit('api-error', errorMessage);
  }

  return errorMessage;
}

module.exports = {
  handleApiError,
  API_BASE_URL,
};

// Debug: mostrar la URL del API al cargar
console.log('API_BASE_URL configurado como:', API_BASE_URL);