
import React, { createContext, useContext, useState, ReactNode } from 'react';
import Cookies from 'js-cookie';

export interface CartItem {
  id: number;
  name: string;
  price: string;
  priceNumber: number;
  image: string;
  color: string;
  colorId?: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number, color: string, colorId?: number) => void;
  updateQuantity: (id: number, color: string, quantity: number, colorId?: number) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const cookie = Cookies.get('cart');
    if (cookie) {
      try {
        return JSON.parse(cookie);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Guardar el carrito en cookies cada vez que cambie
  React.useEffect(() => {
    Cookies.set('cart', JSON.stringify(items), { expires: 7 });
  }, [items]);

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.id === newItem.id && item.color === newItem.color && item.colorId === newItem.colorId);
      if (existingItem) {
        return prev.map(item =>
          item.id === newItem.id && item.color === newItem.color && item.colorId === newItem.colorId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  };

  const removeItem = (id: number, color: string, colorId?: number) => {
    setItems(prev => prev.filter(item => !(item.id === id && item.color === color && item.colorId === colorId)));
  };

  const updateQuantity = (id: number, color: string, quantity: number, colorId?: number) => {
    if (quantity <= 0) {
      removeItem(id, color, colorId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.id === id && item.color === color && item.colorId === colorId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.priceNumber * item.quantity), 0);
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      getTotalItems,
      getTotalPrice,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
