// src/components/ui/LoadingComponents.jsx
import React, { useCallback } from 'react';
import { Loader, RefreshCw, AlertCircle, Package } from 'lucide-react';
import { useLoading } from '../../contexts/LoadingContext';

// Spinner básico reutilizable
export const Spinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    gray: 'border-gray-600',
    white: 'border-white'
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        border-2 border-theme-border ${colorClasses[color]} 
        border-t-transparent rounded-full animate-spin
      `}
    />
  );
};

// Loading inline para contenido específico
export const InlineLoading = ({ 
  message = 'Cargando...', 
  size = 'md',
  showSpinner = true,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-3 text-theme-textSecondary ${className}`}>
      {showSpinner && <Spinner size={size} />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

// Loading con progreso
export const ProgressLoading = ({ 
  message = 'Cargando...', 
  progress = 0,
  showPercentage = true 
}) => {
  return (
    <div className="w-full max-w-md">
      <div className="flex items-center gap-3 mb-2">
        <Spinner size="sm" />
        <span className="text-sm font-medium text-theme-textSecondary">{message}</span>
      </div>
      
      <div className="w-full bg-theme-border rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
      
      {showPercentage && (
        <div className="text-center mt-2">
          <span className="text-xs text-theme-textSecondary font-medium">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
};

// Skeleton loader para contenido
export const CardSkeleton = ({ count = 1 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="bg-theme-surface p-6 rounded-lg border animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-theme-border rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-theme-border rounded w-3/4"></div>
              <div className="h-3 bg-theme-border rounded w-1/2"></div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 bg-theme-border rounded"></div>
            <div className="h-3 bg-theme-border rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Loading overlay global
export const LoadingOverlay = ({ 
  message = 'Cargando...', 
  progress = null,
  onCancel = null 
}) => {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-theme-surface rounded-lg shadow-xl p-8 w-80 max-w-sm mx-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Spinner principal */}
          <Spinner size="xl" />
          
          {/* Mensaje */}
          <p className="text-theme-textSecondary font-medium text-center">{message}</p>
          
          {/* Progress bar si se proporciona */}
          {progress !== null && (
            <div className="w-full">
              <ProgressLoading 
                message="" 
                progress={progress} 
                showPercentage={true}
              />
            </div>
          )}
          
          {/* Botón de cancelar si se proporciona */}
          {onCancel && (
            <button
              onClick={onCancel}
              className="mt-4 px-4 py-2 text-sm text-theme-textSecondary hover:text-theme-text transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Loading button para acciones
export const LoadingButton = ({ 
  loading = false,
  children,
  loadingText = 'Cargando...',
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <button
      disabled={loading || disabled}
      className={`
        relative flex items-center justify-center gap-2 
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        ${className}
      `}
      {...props}
    >
      {loading && <Spinner size="sm" color="white" />}
      <span>{loading ? loadingText : children}</span>
    </button>
  );
};

// Estado de error reutilizable
export const ErrorState = ({ 
  message = 'Ha ocurrido un error',
  onRetry = null,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-theme-text mb-2">Error</h3>
      <p className="text-theme-textSecondary mb-4 text-center max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      )}
    </div>
  );
};

// Estado vacío reutilizable
export const EmptyState = ({ 
  title = 'No hay datos',
  description = 'No se encontraron elementos para mostrar',
  action = null,
  icon = null,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      {icon || (
        <div className="w-16 h-16 bg-theme-secondary rounded-full flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-theme-textSecondary" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-theme-text mb-2">{title}</h3>
      <p className="text-theme-textSecondary mb-4 text-center max-w-md">{description}</p>
      {action}
    </div>
  );
};

// Hook personalizado para manejar loading states fácilmente
export const useLoadingState = (key) => {
  const { setLoading, isLoading, getLoadingState } = useLoading();
  
  const startLoading = useCallback((options = {}) => {
    setLoading(key, true, options);
  }, [key, setLoading]);
  
  const stopLoading = useCallback(() => {
    setLoading(key, false);
  }, [key, setLoading]);
  
  const updateProgress = useCallback((progress, message) => {
    setLoading(key, true, { progress, message, type: 'progress' });
  }, [key, setLoading]);
  
  return {
    isLoading: isLoading(key),
    startLoading,
    stopLoading,
    updateProgress,
    loadingState: getLoadingState(key)
  };
};

// Componente global que renderiza todos los overlays
export const GlobalLoadingManager = () => {
  const { getAllLoadingStates } = useLoading();
  const blockingLoading = getAllLoadingStates()
    .filter(state => state.blocking && state.type !== 'button')
    .sort((a, b) => a.timestamp - b.timestamp)[0]; // Solo mostrar el más antiguo

  if (!blockingLoading) return null;

  return (
    <LoadingOverlay
      message={blockingLoading.message}
      progress={blockingLoading.progress}
    />
  );
};
