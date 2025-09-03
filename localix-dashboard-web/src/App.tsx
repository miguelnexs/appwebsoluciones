// src/App.tsx
import React from 'react';
import { AppProvider } from './contexts/AppContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { OrderNotificationsProvider } from './contexts/OrderNotificationsContext';
import { PreloadProvider } from './contexts/PreloadContext';
import { SettingsProvider } from './contexts/SettingsContext';

import AppRouter from './routes/AppRouter';
import ToastContainer from './components/ui/ToastContainer';
import { GlobalLoadingManager } from './components/ui/LoadingComponents';
import ConnectionErrorModal from './components/ui/ConnectionErrorModal';
import ConnectionStatusIndicator from './components/ui/ConnectionStatusIndicator';
import OfflineNotification from './components/OfflineNotification';
import ErrorBoundary from './components/ui/ErrorBoundary';
import './index.css';

// Suprimir warnings conocidos de bibliotecas externas
if (typeof console !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    
    // Suprimir warnings de defaultProps de bibliotecas externas
    if (
      message.includes('Support for defaultProps will be removed') && 
      (message.includes('Chrome2') || 
       message.includes('Checkboard2') || 
       message.includes('ColorPicker2') ||
       message.includes('react-color'))
    ) {
      return; // No mostrar estas advertencias
    }
    
    // Mostrar todas las demás advertencias normalmente
    originalWarn.apply(console, args);
  };
}

// Componente interno que usa el contexto
const AppContent: React.FC = () => {
  return (
    <div className="app-container">
      <AppRouter />
      <ToastContainer />
      <GlobalLoadingManager />
      
      {/* Indicador de estado de conexión */}
      <ConnectionStatusIndicator />
      
      {/* Modal de error de conexión */}
      <ConnectionErrorModal />
      
      {/* Notificación de modo offline */}
      <OfflineNotification />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <LoadingProvider>
        <AppProvider>
          <OrderNotificationsProvider>
            <PreloadProvider>
              <SettingsProvider>
                <AppContent />
              </SettingsProvider>
            </PreloadProvider>
          </OrderNotificationsProvider>
        </AppProvider>
      </LoadingProvider>
    </ErrorBoundary>
  );
};

export default App;
