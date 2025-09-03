import React, { useState, useCallback } from 'react';
import Toast from './Toast';

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((type, title, message, options = {}) => {
    const defaultOptions = {
      duration: 5000,
      show: true
    };
    
    const toastOptions = { ...defaultOptions, ...options };
    return addToast({
      type,
      title,
      message,
      ...toastOptions
    });
  }, [addToast]);

  // Métodos de conveniencia
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
    return showToast('loading', title, message, { duration: 0, ...options });
  }, [showToast]);

  // Exponer métodos globalmente
  React.useEffect(() => {
    window.toast = {
      success,
      error,
      warning,
      info,
      loading,
      dismiss: removeToast
    };
  }, [success, error, warning, info, loading, removeToast]);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            transform: `translateY(${index * 80}px)`,
            zIndex: 1000 - index
          }}
        >
          <Toast
            {...toast}
            onClose={removeToast}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer; 
