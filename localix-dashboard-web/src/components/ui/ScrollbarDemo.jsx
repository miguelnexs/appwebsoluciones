import React from 'react';
import { useTheme } from '../../hooks/useTheme';

const ScrollbarDemo = () => {
  const { currentTheme } = useTheme();

  return (
    <div className="p-6 space-y-6">
      <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
        <h2 className="text-2xl font-bold text-theme-text mb-4">
          Demostración de Barras de Scroll Personalizadas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scrollbar Vertical */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-theme-text">Scrollbar Vertical</h3>
            <div 
              className="h-64 bg-theme-secondary rounded-lg p-4 overflow-y-auto custom-scrollbar"
              style={{ maxHeight: '256px' }}
            >
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="mb-4 p-3 bg-theme-surface rounded border border-theme-border">
                  <h4 className="font-medium text-theme-text">Elemento {i + 1}</h4>
                  <p className="text-sm text-theme-textSecondary">
                    Este es el contenido del elemento {i + 1}. Las barras de scroll se adaptan automáticamente al tema seleccionado.
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Scrollbar Horizontal */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-theme-text">Scrollbar Horizontal</h3>
            <div 
              className="w-full bg-theme-secondary rounded-lg p-4 overflow-x-auto custom-scrollbar"
              style={{ maxWidth: '100%' }}
            >
              <div className="flex space-x-4" style={{ width: '800px' }}>
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="flex-shrink-0 w-48 p-3 bg-theme-surface rounded border border-theme-border">
                    <h4 className="font-medium text-theme-text">Card {i + 1}</h4>
                    <p className="text-sm text-theme-textSecondary">
                      Contenido de la tarjeta {i + 1}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Información del tema */}
        <div className="mt-8 p-4 bg-theme-primary bg-opacity-10 rounded-lg border border-theme-primary border-opacity-30">
          <h4 className="font-semibold text-theme-text mb-2">Información de Scrollbar</h4>
          <div className="text-sm text-theme-textSecondary space-y-1">
            <p><strong>Tema actual:</strong> {currentTheme?.name}</p>
            <p><strong>Color de scrollbar:</strong> {getComputedStyle(document.documentElement).getPropertyValue('--color-border')}</p>
            <p><strong>Color de fondo:</strong> {getComputedStyle(document.documentElement).getPropertyValue('--color-secondary')}</p>
            <p><strong>Ancho de scrollbar:</strong> 8px (global) / 6px (custom-scrollbar)</p>
          </div>
        </div>

        {/* Características */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-theme-secondary rounded-lg">
            <h5 className="font-medium text-theme-text mb-2">🎨 Adaptable</h5>
            <p className="text-xs text-theme-textSecondary">
              Las barras de scroll cambian automáticamente con el tema
            </p>
          </div>
          <div className="p-3 bg-theme-secondary rounded-lg">
            <h5 className="font-medium text-theme-text mb-2">🖱️ Interactivo</h5>
            <p className="text-xs text-theme-textSecondary">
              Efectos hover y transiciones suaves
            </p>
          </div>
          <div className="p-3 bg-theme-secondary rounded-lg">
            <h5 className="font-medium text-theme-text mb-2">🌐 Compatible</h5>
            <p className="text-xs text-theme-textSecondary">
              Funciona en Chrome, Firefox y otros navegadores
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollbarDemo;
