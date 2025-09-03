import React, { useState, useEffect } from 'react';

const Loader = ({ 
  isLoading = false, 
  message = "Cargando...", 
  progress = 0,
  onComplete = null 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
    } else {
      // Esperar un momento antes de ocultar para mostrar el 100%
      setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, 200);
    }
  }, [isLoading, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-theme-surface rounded-lg shadow-xl p-6 w-80 max-w-sm mx-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Icono de carga */}
          <div className="w-12 h-12 border-3 border-theme-border border-t-blue-600 rounded-full animate-spin"></div>
          
          {/* Mensaje */}
          <p className="text-theme-textSecondary font-medium text-center">{message}</p>
          
          {/* Barra de progreso */}
          <div className="w-full">
            <div className="w-full bg-theme-border rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            {/* Porcentaje */}
            <div className="text-center mt-2">
              <span className="text-sm text-theme-textSecondary font-medium">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
