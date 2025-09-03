import { useCallback } from 'react';

export const useToast = () => {
  const showToast = useCallback((title, message, type = 'info', options = {}) => {
    if (window.toast && typeof window.toast[type] === 'function') {
      return window.toast[type](title, message, options);
    }
    // Fallback a console si no hay toast disponible
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
  }, []);

  const success = useCallback((title, message, options) => {
    return showToast('success', title, message, options);
  }, [showToast]);

  const error = useCallback((title, message, options) => {
    return showToast('error', title, message, options);
  }, [showToast]);

  const warning = useCallback((title, message, options) => {
    return showToast('warning', title, message, options);
  }, [showToast]);

  const info = useCallback((title, message, options) => {
    return showToast('info', title, message, options);
  }, [showToast]);

  const loading = useCallback((title, message, options) => {
    return showToast('loading', title, message, options);
  }, [showToast]);

  const dismiss = useCallback((id) => {
    if (window.toast) {
      window.toast.dismiss(id);
    }
  }, []);

  // Métodos específicos para la aplicación
  const showProductSaved = useCallback((isNew = false) => {
    const title = isNew ? '¡Producto creado!' : '¡Producto actualizado!';
    const message = isNew 
      ? 'El producto se ha guardado exitosamente' 
      : 'Los cambios se han guardado correctamente';
    
    return success(title, message, {
      duration: 4000,
    });
  }, [success]);

  const showProductError = useCallback((error) => {
    return error('Error al guardar', error, {
      duration: 6000,
    });
  }, [error]);

  const showDeleteConfirmation = useCallback((itemName) => {
    return warning(
      'Confirmar eliminación',
      `¿Estás seguro de que deseas eliminar "${itemName}"? Esta acción no se puede deshacer.`,
      {
        duration: 0, // No auto-close
      }
    );
  }, [warning]);

  const showDeleteSuccess = useCallback((itemName) => {
    return success(
      'Eliminado exitosamente',
      `"${itemName}" ha sido eliminado correctamente.`,
      {
        duration: 3000,
      }
    );
  }, [success]);

  const showCategorySaved = useCallback((isNew = false) => {
    const title = isNew ? '¡Categoría creada!' : '¡Categoría actualizada!';
    const message = isNew 
      ? 'La categoría se ha guardado exitosamente' 
      : 'Los cambios se han guardado correctamente';
    
    return success(title, message, {
      duration: 4000,
    });
  }, [success]);

  const showCategoryError = useCallback((error) => {
    return error('Error al guardar categoría', error, {
      duration: 6000,
    });
  }, [error]);

  const showStockUpdated = useCallback((productName, newStock) => {
    return success(
      'Stock actualizado',
      `El stock de "${productName}" se ha actualizado a ${newStock} unidades.`,
      {
        duration: 4000,
      }
    );
  }, [success]);

  const showStockError = useCallback((error) => {
    return error('Error al actualizar stock', error, {
      duration: 6000,
    });
  }, [error]);

  const showVentaSuccess = useCallback((ventaId) => {
    return success(
      '¡Venta registrada!',
      `La venta #${ventaId} se ha registrado exitosamente.`,
      {
        duration: 5000,
      }
    );
  }, [success]);

  const showVentaError = useCallback((error) => {
    return error('Error al registrar venta', error, {
      duration: 6000,
    });
  }, [error]);

  const showClienteSaved = useCallback((isNew = false) => {
    const title = isNew ? '¡Cliente creado!' : '¡Cliente actualizado!';
    const message = isNew 
      ? 'El cliente se ha guardado exitosamente' 
      : 'Los cambios se han guardado correctamente';
    
    return success(title, message, {
      duration: 4000,
    });
  }, [success]);

  const showClienteError = useCallback((error) => {
    return error('Error al guardar cliente', error, {
      duration: 6000,
    });
  }, [error]);

  const showNetworkError = useCallback((error) => {
    return error(
      'Error de conexión',
      'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      {
        duration: 8000,
      }
    );
  }, [error]);

  const showValidationError = useCallback((field, message) => {
    return error(
      'Error de validación',
      `${field}: ${message}`,
      {
        duration: 5000,
      }
    );
  }, [error]);

  return {
    // Métodos básicos
    showToast,
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    
    // Métodos específicos de la aplicación
    showProductSaved,
    showProductError,
    showDeleteConfirmation,
    showDeleteSuccess,
    showCategorySaved,
    showCategoryError,
    showStockUpdated,
    showStockError,
    showVentaSuccess,
    showVentaError,
    showClienteSaved,
    showClienteError,
    showNetworkError,
    showValidationError,
  };
}; 
