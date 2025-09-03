import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';

const ConnectionErrorPage = ({ children }) => {
  const context = useContext(AppContext);
  
  // Verificar que el contexto esté disponible
  if (!context) {
    return children;
  }

  const { connectionError, isCheckingConnection, retryConnection } = context;

  // Si está verificando la conexión, mostrar un loading
  if (isCheckingConnection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Verificando conexión...
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Comprobando la conectividad con el servidor
          </p>
        </div>
      </div>
    );
  }

  // Si hay error de conexión, mostrar la página de error
  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          {/* Icono de error */}
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
            <svg 
              className="w-10 h-10 text-red-600 dark:text-red-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" 
              />
            </svg>
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Sin Conexión al Servidor
          </h1>

          {/* Descripción */}
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            No se puede establecer conexión con la base de datos. 
            Esto puede deberse a problemas de red o el servidor está fuera de servicio.
          </p>

          {/* Lista de posibles soluciones */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Posibles soluciones:
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Verifica tu conexión a internet
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Asegúrate de que el servidor esté ejecutándose
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Contacta al administrador del sistema
              </li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <button
              onClick={retryConnection}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reintentar Conexión
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Recargar Página
            </button>
          </div>

          {/* Información adicional */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Si el problema persiste, contacta al soporte técnico
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay error, mostrar el contenido normal
  return children;
};

export default ConnectionErrorPage;
