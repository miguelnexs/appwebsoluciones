// src/context/AppContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import axios from 'axios';
import { CONNECTION_CONFIG, isConnectionError, isServerError } from '../utils/connectionConfig';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [connectionError, setConnectionError] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  
  const addToCart = (product) => {
    setCart([...cart, product]);
  };
  
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  // Función para verificar la conexión
  const checkConnection = useCallback(async () => {
    setIsCheckingConnection(true);
    try {
      // Usar axios directamente para el health check (sin el prefijo /api/)
      const response = await axios.get('http://localhost:8000/health/');
      
      // Verificar que la respuesta sea exitosa y contenga los datos esperados
      if (response.data && response.data.status === 'healthy') {
        setConnectionError(false);
      } else {
        console.error('Error de conexión: Respuesta inesperada del servidor');
        setConnectionError(true);
      }
    } catch (error) {
      console.error('Error de conexión:', error.message);
      
      // Detectar diferentes tipos de errores de conexión
      if (isConnectionError(error)) {
        setConnectionError(true);
      } else if (isServerError(error.response?.status)) {
        setConnectionError(true);
      } else {
        setConnectionError(false);
      }
    } finally {
      setIsCheckingConnection(false);
    }
  }, []);

  // Función para reintentar la conexión
  const retryConnection = useCallback(() => {
    checkConnection();
  }, [checkConnection]);

  // Verificar conexión al montar el componente
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Verificar conexión periódicamente si hay error
  useEffect(() => {
    if (connectionError) {
      const interval = setInterval(() => {
        checkConnection();
      }, CONNECTION_CONFIG.CHECK_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [connectionError, checkConnection]);

  // Interceptor para detectar errores de conexión en tiempo real
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
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
        if (isConnectionError(error)) {
          setConnectionError(true);
        } else if (isServerError(error.response?.status)) {
          setConnectionError(true);
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [connectionError]);
  
  return (
    <AppContext.Provider value={{
      cart,
      user,
      connectionError,
      isCheckingConnection,
      addToCart,
      removeFromCart,
      setUser,
      retryConnection,
      checkConnection
    }}>
      {children}
    </AppContext.Provider>
  );
};