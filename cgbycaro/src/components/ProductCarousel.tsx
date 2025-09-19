import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ColorDisplay from './ColorDisplay';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  category: string;
  colors: Array<{
    name: string;
    images: string[];
  }>;
}

interface ProductCarouselProps {
  products: Product[];
  category: string;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ products, category }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Verificar si se puede hacer scroll
  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Scroll suave hacia la izquierda o derecha
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current && !isScrolling) {
      setIsScrolling(true);
      const scrollAmount = 320; // Ancho de una tarjeta + gap
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });

      // Resetear el estado de scrolling después de la animación
      setTimeout(() => {
        setIsScrolling(false);
        checkScrollability();
      }, 300);
    }
  };

  // Manejar scroll con rueda del mouse
  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
      e.preventDefault();
      scrollContainerRef.current.scrollLeft += e.deltaY;
      checkScrollability();
    }
  };

  // Manejar eventos táctiles
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && canScrollRight) {
      scroll('right');
    }
    if (isRightSwipe && canScrollLeft) {
      scroll('left');
    }

    // Resetear valores
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Verificar scrollability al montar y redimensionar
  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [products]);

  // Si hay 4 productos o menos, mostrar grilla normal
  if (products.length <= 4) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} category={category} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Botón de navegación izquierda */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-neutral-200 flex items-center justify-center hover:bg-white hover:shadow-xl transition-all duration-300 group"
          aria-label="Scroll hacia la izquierda"
        >
          <ChevronLeft className="w-6 h-6 text-neutral-600 group-hover:text-neutral-900 transition-colors" />
        </button>
      )}

      {/* Botón de navegación derecha */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-neutral-200 flex items-center justify-center hover:bg-white hover:shadow-xl transition-all duration-300 group"
          aria-label="Scroll hacia la derecha"
        >
          <ChevronRight className="w-6 h-6 text-neutral-600 group-hover:text-neutral-900 transition-colors" />
        </button>
      )}

      {/* Contenedor de productos con scroll horizontal */}
      <div
        ref={scrollContainerRef}
        className="flex gap-8 overflow-x-auto scrollbar-hide carousel-container pb-4 px-12"
        onScroll={checkScrollability}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {products.map((product) => (
          <div key={product.id} className="flex-none w-72">
            <ProductCard product={product} category={category} />
          </div>
        ))}
      </div>

      {/* Indicador de scroll (opcional) */}
      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: Math.ceil(products.length / 4) }).map((_, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full bg-neutral-300 transition-colors duration-300"
          />
        ))}
      </div>
    </div>
  );
};

// Componente de tarjeta de producto reutilizable
const ProductCard: React.FC<{ product: Product; category: string }> = ({ product, category }) => {
  return (
    <div className="group">
      <Link to={`/producto/${product.slug}`}>
        <div className="aspect-square overflow-hidden bg-gray-50 mb-3 rounded-lg">
          <img 
            src={product.colors[0]?.images[0] || '/placeholder-product.jpg'} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="space-y-2 text-center">
          <h4 className="text-base font-medium text-neutral-800 tracking-wide group-hover:text-neutral-900 transition-colors duration-300">
            {product.name}
          </h4>
          <p className="text-xs text-neutral-400 uppercase tracking-widest font-light">
            {category}
          </p>
          <ColorDisplay colors={product.colors} maxColors={4} size="sm" />
          <p className="text-lg font-semibold text-neutral-900">
            {product.price}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default ProductCarousel;