import { useState, useEffect, useCallback } from 'react';

// Cache global para categorías
let categoriesCache = {
  data: null,
  timestamp: null,
  loading: false
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useCategoriesCache = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCategories = useCallback(async (forceRefresh = false) => {
    // Verificar si hay cache válido
    const now = Date.now();
    const isCacheValid = categoriesCache.data && 
                        categoriesCache.timestamp && 
                        (now - categoriesCache.timestamp) < CACHE_DURATION;

    if (!forceRefresh && isCacheValid) {
      setCategories(categoriesCache.data);
      setLoading(false);
      return categoriesCache.data;
    }

    // Si ya está cargando, no hacer otra petición
    if (categoriesCache.loading) {
      return;
    }

    setLoading(true);
    setError(null);
    categoriesCache.loading = true;

    try {
      const categoriesData = await window.electronAPI.categorias.listar();
      const categoriesArray = Array.isArray(categoriesData) ? categoriesData : [];
      
      // Actualizar cache
      categoriesCache = {
        data: categoriesArray,
        timestamp: now,
        loading: false
      };

      setCategories(categoriesArray);
      return categoriesArray;
    } catch (err) {
      setError(`Error al cargar categorías: ${err.message}`);
      categoriesCache.loading = false;
      throw err;
    } finally {
      setLoading(false);
      categoriesCache.loading = false;
    }
  }, []);

  const refreshCategories = useCallback(() => {
    return loadCategories(true);
  }, [loadCategories]);

  const ensureGeneralCategory = useCallback(async () => {
    try {
      const result = await window.electronAPI.categorias.ensureGeneralCategory();
      
      // Si se creó una nueva categoría, refrescar el cache
      if (result && !categories.find(cat => cat.slug === 'general')) {
        await refreshCategories();
      }
      
      return result;
    } catch (err) {
      setError(`Error al asegurar categoría general: ${err.message}`);
      throw err;
    }
  }, [categories, refreshCategories]);

  // Cargar categorías al montar el componente
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    refreshCategories,
    ensureGeneralCategory
  };
};
