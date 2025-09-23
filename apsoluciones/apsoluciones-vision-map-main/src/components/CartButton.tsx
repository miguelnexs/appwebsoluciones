import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

const CartButton = () => {
  const handleCartClick = () => {
    // Placeholder for cart functionality
    console.log('Cart button clicked');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCartClick}
      className="relative hover:bg-accent/50 transition-colors duration-200"
      aria-label="Carrito de compras"
    >
      <ShoppingBag className="h-5 w-5" />
      {/* Optional: Add cart item count badge */}
      {/* <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
        0
      </span> */}
    </Button>
  );
};

export default CartButton;