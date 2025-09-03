/**
 * Utilidades para manejo de imágenes locales
 */

import { RESOURCE_URL } from '../api/apiConfig';

/**
 * Obtiene la URL completa de una imagen
 * @param {string} url - URL de la imagen
 * @returns {string} URL completa
 */
export function getImageUrl(url) {
  if (!url) return '';
  
  // Si es una URL completa de cualquier dominio, devolverla tal cual
  if (url.startsWith('http')) {
    return url;
  }
  
  // Si es una ruta relativa, construir URL completa
  return RESOURCE_URL(url);
}

/**
 * Obtiene la URL de una imagen
 * @param {string} url - URL base de la imagen
 * @param {object} transformations - Parámetros adicionales (no aplicados en almacenamiento local)
 * @returns {string} URL de la imagen
 */
export function getImageUrlWithTransformations(url, transformations = {}) {
  // En almacenamiento local, simplemente devolvemos la URL base
  return getImageUrl(url);
}

/**
 * Obtiene una imagen optimizada para diferentes tamaños
 * @param {string} url - URL base de la imagen
 * @param {string} size - Tamaño deseado ('thumbnail', 'small', 'medium', 'large')
 * @returns {string} URL de la imagen
 */
export function getOptimizedImageUrl(url, size = 'medium') {
  // En almacenamiento local, simplemente devolvemos la URL base
  return getImageUrl(url);
}

/**
 * Obtiene una imagen con formato WebP optimizado
 * @param {string} url - URL base de la imagen
 * @param {object} transformations - Transformaciones adicionales (no aplicadas en almacenamiento local)
 * @returns {string} URL de la imagen
 */
export function getWebPImageUrl(url, transformations = {}) {
  // En almacenamiento local, simplemente devolvemos la URL base
  return getImageUrl(url);
}

/**
 * Verifica si una URL es externa (anteriormente verificaba si era de Cloudinary)
 * @param {string} url - URL a verificar
 * @returns {boolean} True si es una URL externa
 */
export function isCloudinaryUrl(url) {
  // Mantenemos el nombre de la función por compatibilidad, pero ahora verifica si es una URL externa
  return url && url.startsWith('http');
}

/**
 * Obtiene el nombre del archivo desde una URL
 * @param {string} url - URL de la imagen
 * @returns {string} Nombre del archivo
 */
export function getCloudinaryFileName(url) {
  // Mantenemos el nombre de la función por compatibilidad
  if (!url) return '';
  
  const urlParts = url.split('/');
  return urlParts[urlParts.length - 1];
}

/**
 * Obtiene la URL base sin transformaciones
 * @param {string} url - URL de la imagen
 * @returns {string} URL base sin transformaciones
 */
export function getBaseImageUrl(url) {
  // En almacenamiento local, simplemente devolvemos la URL original
  return getImageUrl(url);
}

/**
 * Maneja errores de carga de imágenes
 * @param {Event} event - Evento de error
 * @param {string} fallbackUrl - URL de respaldo
 */
export function handleImageError(event, fallbackUrl = '') {
  const img = event.target;
  
  // Si ya se intentó con la URL de respaldo, mostrar placeholder
  if (img.dataset.fallbackAttempted) {
    img.style.display = 'none';
    const placeholder = img.nextElementSibling;
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
    return;
  }
  
  // Intentar con URL de respaldo
  if (fallbackUrl && img.src !== fallbackUrl) {
    img.dataset.fallbackAttempted = 'true';
    img.src = fallbackUrl;
    return;
  }
  
  // Mostrar placeholder
  img.style.display = 'none';
  const placeholder = img.nextElementSibling;
  if (placeholder) {
    placeholder.style.display = 'flex';
  }
}

/**
 * Componente de imagen optimizada para React
 * @param {object} props - Propiedades del componente
 * @returns {JSX.Element} Elemento de imagen optimizada
 */
export function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  size = 'medium',
  fallbackUrl = '',
  onError,
  ...props 
}) {
  const optimizedSrc = getOptimizedImageUrl(src, size);
  
  const handleError = (event) => {
    if (onError) {
      onError(event);
    } else {
      handleImageError(event, fallbackUrl);
    }
  };
  
  return (
    <img
      src={optimizedSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}