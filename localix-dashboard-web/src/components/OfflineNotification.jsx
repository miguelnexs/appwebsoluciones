import React, { useState, useEffect } from 'react';
import FallbackService from '../services/fallbackService';

const OfflineNotification = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Verificar estado inicial
    setIsOffline(FallbackService.isOfflineMode);
    
    // Configurar intervalo para verificar cambios en el modo offline
    const checkOfflineStatus = () => {
      const currentOfflineStatus = FallbackService.isOfflineMode;
      if (currentOfflineStatus !== isOffline) {
        setIsOffline(currentOfflineStatus);
        if (currentOfflineStatus) {
          setShowNotification(true);
          // Auto-ocultar después de 5 segundos
          setTimeout(() => setShowNotification(false), 5000);
        }
      }
    };

    const interval = setInterval(checkOfflineStatus, 1000);
    
    return () => clearInterval(interval);
  }, [isOffline]);

  const handleDismiss = () => {
    setShowNotification(false);
  };

  const handleRetryConnection = () => {
    FallbackService.disableOfflineMode();
    setIsOffline(false);
    setShowNotification(false);
    // Recargar la página para intentar reconectar
    window.location.reload();
  };

  if (!isOffline && !showNotification) {
    return null;
  }

  return (
    <>
      {/* Barra de estado persistente */}
      {isOffline && (
        <div className="bg-yellow-500 text-white px-4 py-2 text-sm flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Modo Demo Activo</span>
            <span>- Mostrando datos de ejemplo (sin conexión al servidor)</span>
          </div>
          <button
            onClick={handleRetryConnection}
            className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-xs font-medium transition-colors"
          >
            Reintentar Conexión
          </button>
        </div>
      )}

      {/* Notificación emergente */}
      {showNotification && (
        <div className="fixed top-4 right-4 bg-orange-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Conexión Perdida</h4>
              <p className="text-xs mt-1 opacity-90">
                No se pudo conectar al servidor. La aplicación continuará funcionando con datos de ejemplo.
              </p>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleRetryConnection}
                  className="bg-orange-600 hover:bg-orange-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                >
                  Reintentar
                </button>
                <button
                  onClick={handleDismiss}
                  className="bg-transparent border border-orange-300 hover:bg-orange-600 px-2 py-1 rounded text-xs font-medium transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OfflineNotification;