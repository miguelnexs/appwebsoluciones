import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import ConnectionErrorPage from '../components/ui/ConnectionErrorPage';

export const useConnectionGuard = () => {
  const context = useContext(AppContext);
  
  // Verificar que el contexto esté disponible
  if (!context) {
    console.warn('AppContext no está disponible');
    return {
      ConnectionGuard: ({ children }) => children,
      connectionError: false,
      isCheckingConnection: false
    };
  }

  const { connectionError, isCheckingConnection } = context;

  const ConnectionGuard = ({ children, showOnError = true }) => {
    // Si no se debe mostrar en error, siempre mostrar el contenido
    if (!showOnError) {
      return children;
    }

    // Si hay error de conexión o está verificando, mostrar la página de error
    if (connectionError || isCheckingConnection) {
      return <ConnectionErrorPage>{children}</ConnectionErrorPage>;
    }

    // Si no hay error, mostrar el contenido normal
    return children;
  };

  return {
    ConnectionGuard,
    connectionError,
    isCheckingConnection
  };
};
