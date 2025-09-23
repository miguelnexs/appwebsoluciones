import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProducto, Producto } from '@/data/staticData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/Header';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Star,
  Truck,
  Shield,
  RotateCcw,
  AlertCircle,
  Package,
  Tag,
  Info
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
  
  const [producto, setProducto] = useState<Producto | null>(null);
  const [colores, setColores] = useState<ColorProducto[]>([]);
  const [caracteristicas, setCaracteristicas] = useState<CaracteristicaProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorProducto | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (slug) {
      loadProductDetail();
    }
  }, [slug]);

  const loadProductDetail = () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar producto
      const productoResponse = getProducto(slug!);
      setProducto(productoResponse);

      // Usar la imagen real del producto
      const coloresEstaticos = [
        {
          id: 1,
          nombre: 'Negro',
          codigo_hex: '#000000',
          imagenes: [
            {
              id: 1,
              imagen: productoResponse.imagen_principal || '',
              imagen_url: productoResponse.imagen_principal || '',
              orden: 1,
              es_principal: true
            }
          ]
        },
        {
          id: 2,
          nombre: 'Blanco',
          codigo_hex: '#ffffff',
          imagenes: [
            {
              id: 2,
              imagen: productoResponse.imagen_principal || '',
              imagen_url: productoResponse.imagen_principal || '',
              orden: 1,
              es_principal: true
            }
          ]
        }
      ];
      
      setColores(coloresEstaticos);
      if (coloresEstaticos.length > 0) {
        setSelectedColor(coloresEstaticos[0]);
      }
      // Simular características estáticas
      const caracteristicasEstaticas = [
        {
          id: 1,
          nombre: 'Material',
          valor: 'Algodón 100%',
          orden: 1
        },
        {
          id: 2,
          nombre: 'Talla',
          valor: 'S, M, L, XL',
          orden: 2
        },
        {
          id: 3,
          nombre: 'Cuidado',
          valor: 'Lavar a máquina',
          orden: 3
        }
      ];
      
      setCaracteristicas(caracteristicasEstaticas);

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
    
    // Para imágenes en la carpeta public, Vite las sirve directamente
    if (url.startsWith('/')) return url;
    
    return url;
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
          <Button onClick={() => navigate('/')} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
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