
import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, Minus, Plus, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function formatCOP(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

// Animation variants for framer-motion
const cartVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  },
  exit: { 
    opacity: 0, 
    y: 20, 
    scale: 0.98,
    transition: { duration: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }),
  exit: { 
    opacity: 0, 
    x: -10,
    transition: { duration: 0.2 }
  }
};

const CartDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState<{[key: string]: boolean}>({});
  const [isUpdating, setIsUpdating] = useState<{[key: string]: boolean}>({});
  const { items, updateQuantity, removeItem, getTotalItems, getTotalPrice } = useCart();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const hasFreeShipping = totalPrice >= 300000;
  const progressPercentage = Math.min((totalPrice / 300000) * 100, 100);

  const handleRemoveItem = async (id: number, color: string) => {
    const itemKey = `${id}-${color}`;
    setIsRemoving(prev => ({ ...prev, [itemKey]: true }));
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate async operation
    removeItem(id, color);
    setIsRemoving(prev => ({ ...prev, [itemKey]: false }));
  };

  const handleUpdateQuantity = async (id: number, color: string, newQuantity: number) => {
    const itemKey = `${id}-${color}`;
    setIsUpdating(prev => ({ ...prev, [itemKey]: true }));
    await new Promise(resolve => setTimeout(resolve, 150)); // Simulate async operation
    updateQuantity(id, color, newQuantity);
    setIsUpdating(prev => ({ ...prev, [itemKey]: false }));
  };

  // Close cart when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 hover:bg-neutral-100 rounded-full transition-all duration-200 group"
        aria-label={`Carrito (${totalItems} ${totalItems === 1 ? 'artículo' : 'artículos'})`}
      >
        <ShoppingBag className="w-5 h-5 text-neutral-700 group-hover:text-neutral-900 transition-colors" />
        {totalItems > 0 && (
          <motion.span 
            key={`cart-count-${totalItems}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center"
          >
            {totalItems}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              variants={cartVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] max-h-[80vh] z-[60] shadow-2xl rounded-lg overflow-hidden flex flex-col bg-gray-900 border border-gray-700"
              style={{
                minHeight: '200px',
                height: 'auto'
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800 text-gray-100">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5" />
                  <h3 className="font-semibold">
                    Tu carrito <span className="opacity-70">({totalItems})</span>
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 text-gray-300 hover:bg-gray-700 hover:text-white rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Empty State */}
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="relative mb-6">
                    <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto" />
                    <div className="absolute -inset-1 bg-gray-700 rounded-full opacity-30 blur"></div>
                  </div>
                  <h4 className="text-lg font-medium text-gray-200 mb-2">Tu carrito está vacío</h4>
                  <p className="text-gray-400 mb-6 max-w-xs">Añade algunos productos para comenzar tu compra</p>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 hover:text-white"
                  >
                    Seguir comprando
                  </Button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Items List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <AnimatePresence>
                      {items.map((item, index) => {
                        const itemKey = `${item.id}-${item.color}`;
                        const isItemRemoving = isRemoving[itemKey];
                        const isItemUpdating = isUpdating[itemKey];
                        const itemTotal = item.priceNumber * item.quantity;
                        
                        return (
                          <motion.div
                            key={itemKey}
                            custom={index}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            layout
                            className={`relative group flex items-center gap-3 p-3 rounded-xl bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all duration-200 ${
                              isItemRemoving ? 'opacity-0 h-0 p-0 border-0 overflow-hidden' : ''
                            }`}
                          >
                            {/* Loading Overlay */}
                            {isItemUpdating && (
                              <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
                                <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
                              </div>
                            )}

                            {/* Product Image */}
                            <div className="relative flex-shrink-0">
                              <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              
                              {/* Remove Button */}
                              <button
                                onClick={() => handleRemoveItem(item.id, item.color)}
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-all duration-200 transform hover:scale-110"
                                aria-label="Eliminar producto"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-100 truncate text-sm">
                                {item.name}
                              </h4>
                              <p className="text-xs text-gray-400 mb-1">
                                Color: <span className="capitalize">{item.color}</span>
                              </p>
                              <p className="text-sm font-semibold text-gray-300">
                                {formatCOP(item.priceNumber)}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {item.quantity} × {formatCOP(item.priceNumber)} ={' '}
                                  <span className="font-medium text-gray-200">
                                    {formatCOP(itemTotal)}
                                  </span>
                                </p>
                              )}
                            </div>

                            {/* Quantity Selector */}
                            <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-0.5 border border-gray-600">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 hover:bg-gray-600 text-gray-300 hover:text-gray-100 rounded-md"
                                onClick={() => handleUpdateQuantity(item.id, item.color, item.quantity - 1)}
                                disabled={isItemUpdating}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="text-sm w-8 text-center font-medium text-gray-100">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 hover:bg-gray-600 text-gray-300 hover:text-gray-100 rounded-md"
                                onClick={() => handleUpdateQuantity(item.id, item.color, item.quantity + 1)}
                                disabled={isItemUpdating}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  {/* Summary */}
                  <div className="border-t border-gray-700 bg-gradient-to-b from-gray-800 to-gray-900 p-4">
                    {/* Free Shipping Progress */}
                    {!hasFreeShipping && (
                      <div className="mb-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-300">
                            {totalPrice < 300000 
                              ? `Faltan ${formatCOP(300000 - totalPrice)} para envío gratuito`
                              : '¡Envío gratuito desbloqueado!'}
                          </span>
                          <span className="font-medium text-gray-200">{progressPercentage.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-gray-500 to-gray-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Free Shipping Banner */}
                    {hasFreeShipping && (
                      <div className="mb-4 p-3 bg-gray-800 border border-gray-600 rounded-lg flex items-center space-x-2">
                        <div className="bg-gray-700 p-1.5 rounded-full">
                          <Sparkles className="w-4 h-4 text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-200">
                          ¡Felicidades! Tienes envío gratuito
                        </p>
                      </div>
                    )}

                    {/* Totals */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Subtotal</span>
                        <span className="font-medium text-gray-200">{formatCOP(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Envío</span>
                        <span className="font-medium">
                          {hasFreeShipping ? (
                            <span className="text-gray-300">Gratis</span>
                          ) : (
                            <span className="text-gray-200">Calculado en el pago</span>
                          )}
                        </span>
                      </div>
                      <div className="h-px bg-gray-700 my-1"></div>
                      <div className="flex justify-between text-base font-semibold">
                        <span className="text-gray-200">Total</span>
                        <motion.span
                          key={`total-${totalPrice}`}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-gray-100"
                        >
                          {formatCOP(totalPrice)}
                        </motion.span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Link to="/checkout" onClick={() => setIsOpen(false)} className="block">
                      <Button 
                        className="w-full h-12 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-gray-100 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                        size="lg"
                      >
                        <span>Pagar ahora</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>

                    {/* Secure Checkout */}
                    <div className="mt-3 text-center">
                      <p className="text-xs text-gray-400 flex items-center justify-center space-x-1">
                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span>Pago seguro • Cifrado SSL</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartDropdown;
