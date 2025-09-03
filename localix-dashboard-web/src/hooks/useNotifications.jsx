import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((type, title, message, options = {}) => {
    const defaultOptions = {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    };

    const toastOptions = { ...defaultOptions, ...options };

    const getIcon = () => {
      switch (type) {
        case 'success':
          return <CheckCircle className="h-5 w-5 text-blue-500" />;
        case 'error':
          return <AlertCircle className="h-5 w-5 text-red-500" />;
        case 'warning':
          return <AlertCircle className="h-5 w-5 text-yellow-500" />;
        case 'info':
          return <Info className="h-5 w-5 text-blue-500" />;
        default:
          return <Info className="h-5 w-5 text-theme-textSecondary" />;
      }
    };

    const getContent = () => (
      <div className="flex items-center gap-3">
        {getIcon()}
        <div>
          {title && <div className="font-semibold text-white">{title}</div>}
          {message && <div className="text-sm text-white opacity-90">{message}</div>}
        </div>
      </div>
    );

    switch (type) {
      case 'success':
        return toast.success(getContent(), toastOptions);
      case 'error':
        return toast.error(getContent(), toastOptions);
      case 'warning':
        return toast.warning(getContent(), toastOptions);
      case 'info':
        return toast.info(getContent(), toastOptions);
      default:
        return toast(getContent(), toastOptions);
    }
  });

  const showSuccess = useCallback((title, message, options) => {
    return showNotification('success', title, message, options);
  }, [showNotification]);

  const showError = useCallback((title, message, options) => {
    return showNotification('error', title, message, options);
  }, [showNotification]);

  const showWarning = useCallback((title, message, options) => {
    return showNotification('warning', title, message, options);
  }, [showNotification]);

  const showInfo = useCallback((title, message, options) => {
    return showNotification('info', title, message, options);
  }, [showNotification]);

  const showProductSaved = useCallback((isNew = false) => {
    const title = isNew ? '¡Producto creado!' : '¡Producto actualizado!';
    const message = isNew 
      ? 'El producto se ha guardado exitosamente' 
      : 'Los cambios se han guardado correctamente';
    
    return showSuccess(title, message, {
      autoClose: 4000,
      position: "top-right",
    });
  }, [showSuccess]);

  const showProductError = useCallback((error) => {
    return showError('Error al guardar', error, {
      autoClose: 6000,
      position: "top-right",
    });
  }, [showError]);

  const showDeleteConfirmation = useCallback((itemName) => {
    return showWarning(
      'Confirmar eliminación',
      `¿Estás seguro de que deseas eliminar "${itemName}"? Esta acción no se puede deshacer.`,
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  }, [showWarning]);

  const showDeleteSuccess = useCallback((itemName) => {
    return showSuccess(
      'Eliminado exitosamente',
      `"${itemName}" ha sido eliminado correctamente.`,
      {
        autoClose: 3000,
      }
    );
  }, [showSuccess]);

  const showLoading = useCallback((message = 'Cargando...') => {
    return toast.loading(message, {
      position: "top-right",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
    });
  }, []);

  const dismissToast = useCallback((toastId) => {
    toast.dismiss(toastId);
  }, []);

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showProductSaved,
    showProductError,
    showDeleteConfirmation,
    showDeleteSuccess,
    showLoading,
    dismissToast,
    notifications,
  };
}; 
