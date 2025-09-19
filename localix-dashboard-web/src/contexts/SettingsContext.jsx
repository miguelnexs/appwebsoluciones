import React, { createContext, useContext, useState, useEffect } from 'react';

// Función para determinar si un color es oscuro o claro
const isDarkColor = (color) => {
  // Convertir hex a RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calcular luminancia
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
};

// Función para obtener colores de texto adaptativos
const getAdaptiveTextColors = (themeColors) => {
  const isDarkTheme = isDarkColor(themeColors.background);
  
  return {
    ...themeColors,
    text: isDarkTheme ? '#ffffff' : '#111827', // Blanco en temas oscuros, negro en claros
    textSecondary: isDarkTheme ? '#9ca3af' : '#6b7280', // Gris claro en oscuros, gris medio en claros
    textMuted: isDarkTheme ? '#6b7280' : '#9ca3af', // Gris medio en oscuros, gris claro en claros
    textInverse: isDarkTheme ? '#111827' : '#ffffff', // Negro en temas oscuros, blanco en claros
  };
};

// Definir temas disponibles
const themes = {
  dark: {
    name: 'Tema Oscuro',
    colors: getAdaptiveTextColors({
      primary: '#1f2937', // gray-800
      secondary: '#111827', // gray-900
      accent: '#6366f1', // indigo-500
      background: '#000000', // black
      surface: '#1f2937', // gray-800
      border: '#374151', // gray-700
      success: '#059669', // emerald-600
      warning: '#d97706', // amber-600
      error: '#dc2626', // red-600
    })
  },
  blue: {
    name: 'Tema Azul',
    colors: getAdaptiveTextColors({
      primary: '#1e3a8a', // blue-800
      secondary: '#1e40af', // blue-600
      accent: '#3b82f6', // blue-500
      background: '#0f172a', // slate-900
      surface: '#1e293b', // slate-800
      border: '#334155', // slate-600
      success: '#059669', // emerald-600
      warning: '#d97706', // amber-600
      error: '#dc2626', // red-600
    })
  },
  light: {
    name: 'Tema Claro',
    colors: getAdaptiveTextColors({
      primary: '#1e40af', // blue-600
      secondary: '#f3f4f6', // gray-100
      accent: '#3b82f6', // blue-500
      background: '#ffffff', // white
      surface: '#f9fafb', // gray-50
      border: '#e5e7eb', // gray-200
      success: '#10b981', // emerald-500
      warning: '#f59e0b', // amber-500
      error: '#ef4444', // red-500
      // Colores específicos para sidebar oscuro en tema claro
      sidebarBackground: '#1f2937', // gray-800
      sidebarSurface: '#374151', // gray-700
      sidebarBorder: '#4b5563', // gray-600
      sidebarText: '#ffffff', // white
      sidebarTextSecondary: '#9ca3af', // gray-400
    })
  },

};

