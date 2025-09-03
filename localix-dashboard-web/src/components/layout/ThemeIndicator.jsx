import React from 'react';
import { Palette, Sun, Moon, Droplets } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

const ThemeIndicator = ({ collapsed = false }) => {
  const { currentTheme, settings } = useSettings();

  const themeIcons = {
    default: Moon,
    dark: Moon,
    blue: Droplets,
    light: Sun
  };

  const Icon = themeIcons[settings.theme] || Palette;

  if (collapsed) {
    return (
      <div className="flex items-center justify-center p-2">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200"
          style={{ backgroundColor: currentTheme?.colors.primary || '#1e40af' }}
          title={`Tema: ${currentTheme?.name || 'Predeterminado'}`}
        >
          <Icon size={16} className="text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-theme-sidebar-surface/80 rounded-lg border border-theme-sidebar/30 shadow-lg backdrop-blur-sm sidebar-glass">
      <div 
        className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
        style={{ backgroundColor: currentTheme?.colors.primary || '#1e40af' }}
      >
        <Icon size={16} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-theme-sidebar truncate">
          {currentTheme?.name || 'Tema Predeterminado'}
        </p>
        <p className="text-xs text-theme-sidebar-secondary truncate">
          Tema activo
        </p>
      </div>
    </div>
  );
};

export default ThemeIndicator;
