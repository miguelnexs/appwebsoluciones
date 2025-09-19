import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, X, Minus, Plus, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';

const CartButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { state, removeItem, updateQuantity, clearCart } = useCart();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return '/placeholder-product.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:8001'}${imagePath}`;
  };

  return (
    <div className="relative">
      {/* Botón del carrito */}
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        className="relative p-2 hover:bg-secondary/80 transition-all duration-200 cart-button-hover"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Carrito de compras (${state.itemCount} productos)`}
        data-testid="cart-button"
      >
        <ShoppingCart className="h-5 w-5 text-foreground" />
        {state.itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center cart-counter-pulse">
            {state.itemCount > 99 ? '99+' : state.itemCount}
          </span>
        )}
      </Button>

      {/* Dropdown del carrito */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50 cart-dropdown-enter cart-dropdown"
          role="dialog"
          aria-label="Carrito de compras"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">
              Carrito ({state.itemCount} {state.itemCount === 1 ? 'producto' : 'productos'})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Contenido del carrito */}
          <div className="max-h-96 overflow-y-auto">
            {state.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-2">Tu carrito está vacío</p>
                <p className="text-sm text-muted-foreground">
                  Agrega productos para comenzar tu compra
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {state.items.map((item) => (
                  <div
                    key={`${item.id}-${item.selectedColor || 'default'}`}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors"
                  >
                    {/* Imagen del producto */}
                    <img
                      src={getImageUrl(item.imagen_principal_url)}
                      alt={item.nombre}
                      className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                    />

                    {/* Información del producto */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {item.nombre}
                      </h4>
                      {item.selectedColor && (
                        <p className="text-xs text-muted-foreground">
                          Color: {item.selectedColor}
                        </p>
                      )}
                      <p className="text-sm font-semibold text-primary">
                        {formatPrice(item.precio)}
                      </p>
                    </div>

                    {/* Controles de cantidad */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer con total y acciones */}
          {state.items.length > 0 && (
            <div className="border-t border-border p-4 space-y-3">
              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Total:</span>
                <span className="font-bold text-lg text-primary">
                  {formatPrice(state.total)}
                </span>
              </div>

              {/* Botones de acción */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                  className="flex-1"
                >
                  Vaciar
                </Button>
                <Link to="/checkout" className="flex-1">
                  <Button
                    size="sm"
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => setIsOpen(false)}
                  >
                    Finalizar Compra
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartButton;