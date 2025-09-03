import React, { useState, useCallback } from 'react';
import { usePreload } from '../../contexts/PreloadContext';

// 🚀 COMPONENTE INDICADOR DE PRE-CARGA
const PreloadIndicator = ({ showDetails = false, className = '' }) => {
  const { 
    preloadState, 
    config, 
    setConfig, 
    preloadAll, 
    forceRefresh,
    PRELOAD_STATES 
  } = usePreload();
  
  const [isExpanded, setIsExpanded] = useState(false);

  // 🚀 CALCULAR ESTADO GENERAL
  const getOverallStatus = useCallback(() => {
    const states = Object.values(preloadState).map(item => item.state);
    
    if (states.every(state => state === PRELOAD_STATES.SUCCESS)) {
      return { status: 'success', text: '✅ Datos actualizados', color: 'text-blue-600' };
    }
    
    if (states.some(state => state === PRELOAD_STATES.LOADING)) {
      return { status: 'loading', text: '🔄 Cargando...', color: 'text-blue-600' };
    }
    
    if (states.some(state => state === PRELOAD_STATES.ERROR)) {
      return { status: 'error', text: '❌ Error en carga', color: 'text-red-600' };
    }
    
    return { status: 'idle', text: '⏳ Esperando...', color: 'text-theme-textSecondary' };
  }, [preloadState, PRELOAD_STATES]);

  // 🚀 CALCULAR TIEMPO DESDE ÚLTIMA ACTUALIZACIÓN
  const getTimeSinceUpdate = useCallback((lastUpdated) => {
    if (!lastUpdated) return 'Nunca';
    
    const now = Date.now();
    const diff = now - lastUpdated;
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }, []);

  // 🚀 MANEJAR REFRESH MANUAL
  const handleManualRefresh = useCallback(async () => {
    try {
      await forceRefresh('all');
    } catch (error) {
      console.error('Error en refresh manual:', error);
    }
  }, [forceRefresh]);

  // 🚀 MANEJAR TOGGLE DE CONFIGURACIÓN
  const handleToggleConfig = useCallback((key) => {
    setConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, [setConfig]);

  const overallStatus = getOverallStatus();

  return (
    <div className={`preload-indicator ${className}`}>
      {/* 🚀 INDICADOR PRINCIPAL */}
      <div className="flex items-center justify-between p-3 bg-theme-background rounded-lg border">
        <div className="flex items-center space-x-3">
          <div className={`text-sm font-medium ${overallStatus.color}`}>
            {overallStatus.text}
          </div>
          
          {config.isEnabled && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-theme-textSecondary">Auto:</span>
              <button
                onClick={() => handleToggleConfig('autoRefresh')}
                className={`px-2 py-1 text-xs rounded ${
                  config.autoRefresh 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-theme-secondary text-theme-textSecondary'
                }`}
              >
                {config.autoRefresh ? 'ON' : 'OFF'}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-theme-textSecondary hover:text-theme-textSecondary"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          
          <button
            onClick={handleManualRefresh}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            title="Actualizar datos manualmente"
          >
            🔄
          </button>
        </div>
      </div>

      {/* 🚀 DETALLES EXPANDIDOS */}
      {isExpanded && (
        <div className="mt-3 p-3 bg-theme-surface rounded-lg border space-y-3">
          {/* 🚀 CONFIGURACIÓN */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-theme-textSecondary">Configuración</h4>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.isEnabled}
                  onChange={() => handleToggleConfig('isEnabled')}
                  className="rounded"
                />
                <span className="text-xs">Habilitado</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.backgroundLoading}
                  onChange={() => handleToggleConfig('backgroundLoading')}
                  className="rounded"
                />
                <span className="text-xs">Carga en segundo plano</span>
              </label>
            </div>
          </div>

          {/* 🚀 ESTADO DE DATOS */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-theme-textSecondary">Estado de Datos</h4>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(preloadState).map(([key, data]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-theme-background rounded">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium capitalize">
                      {key === 'products' ? 'Productos' : 
                       key === 'categories' ? 'Categorías' : 'Dashboard'}
                    </span>
                    
                    <span className={`text-xs px-2 py-1 rounded ${
                      data.state === PRELOAD_STATES.SUCCESS ? 'bg-blue-100 text-blue-700' :
                      data.state === PRELOAD_STATES.LOADING ? 'bg-blue-100 text-blue-700' :
                      data.state === PRELOAD_STATES.ERROR ? 'bg-red-100 text-red-700' :
                      'bg-theme-secondary text-theme-textSecondary'
                    }`}>
                      {data.state === PRELOAD_STATES.SUCCESS ? '✅' :
                       data.state === PRELOAD_STATES.LOADING ? '🔄' :
                       data.state === PRELOAD_STATES.ERROR ? '❌' : '⏳'}
                    </span>
                  </div>
                  
                  <div className="text-xs text-theme-textSecondary">
                    {data.lastUpdated ? getTimeSinceUpdate(data.lastUpdated) : 'Nunca'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 🚀 ACCIONES RÁPIDAS */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-theme-textSecondary">Acciones Rápidas</h4>
            <div className="flex space-x-2">
              <button
                onClick={() => forceRefresh('products')}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Productos
              </button>
              <button
                onClick={() => forceRefresh('categories')}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Categorías
              </button>
              <button
                onClick={() => forceRefresh('dashboard')}
                className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Dashboard
              </button>
            </div>
          </div>

          {/* 🚀 ESTADÍSTICAS */}
          {showDetails && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-theme-textSecondary">Estadísticas</h4>
              <div className="text-xs text-theme-textSecondary space-y-1">
                <div>Total de datos cargados: {Object.values(preloadState).filter(d => d.data).length}/3</div>
                <div>Última actualización: {Math.max(...Object.values(preloadState).map(d => d.lastUpdated || 0))}</div>
                <div>Estado general: {overallStatus.status}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PreloadIndicator;
