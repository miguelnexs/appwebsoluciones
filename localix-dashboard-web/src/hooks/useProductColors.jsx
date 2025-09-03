import { useState, useEffect, useCallback, useRef } from 'react';

// Cache global para colores
const colorCache = new Map();
const CACHE_DURATION = 30000; // 30 segundos

export const useProductColors = (productId) => {
  const [colores, setColores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const abortControllerRef = useRef(null);

  // Función para limpiar cache
  const clearCache = useCallback(() => {
    colorCache.clear();
  }, []);

  // Función para invalidar cache de un producto específico
  const invalidateCache = useCallback((productId) => {
    if (productId) {
      colorCache.delete(productId);
    }
  }, []);

  // Función optimizada para cargar colores
  const cargarColores = useCallback(async (forceRefresh = false) => {
    if (!productId) return;

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();

    // Verificar caché primero (a menos que se fuerce refresh)
    if (!forceRefresh && colorCache.has(productId)) {
      const cachedData = colorCache.get(productId);
      if (Date.now() - cachedData.timestamp < CACHE_DURATION) {
        setColores(cachedData.data);
        setLoading(false);
        setError('');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const response = await window.electronAPI.productos.obtenerColores(productId);

      if (response.success) {
        const coloresData = Array.isArray(response.data) ? response.data : [];

        // Guardar en caché
        colorCache.set(productId, {
          data: coloresData,
          timestamp: Date.now()
        });

        setColores(coloresData);
      } else {
        setError('Error al cargar colores');
        setColores([]);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error cargando colores:', error);
        setError('Error de conexión');
        setColores([]);
      }
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Efecto para cargar colores
  useEffect(() => {
    cargarColores();
    
    // Cleanup: abortar request al desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [cargarColores]);

  // Función para recargar colores
  const recargarColores = useCallback(() => {
    cargarColores(true);
  }, [cargarColores]);

  return {
    colores,
    loading,
    error,
    recargarColores,
    clearCache,
    invalidateCache
  };
};

export default useProductColors; 