// Configuración por defecto
const defaultSettings = {
  theme: 'light',
  sidebarCollapsed: false,
  notifications: true,
  animations: true,
  compactMode: false,
  // Configuración de marca personalizada
  customBrand: {
    logo: null, // URL de la imagen del logo
    companyName: 'Localix',
    showLogo: true,
    showCompanyName: true
  },
  // Configuración de datos de empresa para PDFs
  companyData: {
    nombre: 'Localix',
    direccion: 'Calle 15 # 7-57 Local 101',
    telefono: '(+57) 314 743 5305',
    email: 'info@localix.com',
    nit: '900.123.456-7',
    ruc: '900.123.456-7',
    web: 'www.localix.com',
    ciudad: 'Pereira',
    pais: 'Colombia'
  },
  // Configuración de colores para PDFs
  pdfColors: {
    primary: '#e91e63', // Rosa
    secondary: '#f8bbd9', // Rosa claro
    accent: '#2196f3', // Azul
    neutral: '#6b7280' // Gris
  },
  // Configuración de colores para datos del cliente
  customerColors: {
    activeBg: '#dbeafe', // bg-blue-100
    activeText: '#1d4ed8', // text-blue-600
    activeIcon: '#1d4ed8', // text-blue-600
    activeBadgeBg: '#dbeafe', // bg-blue-100
    activeBadgeText: '#1e40af', // text-blue-800
    inactiveBg: '#f3f4f6', // bg-gray-100
    inactiveText: '#6b7280', // text-gray-500
    inactiveIcon: '#6b7280' // text-gray-500
  }
};

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    // En lugar de lanzar un error, retornar valores por defecto
    console.warn('useSettings: Contexto no disponible, usando valores por defecto');
    return {
      settings: defaultSettings,
      themes,
      currentTheme: themes[defaultSettings.theme],
      updateSettings: () => {},
      updateTheme: () => {},
      toggleSidebar: () => {},
      toggleNotifications: () => {},
      toggleAnimations: () => {},
      toggleCompactMode: () => {},
      resetSettings: () => {},
      isLoading: true
    };
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Crear el contexto con valores por defecto inicialmente
  const contextValue = React.useMemo(() => ({
    settings: settings || defaultSettings,
    themes,
    currentTheme: themes[settings?.theme] || themes[defaultSettings.theme],
    updateSettings: (newSettings) => setSettings(prev => ({ ...prev, ...newSettings })),
    updateTheme: (themeName) => {
      if (themes[themeName]) {
        setSettings(prev => ({ ...prev, theme: themeName }));
      }
    },
    toggleSidebar: () => setSettings(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed })),
    toggleNotifications: () => setSettings(prev => ({ ...prev, notifications: !prev.notifications })),
    toggleAnimations: () => setSettings(prev => ({ ...prev, animations: !prev.animations })),
    toggleCompactMode: () => setSettings(prev => ({ ...prev, compactMode: !prev.compactMode })),
    // Funciones para configuración de marca
    updateCustomBrand: (brandSettings) => setSettings(prev => ({
      ...prev,
      customBrand: { ...prev.customBrand, ...brandSettings }
    })),
    updateLogo: (logoUrl) => setSettings(prev => ({
      ...prev,
      customBrand: { ...prev.customBrand, logo: logoUrl }
    })),
    updateCompanyName: (name) => setSettings(prev => ({
      ...prev,
      customBrand: { ...prev.customBrand, companyName: name }
    })),
    toggleLogoVisibility: () => setSettings(prev => ({
      ...prev,
      customBrand: { ...prev.customBrand, showLogo: !prev.customBrand.showLogo }
    })),
    toggleCompanyNameVisibility: () => setSettings(prev => ({
      ...prev,
      customBrand: { ...prev.customBrand, showCompanyName: !prev.customBrand.showCompanyName }
    })),
    // Funciones para configuración de datos de empresa
    updateCompanyData: (companyData) => setSettings(prev => ({
      ...prev,
      companyData: { ...prev.companyData, ...companyData }
    })),
    updateCompanyField: (field, value) => setSettings(prev => ({
      ...prev,
      companyData: { ...prev.companyData, [field]: value }
    })),
    // Funciones para configuración de colores PDF
    updatePdfColors: (colors) => setSettings(prev => ({
      ...prev,
      pdfColors: { ...prev.pdfColors, ...colors }
    })),
    updatePdfColor: (colorType, value) => setSettings(prev => ({
      ...prev,
      pdfColors: { ...prev.pdfColors, [colorType]: value }
    })),
    // Funciones para configuración de colores del cliente
    updateCustomerColors: (colors) => setSettings(prev => ({
      ...prev,
      customerColors: { ...prev.customerColors, ...colors }
    })),
    updateCustomerColor: (colorType, value) => setSettings(prev => ({
      ...prev,
      customerColors: { ...prev.customerColors, [colorType]: value }
    })),
    resetSettings: () => setSettings(defaultSettings),
    isLoading
  }), [settings, isLoading]);

  // Cargar configuración desde localStorage al inicializar
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('localix-settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        // Verificar que el tema guardado existe, si no, usar el tema por defecto
        const theme = themes[parsedSettings.theme] ? parsedSettings.theme : defaultSettings.theme;
        setSettings({ ...defaultSettings, ...parsedSettings, theme });
      } else {
        // Si no hay configuración guardada, usar la configuración por defecto
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      // En caso de error, usar la configuración por defecto
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Guardar configuración en localStorage cuando cambie
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('localix-settings', JSON.stringify(settings));
      } catch (error) {
        console.error('Error al guardar configuración:', error);
      }
    }
  }, [settings, isLoading]);

  // Aplicar tema al documento
  useEffect(() => {
    if (!isLoading) {
      const root = document.documentElement;
      // Aplicar el tema usando el atributo data-theme
      root.setAttribute('data-theme', settings.theme);
      
      // También aplicar variables CSS directamente como respaldo
      const currentTheme = themes[settings.theme];
      if (currentTheme) {
        Object.entries(currentTheme.colors).forEach(([key, value]) => {
          root.style.setProperty(`--color-${key}`, value);
        });
      }
    }
  }, [settings.theme, isLoading]);



  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};
