// src/components/ventas/SmartFloatingCart.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, X, Minus, Plus, Package, ChevronUp, ChevronDown, Move } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SmartFloatingCart = ({
  carrito = [],
  isOpen,
  onToggle,
  onRemoveItem,
  onUpdateQuantity,
  onFinalize,
  loading = false
}) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cartRef = useRef(null);
  const dragRef = useRef(null);

  // Calcular totales
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  const totalPrice = carrito.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);

  // Auto-minimizar si está cerrado por mucho tiempo
  useEffect(() => {
    let timer;
    if (!isOpen && !isMinimized) {
      timer = setTimeout(() => {
        setIsMinimized(true);
      }, 5000); // Minimizar después de 5 segundos
    }
    return () => clearTimeout(timer);
  }, [isOpen, isMinimized]);

  // Restablecer minimizado cuando se abre
  useEffect(() => {
    if (isOpen) {
      setIsMinimized(false);
    }
  }, [isOpen]);

  // Handlers para arrastrar
  const handleMouseDown = (e) => {
    if (e.target.closest('.cart-content')) return; // No arrastrar si se hace clic en el contenido
    
    setIsDragging(true);
    const rect = cartRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = Math.max(10, Math.min(window.innerWidth - 320, e.clientX - dragOffset.x));
    const newY = Math.max(10, Math.min(window.innerHeight - 100, e.clientY - dragOffset.y));
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Event listeners para arrastrar
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Posicionar automáticamente para evitar obstáculos
  const adjustPosition = () => {
    const cartRect = cartRef.current?.getBoundingClientRect();
    if (!cartRect) return;

    let newX = position.x;
    let newY = position.y;

    // Mantener dentro de la ventana
    if (cartRect.right > window.innerWidth - 10) {
      newX = window.innerWidth - cartRect.width - 10;
    }
    if (cartRect.bottom > window.innerHeight - 10) {
      newY = window.innerHeight - cartRect.height - 10;
    }
    if (cartRect.left < 10) {
      newX = 10;
    }
    if (cartRect.top < 10) {
      newY = 10;
    }

    if (newX !== position.x || newY !== position.y) {
      setPosition({ x: newX, y: newY });
    }
  };

  useEffect(() => {
    window.addEventListener('resize', adjustPosition);
    return () => window.removeEventListener('resize', adjustPosition);
  }, [position]);

  const cartVariants = {
    closed: {
      width: isMinimized ? 60 : 80,
      height: isMinimized ? 60 : 80,
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    open: {
      width: 320,
      height: 'auto',
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <motion.div
      ref={cartRef}
      className={`
        fixed z-50 bg-theme-surface rounded-lg shadow-xl border border-theme-border
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        ${isOpen ? 'cursor-default' : ''}
      `}
      style={{
        left: position.x,
        top: position.y,
        ...(isOpen 
          ? { height: 'auto', maxHeight: '500px' }
          : { height: `${isMinimized ? 60 : 80}px`, maxHeight: `${isMinimized ? 60 : 80}px` }
        )
      }}
      variants={cartVariants}
      animate={isOpen ? 'open' : 'closed'}
      onMouseDown={handleMouseDown}
    >
      {/* Botón flotante minimizado */}
      {!isOpen && (
        <div
          className="w-full h-full flex items-center justify-center relative group"
          onClick={onToggle}
        >
          {/* Indicador de arrastre */}
          {!isMinimized && (
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Move className="w-3 h-3 text-theme-textSecondary" />
            </div>
          )}
          
          <div className="relative">
            <ShoppingCart 
              className={`${isMinimized ? 'w-6 h-6' : 'w-8 h-8'} text-blue-600`} 
            />
            {totalItems > 0 && (
              <motion.span
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={totalItems}
              >
                {totalItems > 99 ? '99+' : totalItems}
              </motion.span>
            )}
          </div>
        </div>
      )}

      {/* Contenido expandido del carrito */}
      {isOpen && (
        <div className="cart-content">
          {/* Header del carrito */}
          <div className="flex items-center justify-between p-4 border-b border-theme-border bg-theme-background rounded-t-lg">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-theme-text">
                Mi Pedido ({totalItems})
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 text-theme-textSecondary hover:text-theme-textSecondary transition-colors"
                title="Minimizar"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={onToggle}
                className="p-1 text-theme-textSecondary hover:text-theme-textSecondary transition-colors"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lista de productos */}
          <div className="max-h-64 overflow-y-auto">
            <AnimatePresence>
              {carrito.length === 0 ? (
                <motion.div
                  className="text-center py-8 text-theme-textSecondary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-theme-textSecondary" />
                  <p className="text-sm">El carrito está vacío</p>
                </motion.div>
              ) : (
                carrito.map((item, index) => (
                  <motion.div
                    key={`${item.producto.id}-${index}`}
                    className="flex items-center p-3 border-b border-gray-100 last:border-0 hover:bg-theme-background transition-colors"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    custom={index}
                  >
                    {/* Imagen del producto */}
                    <div className="relative w-12 h-12 flex-shrink-0 bg-theme-secondary rounded-md overflow-hidden">
                      {item.producto.imagen_principal_url ? (
                        <img
                          src={item.producto.imagen_principal_url}
                          alt={item.producto.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-theme-textSecondary">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Información del producto */}
                    <div className="ml-3 flex-1 min-w-0">
                      <h4 className="font-medium text-theme-text text-sm truncate">
                        {item.producto.nombre}
                      </h4>
                      <p className="text-xs text-theme-textSecondary truncate">
                        {item.color?.nombre || 'Color único'}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-semibold text-theme-text">
                          €{((item.producto.precio * item.cantidad) / 100).toFixed(2)}
                        </span>
                        
                        {/* Controles de cantidad */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onUpdateQuantity(index, Math.max(1, item.cantidad - 1))}
                            className="p-1 text-theme-textSecondary hover:text-theme-textSecondary transition-colors"
                            disabled={item.cantidad <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(index, item.cantidad + 1)}
                            className="p-1 text-theme-textSecondary hover:text-theme-textSecondary transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Botón eliminar */}
                    <button
                      onClick={() => onRemoveItem(index)}
                      className="ml-2 p-1 text-theme-textSecondary hover:text-red-500 transition-colors"
                      title="Eliminar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Footer con total y botón de finalizar */}
          {carrito.length > 0 && (
            <div className="p-4 border-t border-theme-border bg-theme-background rounded-b-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-theme-text">Total:</span>
                <span className="font-bold text-lg text-theme-text">
                  €{(totalPrice / 100).toFixed(2)}
                </span>
              </div>
              
              <button
                onClick={onFinalize}
                disabled={loading || carrito.length === 0}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Finalizar Pedido
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default SmartFloatingCart;
