import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/Header';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Minus, 
  Plus, 
  Star,
  Truck,
  Shield,
  RotateCcw,
  Loader2,
  AlertCircle,
  Package,
  Tag,
  Info,
  Check
} from 'lucide-react';

interface Producto {
  id: number;
  sku: string;
  nombre: string;
  slug: string;
  imagen_principal?: string;
  imagen_principal_url?: string;
  descripcion_corta: string;
  descripcion_larga: string;
  tipo: string;
  estado: string;
  categoria?: {
    id: number;
    nombre: string;
    slug: string;
  };
  precio: number;
  precio_comparacion?: number;
  stock: number;
  vendidos: number;
  disponible_para_venta: boolean;
  activo: boolean;
  destacado: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

interface ColorProducto {
  id: number;
  nombre: string;
  codigo_hex: string;
  imagenes: ImagenProducto[];
}

interface ImagenProducto {
  id: number;
  imagen: string;
  imagen_url: string;
  orden: number;
  es_principal: boolean;
}

interface CaracteristicaProducto {
  id: number;
  nombre: string;
  valor: string;
  orden: number;
}

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();
  
  const [producto, setProducto] = useState<Producto | null>(null);
  const [colores, setColores] = useState<ColorProducto[]>([]);
  const [caracteristicas, setCaracteristicas] = useState<CaracteristicaProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorProducto | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (slug) {
      loadProductDetail();
    }
  }, [slug]);

  const loadProductDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar producto
      const productoResponse = await apiService.getProducto(slug!);
      setProducto(productoResponse);

      // Cargar colores e imágenes
      try {
        const coloresResponse = await fetch(`http://localhost:8000/api/productos/${productoResponse.id}/colores-publico/`);
        if (coloresResponse.ok) {
          const coloresData = await coloresResponse.json();
          setColores(coloresData);
          if (coloresData.length > 0) {
            setSelectedColor(coloresData[0]);
          }
        }
      } catch (err) {
        console.log('No se pudieron cargar los colores:', err);
      }

      // Cargar características
      try {
        const caracteristicasResponse = await fetch(`http://localhost:8000/api/productos/${productoResponse.id}/caracteristicas-publico/`);
        if (caracteristicasResponse.ok) {
          const caracteristicasData = await caracteristicasResponse.json();
          setCaracteristicas(caracteristicasData);
        }
      } catch (err) {
        console.log('No se pudieron cargar las características:', err);
      }

    } catch (err) {
      console.error('Error loading product:', err);
      setError('Error al cargar el producto. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url?: string): string => {
    if (!url) return '/placeholder-product.jpg';
    if (url.startsWith('http')) return url;
    return `http://softwarebycg.shop${url}`;
  };

  const getCurrentImages = () => {
    if (selectedColor && selectedColor.imagenes.length > 0) {
      return selectedColor.imagenes.sort((a, b) => a.orden - b.orden);
    }
    if (producto?.imagen_principal_url || producto?.imagen_principal) {
      return [{
        id: 0,
        imagen: producto.imagen_principal || '',
        imagen_url: producto.imagen_principal_url || '',
        orden: 0,
        es_principal: true
      }];
    }
    return [];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (producto?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!producto) return;
    
    setIsAddingToCart(true);
    
    try {
      const currentImages = getCurrentImages();
      const cartItem = {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen_principal_url: currentImages[0]?.imagen_url || producto.imagen_principal_url,
        selectedColor: selectedColor?.nombre,
        stock: producto.stock,
        quantity
      };

      addItem(cartItem);
      
      // Mostrar feedback visual
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
      
      // Abrir el carrito después de un breve delay
      setTimeout(() => openCart(), 500);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h2>
          <p className="text-gray-600 mb-6">{error || 'El producto que buscas no existe o no está disponible.'}</p>
          <Button onClick={() => navigate('/productos')} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a productos
          </Button>
        </div>
      </div>
    );
  }

  const currentImages = getCurrentImages();
  const currentImage = currentImages[selectedImageIndex] || currentImages[0];
  const hasDiscount = producto.precio_comparacion && producto.precio_comparacion > producto.precio;
  const discountPercentage = hasDiscount 
    ? Math.round(((producto.precio_comparacion! - producto.precio) / producto.precio_comparacion!) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Principal */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
              {currentImage ? (
                <img
                  src={getImageUrl(currentImage.imagen_url || currentImage.imagen)}
                  alt={producto.nombre}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-product.jpg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {currentImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {currentImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded border-2 overflow-hidden transition-all ${
                      selectedImageIndex === index 
                        ? 'border-gray-800' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={getImageUrl(image.imagen_url || image.imagen)}
                      alt={`${producto.nombre} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Title and Category */}
            <div>
              {producto.categoria && (
                <div className="text-sm text-gray-500 mb-2">
                  {producto.categoria.nombre}
                </div>
              )}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{producto.nombre}</h1>
              <p className="text-gray-600">{producto.descripcion_larga}</p>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(producto.precio)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(producto.precio_comparacion!)}
                  </span>
                  <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    -{discountPercentage}%
                  </span>
                </>
              )}
            </div>

            {/* Product Details Grid */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-200">
              <div>
                <span className="text-sm text-gray-500">SKU</span>
                <p className="font-medium">{producto.sku}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Stock</span>
                <p className="font-medium">{producto.stock} unidades</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Última actualización</span>
                <p className="font-medium">{new Date(producto.fecha_actualizacion).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Colors */}
            {colores.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Colores disponibles</h3>
                <div className="flex space-x-2">
                  {colores.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => {
                        setSelectedColor(color);
                        setSelectedImageIndex(0);
                      }}
                      className={`w-10 h-10 rounded border-2 transition-all ${
                        selectedColor?.id === color.id
                          ? 'border-gray-800'
                          : 'border-gray-300 hover:border-gray-500'
                      }`}
                      style={{ backgroundColor: color.codigo_hex }}
                      title={color.nombre}
                    />
                  ))}
                </div>
                {selectedColor && (
                  <p className="text-sm text-gray-600 mt-2">
                    Color seleccionado: <span className="font-medium">{selectedColor.nombre}</span>
                  </p>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Cantidad</h3>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="border-gray-300"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-lg font-medium min-w-[3rem] text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= producto.stock}
                  className="border-gray-300"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={producto.stock === 0 || isAddingToCart}
              className={`w-full h-12 text-lg font-medium transition-all bg-gray-900 hover:bg-gray-800 text-white ${
                addedToCart 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : ''
              }`}
              size="lg"
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Añadiendo...
                </>
              ) : addedToCart ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  ¡Añadido al carrito!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {producto.stock === 0 ? 'Agotado' : 'Añadir al carrito'}
                </>
              )}
            </Button>

            {/* Product Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Truck className="w-4 h-4" />
                <span>Envío gratis</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>Garantía incluida</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <RotateCcw className="w-4 h-4" />
                <span>Devolución fácil</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16 space-y-8">
          {/* Specifications */}
          {caracteristicas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Especificaciones</CardTitle>
                <CardDescription>
                  Características técnicas del producto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {caracteristicas
                    .sort((a, b) => a.orden - b.orden)
                    .map((caracteristica) => (
                      <div key={caracteristica.id} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <span className="font-medium text-gray-900">{caracteristica.nombre}:</span>
                        <span className="text-gray-600">{caracteristica.valor}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;