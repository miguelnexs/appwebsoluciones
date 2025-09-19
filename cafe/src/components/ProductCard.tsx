import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Product, useCartActions } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCartActions();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Producto agregado",
      description: `${product.name} se ha agregado al carrito`,
    });
  };



  return (
    <>
      <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
          />
        </div>
        <Link to={`/productos/${product.id}`} className="block">
          <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            {/* Rating */}
            {product.rating && (
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(product.rating!)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-1">
                  ({product.rating})
                </span>
              </div>
            )}

            {/* Name */}
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-smooth line-clamp-2">
              {product.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>

            {/* Price */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </span>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              className="w-full mt-3 gradient-coffee text-white hover:opacity-90 transition-smooth"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Agregar al Carrito
            </Button>
          </div>
          </CardContent>
        </Link>
      </Card>
    </>
  );
}