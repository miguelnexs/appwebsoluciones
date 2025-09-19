// src/components/layout/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useSettings } from '../../context/SettingsContext';

const MainLayout = ({ children }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  
  const { settings, toggleSidebar, isLoading } = useSettings();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Auto-collapse sidebar en pantallas medianas
  useEffect(() => {
    if (isTablet && !isMobile) {
      setSidebarCollapsed(true);
    } else if (!isTablet) {
      setSidebarCollapsed(false);
    }
  }, [isTablet, isMobile]);

  // Sincronizar con configuración global
  useEffect(() => {
    if (!isLoading && settings) {
      setSidebarCollapsed(settings.sidebarCollapsed);
    }
  }, [settings?.sidebarCollapsed, isLoading]);

  const handleSidebarToggle = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    if (toggleSidebar) {
      toggleSidebar();
    }
  };

  // Mostrar estado de carga mientras se inicializa el SettingsProvider
  if (isLoading || !settings) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 items-center justify-center">
        <div className="text-gray-700 dark:text-gray-300">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-theme-background overflow-hidden">
      {/* Sidebar responsivo */}
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
      />
      
      {/* Contenido principal adaptativo */}
      <div 
        className={`
          flex-1 overflow-auto transition-all duration-300 ease-in-out bg-theme-background
          ${isMobile 
            ? 'w-full' // Móvil: ancho completo
            : sidebarCollapsed 
              ? 'ml-16' // Desktop con sidebar colapsado
              : 'ml-64' // Desktop con sidebar expandido
          }
        `}
      >
        {/* Header móvil opcional */}
        {isMobile && (
          <div className="lg:hidden bg-theme-surface border-b border-theme-border px-4 py-3 flex items-center justify-between sticky top-0 z-10">
            <h1 className="text-lg font-semibold text-theme-text">Dashboard</h1>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md text-theme-text hover:bg-theme-secondary transition-colors"
            >
              Menú
            </button>
          </div>
        )}

        {/* Contenido con padding adaptativo */}
        <div 
          className={`
            ${isMobile 
              ? 'p-4' // Móvil: padding reducido
              : isTablet 
                ? 'p-5' // Tablet: padding medio
                : 'p-6' // Desktop: padding completo
            }
          `}
        >
          {children ? children : <Outlet />}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;