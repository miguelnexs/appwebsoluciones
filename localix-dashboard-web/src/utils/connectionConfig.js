// Configuración del sistema de detección de conexión
export const CONNECTION_CONFIG = {
  // Endpoint para verificar la conexión
  TEST_ENDPOINT: 'health/',
  
  // Intervalo de verificación automática (en milisegundos)
  CHECK_INTERVAL: 30000, // 30 segundos
  
  // Timeout para las peticiones de verificación (en milisegundos)
  REQUEST_TIMEOUT: 10000, // 10 segundos
  
  // Mensajes de error personalizables
  MESSAGES: {
    TITLE: 'Sin Conexión a la Base de Datos',
    DESCRIPTION: 'No se puede establecer conexión con la base de datos del sistema.',
    CAUSES: [
      'El servidor no está ejecutándose',
      'Problemas de red',
      'La base de datos está fuera de servicio',
      'El servidor está sobrecargado'
    ],
    SOLUTIONS: [
      'Verifica tu conexión a internet',
      'Asegúrate de que el servidor esté ejecutándose',
      'Contacta al administrador del sistema',
      'Espera unos minutos y reintenta'
    ],
    RETRY_BUTTON: 'Reintentar Conexión',
    RELOAD_BUTTON: 'Recargar Página',
    SUPPORT_TEXT: 'Si el problema persiste, contacta al administrador del sistema'
  },
  
  // Tipos de errores que se consideran errores de conexión
  CONNECTION_ERRORS: [
    'ECONNREFUSED',
    'NETWORK_ERROR',
    'ERR_NETWORK',
    'ERR_CONNECTION_REFUSED',
    'ERR_EMPTY_RESPONSE',
    'ERR_TIMED_OUT',
    'ERR_INTERNET_DISCONNECTED',
    'Network Error',
    'Failed to fetch',
    'timeout',
    'fetch'
  ],
  
  // Códigos de estado HTTP que indican problemas de servidor
  SERVER_ERROR_CODES: [500, 502, 503, 504, 0],
  
  // Configuración de debug
  DEBUG: {
    ENABLED: false, // Cambiar a true solo para desarrollo
    LOG_LEVEL: 'error', // Solo mostrar errores importantes
    SHOW_TEST_PANEL: false // Deshabilitado por defecto
  }
};

// Función para verificar si un error es de conexión
export const isConnectionError = (error) => {
  if (!error) return false;
  
  const message = error.message || '';
  const code = error.code || '';
  
  return CONNECTION_CONFIG.CONNECTION_ERRORS.some(errorType => 
    message.includes(errorType) || code === errorType
  );
};

// Función para verificar si un código de estado indica error de servidor
export const isServerError = (status) => {
  return CONNECTION_CONFIG.SERVER_ERROR_CODES.includes(status);
};

// Función para obtener mensaje de error personalizado
export const getErrorMessage = (error) => {
  if (isConnectionError(error)) {
    return 'Error de conexión al servidor';
  }
  
  if (error.response?.status >= 500) {
    return 'Error interno del servidor';
  }
  
  return 'Error desconocido';
};
