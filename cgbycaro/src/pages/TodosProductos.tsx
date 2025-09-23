import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Search, Filter, Grid, LayoutList, ShoppingBag, Menu } from 'lucide-react';
import HamburgerMenu from '@/components/HamburgerMenu';
import FreeShippingBar from '@/components/FreeShippingBar';
import { useProductos } from '../hooks/useProductos';
import { useCategorias } from '../hooks/useCategorias';
import { getImageUrl } from '../config/api';
import type { Product } from '../hooks/useProductos';

export default function TodosProductos() {
  const navigate = useNavigate();
  
  // Hooks para obtener datos de la API
  const { products, loading, error } = useProductos();
  const { categorias, loading: loadingCategorias, error: errorCategorias } = useCategorias();
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedColor, setSelectedColor] = useState('Todos');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Get min and max prices for slider
  const minPrice = products.length > 0 ? Math.min(...products.map(p => p.priceNumber)) : 0;
  const maxPrice = products.length > 0 ? Math.max(...products.map(p => p.priceNumber)) : 1000000;
  
  // Obtener categorías únicas de los productos
  const availableCategories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return cats.sort();
  }, [products]);
  
  // Obtener colores únicos de los productos
  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach(product => {
      product.colors.forEach(color => {
        colors.add(color.name);
      });
    });
    return Array.from(colors).sort();
  }, [products]);
  
  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
      const matchesColor = selectedColor === 'Todos' || 
        product.colors.some(color => color.name === selectedColor);
      const matchesPrice = product.priceNumber >= priceRange[0] && product.priceNumber <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesColor && matchesPrice;
    });
    
    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.priceNumber - b.priceNumber;
        case 'price-high':
          return b.priceNumber - a.priceNumber;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [products, searchTerm, selectedCategory, selectedColor, priceRange, sortBy]);
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Todos');
    setSelectedColor('Todos');
    setPriceRange([minPrice, maxPrice]);
    setSortBy('name');
  };
  
  // Mostrar loading mientras se cargan los datos
  if (loading || loadingCategorias) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Cargando productos...</p>
        </div>
      </div>
    );
  }
  
  // Mostrar error si hay problemas cargando los datos
  if (error || errorCategorias) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-destructive mb-4">Error al cargar los productos</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    );
  }
  
  const ProductCard = ({ product }: { product: Product }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    
    // Crear array de todas las imágenes disponibles de todos los colores
    const allImages = useMemo(() => {
      const images: { url: string; colorName: string; colorIndex: number }[] = [];
      product.colors.forEach((color, colorIndex) => {
        if (color.images && color.images.length > 0) {
          images.push({
            url: getImageUrl(color.images[0]), // Tomar la primera imagen de cada color
            colorName: color.name,
            colorIndex
          });
        }
      });
      return images;
    }, [product.colors]);
    
    const currentImage = allImages[currentImageIndex]?.url || getImageUrl(product.colors[0]?.images[0] || '');
    
    // Función para cambiar a la siguiente imagen al hacer hover
    const handleMouseEnter = () => {
      setIsHovering(true);
      if (allImages.length > 1) {
        const nextIndex = (currentImageIndex + 1) % allImages.length;
        setCurrentImageIndex(nextIndex);
      }
    };
    
    const handleMouseLeave = () => {
      setIsHovering(false);
      // Volver a la primera imagen después de un pequeño delay
      setTimeout(() => {
        if (!isHovering) {
          setCurrentImageIndex(0);
        }
      }, 150);
    };
    
    if (viewMode === 'list') {
      return (
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 mb-4" 
              onClick={() => navigate(`/producto/${product.slug}`)}>
          <CardContent className="p-4 flex items-center gap-4">
            <div 
              className="relative overflow-hidden rounded-md bg-gray-50"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <img 
                src={currentImage} 
                alt={product.name}
                className="w-24 h-24 object-contain transition-all duration-500 ease-in-out transform hover:scale-105"
              />
              {allImages.length > 1 && (
                <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {currentImageIndex + 1}/{allImages.length}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <div className="flex items-center gap-1 mb-2">
                {product.colors.map((color, index) => (
                  <Badge 
                    key={index} 
                    variant={index === allImages[currentImageIndex]?.colorIndex ? "default" : "outline"} 
                    className="text-xs"
                  >
                    {color.name}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold text-primary">{product.price}</p>
                <Badge variant="secondary">{product.category}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 group" 
            onClick={() => navigate(`/producto/${product.slug}`)}>
        <CardContent className="p-0">
          <div 
            className="relative overflow-hidden rounded-t-lg"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <img 
              src={currentImage} 
              alt={product.name}
              className="w-full h-48 object-contain group-hover:scale-105 transition-all duration-500 ease-in-out bg-gray-50"
            />
            <div className="absolute top-2 right-2">
              <Badge variant="secondary">{product.category}</Badge>
            </div>
            {allImages.length > 1 && (
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {allImages[currentImageIndex]?.colorName || 'Color'}
              </div>
            )}
            {allImages.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {currentImageIndex + 1}/{allImages.length}
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
            <div className="flex items-center gap-1 mb-2">
              {product.colors.map((color, index) => (
                <Badge 
                  key={index} 
                  variant={index === allImages[currentImageIndex]?.colorIndex ? "default" : "outline"} 
                  className={`text-xs transition-all duration-300 ${
                    index === allImages[currentImageIndex]?.colorIndex 
                      ? 'ring-2 ring-primary ring-offset-1 scale-105' 
                      : ''
                  }`}
                >
                  {color.name}
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-primary">{product.price}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="min-h-screen bg-background">
      <FreeShippingBar />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
              <h1 className="text-2xl font-bold">Todos los Productos</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="md:hidden">
                <HamburgerMenu />
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Filters Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filtros
                  </h2>
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Limpiar
                  </Button>
                </div>
                
                {/* Search */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Buscar</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Categoría</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todos">Todos</SelectItem>
                        {availableCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Color Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Color</label>
                    <Select value={selectedColor} onValueChange={setSelectedColor}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todos">Todos</SelectItem>
                        {availableColors.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Rango de Precio: €{priceRange[0]} - €{priceRange[1]}
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={maxPrice}
                      min={minPrice}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Products Section */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nombre A-Z</SelectItem>
                    <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                    <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* View Mode */}
                <div className="flex items-center border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-3"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-3"
                  >
                    <LayoutList className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Products Grid/List */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-4">No se encontraron productos</p>
                <Button onClick={clearFilters}>Limpiar filtros</Button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "space-y-4"
              }>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}