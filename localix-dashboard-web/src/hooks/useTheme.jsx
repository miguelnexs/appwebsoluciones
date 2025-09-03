import { useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

export const useTheme = () => {
  const { settings, currentTheme, themes, isLoading } = useSettings();

  // Si está cargando, retornar valores por defecto
  if (isLoading) {
    return {
      currentTheme: null,
      themes: {},
      settings: {
        theme: 'light',
        compactMode: false,
        animations: true,
        notifications: true
      },
      getThemeColor: () => '#1e40af',
      getThemeStyles: () => ({}),
      isCompactMode: false,
      animationsEnabled: true,
      notificationsEnabled: true
    };
  }

  // Aplicar clases CSS basadas en la configuración
  useEffect(() => {
    if (!settings || !themes) return;
    
    const root = document.documentElement;
    
    // Aplicar modo compacto
    if (settings.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }

    // Aplicar animaciones
    if (settings.animations) {
      root.classList.add('animations-enabled');
    } else {
      root.classList.remove('animations-enabled');
    }

    // Aplicar tema actual
    if (settings.theme) {
      root.setAttribute('data-theme', settings.theme);
      
      // Aplicar variables CSS del tema actual
      const currentTheme = themes[settings.theme];
      if (currentTheme && currentTheme.colors) {
        Object.entries(currentTheme.colors).forEach(([key, value]) => {
          root.style.setProperty(`--color-${key}`, value);
        });
      }
    }
    
    // Aplicar estilos de scrollbar basados en el tema
    const scrollbarThumbColor = getComputedStyle(root).getPropertyValue('--color-border');
    const scrollbarTrackColor = getComputedStyle(root).getPropertyValue('--color-secondary');
    root.style.setProperty('--scrollbar-thumb', scrollbarThumbColor);
    root.style.setProperty('--scrollbar-track', scrollbarTrackColor);
  }, [settings?.compactMode, settings?.animations, settings?.theme, themes]);

  // Función para obtener color del tema actual
  const getThemeColor = (colorKey) => {
    return currentTheme?.colors?.[colorKey] || '#1e40af';
  };

  // Función para aplicar estilos inline con colores del tema
  const getThemeStyles = (elementType = 'background') => {
    const styles = {};
    
    switch (elementType) {
      case 'background':
        styles.backgroundColor = getThemeColor('background');
        break;
      case 'surface':
        styles.backgroundColor = getThemeColor('surface');
        break;
      case 'primary':
        styles.backgroundColor = getThemeColor('primary');
        break;
      case 'text':
        styles.color = getThemeColor('text');
        break;
      case 'textSecondary':
        styles.color = getThemeColor('textSecondary');
        break;
      case 'border':
        styles.borderColor = getThemeColor('border');
        break;
      default:
        break;
    }
    
    return styles;
  };

  return {
    currentTheme,
    themes,
    settings,
    getThemeColor,
    getThemeStyles,
    isCompactMode: settings?.compactMode || false,
    animationsEnabled: settings?.animations || true,
    notificationsEnabled: settings?.notifications || true
  };
};
