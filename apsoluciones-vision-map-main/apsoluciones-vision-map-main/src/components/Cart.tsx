import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  Trash2, 
  X,
  Package,
  CreditCard,
  ArrowRight
} from 'lucide-react';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateQuantity, removeItem, clearCart, toggleCart, closeCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  const getImageUrl = (url?: string): string => {
    if (!url) return '/placeholder-product.jpg';
    if (url.startsWith('http')) return url;
    return `http://softwarebycg.shop${url}`;
  };

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const CartTrigger = () => (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleCart}
      className="relative"
    >
      <ShoppingCart className="w-5 h-5" />
      {state.itemCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {state.itemCount}
        </Badge>
      )}
    </Button>
  );

  const EmptyCart = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Package className="w-16 h-16 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Tu carrito está vacío</h3>
      <p className="text-gray-600 mb-6">Agrega algunos productos para comenzar</p>
      <Button onClick={closeCart} className="w-full">
        Continuar comprando
      </Button>
    </div>
  );

  const CartItems = () => (
    <div className="space-y-4">
      {state.items.map((item) => (
        <Card key={`${item.id}-${item.selectedColor || 'default'}`} className="p-4">
          <div className="flex items-start space-x-4">
            {/* Product Image */}
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={getImageUrl(item.imagen_principal_url)}
                alt={item.nombre}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-product.jpg';
                }}
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {item.nombre}
              </h4>
              {item.selectedColor && (
                <p className="text-xs text-gray-600 mt-1">
                  Color: {item.selectedColor}
                </p>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-bold text-green-600">
                  {formatPrice(item.precio)}
                </span>
                <div className="flex items-center space-x-2">
                  {/* Quantity Controls */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm font-medium min-w-[2rem] text-center">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  {/* Remove Item */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              {/* Stock Warning */}
              {item.quantity >= item.stock && (
                <p className="text-xs text-amber-600 mt-1">
                  Stock máximo: {item.stock}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const CartSummary = () => (
    <div className="border-t pt-4 mt-6 space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold text-gray-900">Total:</span>
        <span className="text-xl font-bold text-green-600">
          {formatPrice(state.total)}
        </span>
      </div>
      
      <div className="space-y-2">
        <Button 
          className="w-full" 
          size="lg"
          onClick={() => {
            closeCart();
            navigate('/checkout');
          }}
        >
          <CreditCard className="w-5 h-5 mr-2" />
          Proceder al pago
        </Button>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={closeCart}
        >
          Continuar comprando
        </Button>
      </div>

      {state.items.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCart}
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Vaciar carrito
        </Button>
      )}
    </div>
  );

  return (
    <Sheet open={state.isOpen} onOpenChange={toggleCart}>
      <SheetTrigger asChild>
        <CartTrigger />
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Carrito de compras
            </SheetTitle>
            {state.itemCount > 0 && (
              <Badge variant="secondary">
                {state.itemCount} {state.itemCount === 1 ? 'artículo' : 'artículos'}
              </Badge>
            )}
          </div>
          <SheetDescription>
            {state.items.length === 0 
              ? 'Tu carrito está vacío' 
              : `${state.items.length} producto${state.items.length !== 1 ? 's' : ''} en tu carrito`
            }
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex-1 overflow-y-auto">
          {state.items.length === 0 ? <EmptyCart /> : <CartItems />}
        </div>

        {state.items.length > 0 && <CartSummary />}
      </SheetContent>
    </Sheet>
  );
};

export default Cart;