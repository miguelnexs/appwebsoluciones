import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const useConnectionStatus = () => {
  const [connectionError, setConnectionError] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(null);

  // Función para verificar la conexión
  const checkConnection = useCallback(async () => {
    setIsCheckingConnection(true);
    try {
      // Intentar hacer una petición simple al backend
      await api.get('categorias/test_connection/');
      setConnectionError(false);
      setLastCheckTime(new Date());
    } catch (error) {
      console.error('Error de conexión:', error);
      setConnectionError(true);
      setLastCheckTime(new Date());
    } finally {
      setIsCheckingConnection(false);
    }
  }, []);

  // Función para reintentar la conexión
  const retryConnection = useCallback(() => {
    checkConnection();
  }, [checkConnection]);

  // Verificar conexión al montar el hook
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Verificar conexión periódicamente cada 30 segundos si hay error
  useEffect(() => {
    if (connectionError) {
      const interval = setInterval(() => {
        checkConnection();
      }, 30000); // 30 segundos

      return () => clearInterval(interval);
    }
  }, [connectionError, checkConnection]);

  // Interceptor para detectar errores de conexión en tiempo real
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        // Si hay un error de conexión, intentar verificar de nuevo
        if (connectionError) {
          setConnectionError(false);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => {
        // Si la respuesta es exitosa, limpiar el error de conexión
        if (connectionError) {
          setConnectionError(false);
        }
        return response;
      },
      (error) => {
        // Detectar errores de conexión específicos
        if (
          !error.response || 
          error.code === 'ECONNREFUSED' || 
          error.code === 'NETWORK_ERROR' ||
          error.message?.includes('Network Error') ||
          error.message?.includes('ERR_NETWORK') ||
          error.message?.includes('ERR_CONNECTION_REFUSED')
        ) {
          setConnectionError(true);
        }
        return Promise.reject(error);
      }
    );

    // Cleanup de interceptors
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [connectionError]);

  return {
    connectionError,
    isCheckingConnection,
    lastCheckTime,
    checkConnection,
    retryConnection
  };
};
