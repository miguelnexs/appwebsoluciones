const { ipcMain } = require('electron');

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
      API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8000'
};

// Debug: mostrar la URL del API al cargar
  console.log('API_BASE_URL configurado como:', process.env.API_BASE_URL || 'http://localhost:8000');