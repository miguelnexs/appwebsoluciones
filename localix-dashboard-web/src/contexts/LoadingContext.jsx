// src/context/LoadingContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState(new Map());

  // Configurar estado de carga
  const setLoading = useCallback((key, isLoading, options = {}) => {
    setLoadingStates(prev => {
      const newStates = new Map(prev);
      
      if (isLoading) {
        newStates.set(key, {
          loading: true,
          message: options.message || 'Cargando...',
          type: options.type || 'default', // 'default', 'overlay', 'inline', 'button'
          blocking: options.blocking !== false, // Por defecto es true
          progress: options.progress || null,
          timestamp: Date.now()
        });
      } else {
        newStates.delete(key);
      }
      
      return newStates;
    });
  }, []);

  // Obtener estado de carga específico
  const isLoading = useCallback((key) => {
    return loadingStates.has(key);
  }, [loadingStates]);

  // Obtener detalles del estado de carga
  const getLoadingState = useCallback((key) => {
    return loadingStates.get(key) || null;
  }, [loadingStates]);

  // Verificar si hay algún loading bloqueante
  const hasBlockingLoading = useCallback(() => {
    return Array.from(loadingStates.values()).some(state => state.blocking);
  }, [loadingStates]);

  // Obtener todos los estados de carga
  const getAllLoadingStates = useCallback(() => {
    return Array.from(loadingStates.entries()).map(([key, state]) => ({
      key,
      ...state
    }));
  }, [loadingStates]);

  // Limpiar todos los estados de carga
  const clearAllLoading = useCallback(() => {
    setLoadingStates(new Map());
  }, []);

  // Configurar loading con progresso
  const setLoadingWithProgress = useCallback((key, progress, message) => {
    setLoading(key, true, {
      message,
      progress,
      type: 'progress'
    });
  }, [setLoading]);

  const value = {
    setLoading,
    isLoading,
    getLoadingState,
    hasBlockingLoading,
    getAllLoadingStates,
    clearAllLoading,
    setLoadingWithProgress,
    loadingStates: Array.from(loadingStates.keys()) // Solo las keys para debugging
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingContext;
