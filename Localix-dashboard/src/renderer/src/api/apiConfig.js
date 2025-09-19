// URL base de la API actualizada
const API_BASE_URL = 'http://localhost:8000';

// Helper para endpoints de la API REST
export const API_URL = (path) => `${API_BASE_URL}/api/${path.replace(/^\/+/,'')}`;

// Helper para recursos estáticos (imágenes, etc.)
export const RESOURCE_URL = (path) => {
  // Si la URL ya es absoluta (http/https), devolverla tal cual
  if (path.startsWith('http')) {
    return path;
  }
  
  // Si es una ruta relativa, construir la URL completa
  return `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
};

export default API_BASE_URL;