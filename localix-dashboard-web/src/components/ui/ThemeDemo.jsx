import React from 'react';
import { useTheme } from '../../hooks/useTheme';

const ThemeDemo = () => {
  const { currentTheme, getThemeColor } = useTheme();

  return (
    <div className="p-6 space-y-6">
      <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
        <h2 className="text-2xl font-bold text-theme-text mb-4">
          Demostración de Tema: {currentTheme?.name}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Botones */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-theme-text">Botones</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 rounded-lg bg-theme-primary text-white hover:bg-opacity-90 transition-colors">
                Botón Primario
              </button>
              <button className="w-full px-4 py-2 rounded-lg bg-theme-secondary text-white hover:bg-opacity-90 transition-colors">
                Botón Secundario
              </button>
              <button className="w-full px-4 py-2 rounded-lg bg-theme-accent text-white hover:bg-opacity-90 transition-colors">
                Botón Accent
              </button>
            </div>
          </div>

          {/* Estados */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-theme-text">Estados</h3>
            <div className="space-y-2">
              <div className="px-3 py-2 rounded-lg bg-theme-success text-white text-sm">
                Estado de Éxito
              </div>
              <div className="px-3 py-2 rounded-lg bg-theme-warning text-white text-sm">
                Estado de Advertencia
              </div>
              <div className="px-3 py-2 rounded-lg bg-theme-error text-white text-sm">
                Estado de Error
              </div>
            </div>
          </div>

          {/* Textos */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-theme-text">Tipografía</h3>
            <div className="space-y-2">
              <p className="text-theme-text font-medium">Texto principal del tema</p>
              <p className="text-theme-textSecondary text-sm">Texto secundario del tema</p>
              <p className="text-theme-accent font-semibold">Texto con color accent</p>
            </div>
          </div>
        </div>

        {/* Paleta de colores */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-theme-text mb-4">Paleta de Colores</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(currentTheme?.colors || {}).map(([key, value]) => (
              <div key={key} className="text-center">
                <div
                  className="w-full h-16 rounded-lg border border-theme-border mb-2"
                  style={{ backgroundColor: value }}
                />
                <p className="text-xs text-theme-textSecondary font-mono">{key}</p>
                <p className="text-xs text-theme-textSecondary font-mono">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Información del tema */}
        <div className="mt-8 p-4 bg-theme-primary bg-opacity-10 rounded-lg border border-theme-primary border-opacity-30">
          <h4 className="font-semibold text-theme-text mb-2">Información del Tema</h4>
          <div className="text-sm text-theme-textSecondary space-y-1">
            <p><strong>Nombre:</strong> {currentTheme?.name}</p>
            <p><strong>Colores definidos:</strong> {Object.keys(currentTheme?.colors || {}).length}</p>
            <p><strong>Color primario:</strong> {getThemeColor('primary')}</p>
            <p><strong>Color de fondo:</strong> {getThemeColor('background')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeDemo;
