import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, X, ShoppingCart, DollarSign } from 'lucide-react';

const OrderNotificationToast = ({ order, onDismiss, autoHideDuration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHideDuration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [autoHideDuration]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss && onDismiss();
    }, 300); // Esperar a que termine la animación
  };

  const handleClick = () => {
    // Navegar a la página de pedidos
    window.location.href = '/orders';
    handleDismiss();
  };

  if (!order) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 right-4 z-50 w-80 bg-theme-surface rounded-lg shadow-lg border border-theme-border overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
          onClick={handleClick}
        >
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 flex items-center justify-between">
            <div className="flex items-center">
              <Package className="mr-2" size={20} />
              <span className="font-semibold">¡Nueva Venta!</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <ShoppingCart size={16} className="mr-2 text-blue-600" />
                <span className="font-semibold text-theme-text">
                  Pedido #{order.numero_venta}
                </span>
              </div>
                              <div className="flex items-center text-blue-600 font-bold">
                <DollarSign size={16} className="mr-1" />
                <span>${(parseFloat(order.total) / 100).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="text-sm text-theme-textSecondary mb-2">
              <strong>Cliente:</strong> {order.cliente || 'Cliente anónimo'}
            </div>
            
            {order.items_count && (
              <div className="text-sm text-theme-textSecondary">
                <strong>Productos:</strong> {order.items_count} item{order.items_count !== 1 ? 's' : ''}
              </div>
            )}
            
            <div className="mt-3 text-xs text-theme-textSecondary border-t pt-2">
              Clic para ver todos los pedidos
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderNotificationToast;