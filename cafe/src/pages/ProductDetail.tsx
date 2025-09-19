import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Product, useCartActions } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { API_CONFIG } from '@/config/api';
import { productService } from '@/services/productService';

interface ImagenColor {
  id: number;
  imagen: string;
  es_principal: boolean;
}

interface ColorProducto {
  id: number;
  nombre: string;
  codigo_hex: string;
  imagenes: ImagenColor[];
}

interface CaracteristicaProducto {
  id: number;
  nombre: string;
  valor: string;
}

interface ProductoBackend {
  id: number;
  nombre: string;
  descripcion_corta?: string;
  descripcion_larga?: string;
  precio: number;
  stock: number;
  categoria: string;
  colores: ColorProducto[];
  caracteristicas?: CaracteristicaProducto[];
  imagen_principal?: string;
}

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCartActions();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [backendProduct, setBackendProduct] = useState<ProductoBackend | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorProducto | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [imageTransition, setImageTransition] = useState(false);
  
  const [galleryImages, setGalleryImages] = useState<{url: string, idx: number}[]>([]);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  useEffect(() => {
    if (id) {
      loadProductDetails();
    }
  }, [id]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar productos desde el servicio
      const products = await productService.getProducts();
      const foundProduct = products.find(p => p.id === parseInt(id!));
      
      if (!foundProduct) {
        setError('Producto no encontrado');
        return;
      }
      
      setProduct(foundProduct);
      
      // Cargar detalles completos del backend
      const response = await fetch(`${API_CONFIG.baseURL}/api/productos/${id}/`);
      if (response.ok) {
        const backendData: ProductoBackend = await response.json();
        setBackendProduct(backendData);
        
        // Configurar imágenes de galería
        const images: {url: string, idx: number}[] = [];
        
        if (backendData.imagen_principal) {
          images.push({
            url: `${API_CONFIG.baseURL}${backendData.imagen_principal}`,
            idx: 0
          });
        }
        
        // Agregar imágenes de colores
        backendData.colores?.forEach((color, colorIdx) => {
          color.imagenes?.forEach((img, imgIdx) => {
            images.push({
              url: `${API_CONFIG.baseURL}${img.imagen}`,
              idx: images.length
            });
          });
        });
        
        if (images.length === 0 && foundProduct.image) {
          images.push({
            url: foundProduct.image,
            idx: 0
          });
        }
        
        setGalleryImages(images);
        
        // Seleccionar primer color si existe
        if (backendData.colores && backendData.colores.length > 0) {
          const firstColor = backendData.colores[0];
          setSelectedColor(firstColor);
          setSelectedColorId(firstColor.id);
        }
      }
    } catch (err) {
      console.error('Error loading product details:', err);
      setError('Error al cargar los detalles del producto');
    } finally {
      setLoading(false);
    }
  };

  const handleColorSelect = (colorId: number) => {
    const color = backendProduct?.colores.find(c => c.id === colorId);
    if (color) {
      setSelectedColor(color);
      setSelectedColorId(colorId);
      
      // Actualizar galería con imágenes del color
      if (color.imagenes && color.imagenes.length > 0) {
        const colorImages = color.imagenes.map((img, idx) => ({
          url: `${API_CONFIG.baseURL}${img.imagen}`,
          idx: idx
        }));
        setGalleryImages(colorImages);
        setSelectedImageIdx(0);
      }
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (backendProduct?.stock || 999)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const productToAdd = {
      ...product,
      selectedColor: selectedColor?.nombre,
      selectedColorId: selectedColor?.id
    };
    
    addToCart(productToAdd, quantity);
    
    toast({
      title: "Producto agregado",
      description: `${quantity} ${product.name}${selectedColor ? ` (${selectedColor.nombre})` : ''} agregado${quantity > 1 ? 's' : ''} al carrito`,
    });
  };

  const handlePreviousImage = () => {
    if (galleryImages.length > 1) {
      setImageTransition(true);
      setTimeout(() => {
        setSelectedImageIdx((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
        setImageTransition(false);
      }, 150);
    }
  };

  const handleNextImage = () => {
    if (galleryImages.length > 1) {
      setImageTransition(true);
      setTimeout(() => {
        setSelectedImageIdx((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
        setImageTransition(false);
      }, 150);
    }
  };

  const handleThumbnailClick = (index: number) => {
    if (index !== selectedImageIdx) {
      setImageTransition(true);
      setTimeout(() => {
        setSelectedImageIdx(index);
        setImageTransition(false);
      }, 150);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Producto no encontrado'}</p>
          <Button onClick={() => navigate('/productos')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a productos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button 
            onClick={() => navigate('/productos')} 
            variant="ghost" 
            className="text-amber-700 hover:text-amber-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a productos
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
              {galleryImages.length > 0 ? (
                <>
                  <img
                    src={galleryImages[selectedImageIdx]?.url}
                    alt={product.name}
                    className={`w-full h-full object-contain transition-all duration-300 ${
                      imageTransition ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                    }`}
                  />
                  
                  {/* Flechas de navegación */}
                  {galleryImages.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md transition-all duration-200 hover:scale-110"
                        onClick={handlePreviousImage}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md transition-all duration-200 hover:scale-110"
                        onClick={handleNextImage}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </>
                  )}
                  
                  {/* Contador de imágenes */}
                  {galleryImages.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImageIdx + 1} / {galleryImages.length}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <p className="text-gray-500">Sin imagen disponible</p>
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {galleryImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {galleryImages.map((image, index) => (
                  <button
                    key={index}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === selectedImageIdx
                        ? 'border-amber-500 shadow-md scale-105'
                        : 'border-gray-200 hover:border-gray-300 hover:scale-102'
                    }`}
                    onClick={() => handleThumbnailClick(index)}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-contain bg-white transition-transform duration-200 hover:scale-110"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-0 space-y-6">
                {/* Título y precio */}
                <div>
                  <p className="text-sm text-amber-600 font-medium mb-2">
                    {backendProduct?.categoria || 'Producto'}
                  </p>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {product.name}
                  </h1>
                  <p className="text-4xl font-bold text-amber-600">
                    ${product.price.toFixed(2)}
                  </p>
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Descripción</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {backendProduct?.descripcion_larga || backendProduct?.descripcion_corta || product.description}
                  </p>
                </div>

                {/* Colores disponibles */}
                {backendProduct?.colores && backendProduct.colores.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Colores disponibles</h3>
                    <div className="flex flex-wrap gap-3">
                      {backendProduct.colores.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => handleColorSelect(color.id)}
                          className={`relative w-12 h-12 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                            selectedColorId === color.id
                              ? 'border-gray-800 shadow-lg scale-110'
                              : 'border-gray-300 hover:border-gray-500'
                          }`}
                          style={{ backgroundColor: color.codigo_hex }}
                          title={color.nombre}
                        >
                          {selectedColorId === color.id && (
                            <div className="absolute inset-0 rounded-full border-2 border-white" />
                          )}
                        </button>
                      ))}
                    </div>
                    {selectedColor && (
                      <p className="text-sm text-gray-600">
                        Color seleccionado: <span className="font-medium">{selectedColor.nombre}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Características */}
                {backendProduct?.caracteristicas && backendProduct.caracteristicas.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Características</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {backendProduct.caracteristicas.map((caracteristica, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <span className="font-medium text-gray-700">{caracteristica.nombre}:</span>
                          <span className="text-gray-600">{caracteristica.valor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estado del stock */}
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    (backendProduct?.stock || 0) > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className={`font-medium ${
                    (backendProduct?.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(backendProduct?.stock || 0) > 0 ? 'En stock' : 'Agotado'}
                  </span>
                  {(backendProduct?.stock || 0) > 0 && (
                    <span className="text-gray-500">({backendProduct?.stock} disponibles)</span>
                  )}
                </div>

                {/* Selector de cantidad */}
                {(backendProduct?.stock || 0) > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Cantidad</h3>
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="h-10 w-10"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-bold text-xl min-w-[3rem] text-center">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= (backendProduct?.stock || 0)}
                        className="h-10 w-10"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Botón agregar al carrito */}
                <div className="pt-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={(backendProduct?.stock || 0) === 0}
                    className="w-full gradient-coffee text-white hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed py-4 text-lg"
                    size="lg"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {(backendProduct?.stock || 0) > 0 
                      ? `Agregar al carrito - $${(product.price * quantity).toFixed(2)}`
                      : 'Producto agotado'
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;