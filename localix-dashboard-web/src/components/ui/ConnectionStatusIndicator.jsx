import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';

const ConnectionStatusIndicator = () => {
  const context = useContext(AppContext);
  
  // Verificar que el contexto esté disponible
  if (!context) {
    return null;
  }

  const { connectionError, isCheckingConnection, retryConnection } = context;

  if (!connectionError && !isCheckingConnection) {
    return null; // No mostrar nada si no hay problemas
  }

  return (
    <div className="fixed top-4 right-4 z-40">
      {isCheckingConnection && (
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          <span className="text-sm font-medium">Verificando conexión...</span>
        </div>
      )}
      
      {connectionError && !isCheckingConnection && (
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-sm font-medium">Sin conexión a BD</span>
          <button
            onClick={retryConnection}
            className="ml-2 bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatusIndicator;
