import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_CONFIG, getImageUrl, getImageUrlWithFallback } from '../config/api';
import OptimizedImage from '../components/ui/OptimizedImage';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Heart, Share2, Star, Truck, Shield, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import FreeShippingBar from "@/components/FreeShippingBar";
import CartDropdown from "@/components/CartDropdown";

interface ImagenColor {
  id: number;
  url_imagen: string;
  es_principal: boolean;
}

interface ColorProducto {
  id: number;
  nombre: string;
  hex_code: string;
  imagenes: ImagenColor[];
}

interface ProductoBackend {
  id: number;
  nombre: string;
  slug: string;
  precio: string;
  descripcion_corta: string;
  descripcion_larga: string;
  imagen_principal_url?: string;
  stock: number;
  categoria?: { nombre: string };
  colores?: ColorProducto[];
}

const ProductoDetalle = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [producto, setProducto] = useState<ProductoBackend | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [fade, setFade] = useState(false);

  React.useEffect(() => {
    async function fetchProducto() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_CONFIG.API_URL}/productos/productos/${slug}/`);
        const data = await res.json();
        if (!res.ok || data.error) {
          setError(data.error || "No se pudo cargar el producto");
          setProducto(null);
        } else if (!data || !data.slug) {
          setError("Producto no encontrado");
          setProducto(null);
        } else {
          setProducto(data);
          // Seleccionar el primer color por defecto si hay colores
          if (data.colores && data.colores.length > 0) {
            setSelectedColorId(data.colores[0].id);
            setSelectedImageIdx(0);
          }
        }
      } catch (e: any) {
        setError(e.message);
        setProducto(null);
        console.error("Error cargando producto:", e);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchProducto();
  }, [slug]);

  // Cambia el color seleccionado y navega a la imagen principal de ese color
  const handleColorSelect = (colorId: number) => {
    setSelectedColorId(colorId);
    // Buscar la primera aparición de ese color en galleryImages
    const idx = galleryImages.findIndex(img => img.colorId === colorId);
    if (idx !== -1) setSelectedImageIdx(idx);
  };

  // Obtiene el color seleccionado
  const selectedColor = producto?.colores?.find(c => c.id === selectedColorId) || null;

  // Lógica para obtener solo la imagen principal de cada color
  function getMainImageOfColor(color: ColorProducto): ImagenColor | null {
    if (!color.imagenes || color.imagenes.length === 0) return null;
    // Buscar imagen principal
    const principal = color.imagenes.find(img => img.es_principal);
    if (principal) return principal;
    // Si no hay principal, usar la primera
    return color.imagenes[0];
  }

  // Construir una lista plana de imágenes: principal + todas las de cada color
  interface GalleryImage {
    url: string;
    colorId: number | null; // null para la imagen principal del producto
    colorIdx: number | null; // índice del color en el array, null para principal
    isMainProduct: boolean;
  }

  let galleryImages: GalleryImage[] = [];
  if (producto?.imagen_principal_url) {
    galleryImages.push({
      url: producto.imagen_principal_url,
      colorId: null,
      colorIdx: null,
      isMainProduct: true,
    });
  }
  if (producto?.colores && producto.colores.length > 0) {
    producto.colores.forEach((color, idx) => {
      color.imagenes.forEach(img => {
        // Evitar duplicar la imagen principal del producto
        if (img.url_imagen !== producto.imagen_principal_url) {
          galleryImages.push({
            url: img.url_imagen,
            colorId: color.id,
            colorIdx: idx,
            isMainProduct: false,
          });
        }
      });
    });
  }

  // Cuando cambie la imagen, actualizar el color seleccionado si corresponde
  useEffect(() => {
    const current = galleryImages[selectedImageIdx];
    if (!current) return;
    if (current.isMainProduct) {
      if (selectedColorId !== null) setSelectedColorId(null);
    } else if (current.colorId && current.colorId !== selectedColorId) {
      setSelectedColorId(current.colorId);
    }
  }, [selectedImageIdx]);

  const handleAddToCart = () => {
    if (!producto) return;
    addItem({
      id: producto.id,
      name: producto.nombre,
      price: `$${Number(producto.precio).toLocaleString('es-CO')}`,
      priceNumber: Number(producto.precio),
      image: galleryImages[0]?.url,
      color: selectedColor ? selectedColor.nombre : undefined
    });
    toast({
      title: "Producto agregado al carrito",
      description: `${producto.nombre} agregado al carrito`,
    });
  };



  // Resetear fade cuando cambia la imagen
  useEffect(() => {
    setFade(false);
  }, [selectedImageIdx]);

  // Miniaturas: imagen principal del producto + principal de cada color (sin duplicados)
  let thumbnailImages: { url: string; idx: number }[] = [];
  if (galleryImages.length > 0) {
    // Imagen principal del producto
    thumbnailImages.push({ url: galleryImages[0].url, idx: 0 });
    // Imagen principal de cada color (primera aparición de cada colorId)
    const colorIds: Set<number> = new Set();
    for (let i = 1; i < galleryImages.length; i++) {
      const img = galleryImages[i];
      if (img.colorId && !colorIds.has(img.colorId)) {
        thumbnailImages.push({ url: img.url, idx: i });
        colorIds.add(img.colorId);
      }
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-neutral-500">Cargando producto...</div>;
  if (error || !producto) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-light text-neutral-900 mb-4">Producto no encontrado</h1>
        <Button onClick={() => navigate('/')} variant="outline">
          Volver al inicio
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header simple */}
      <div className="bg-white border-b border-neutral-200 py-4 px-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <h1 className="text-xl font-light tracking-wide text-neutral-900">
            cgcaroGonzalez
          </h1>
          <CartDropdown />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <FreeShippingBar />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden flex items-center justify-center relative">
              {galleryImages.length > 0 ? (
                <>
                  <OptimizedImage
                    key={selectedImageIdx}
                    src={galleryImages[selectedImageIdx].url}
                    alt={producto.nombre}
                    className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${fade ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setFade(false)}
                    fallbackSrc="/placeholder-product.jpg"
                  />
                  {/* Flecha izquierda */}
                  {galleryImages.length > 1 && (
                    <button
                      onClick={() => {
                        setFade(true);
                        setTimeout(() => {
                          setSelectedImageIdx((selectedImageIdx - 1 + galleryImages.length) % galleryImages.length);
                        }, 200);
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow transition"
                      aria-label="Imagen anterior"
                    >
                      <ArrowLeft className="w-6 h-6 text-neutral-700" />
                    </button>
                  )}
                  {/* Flecha derecha */}
                  {galleryImages.length > 1 && (
                    <button
                      onClick={() => {
                        setFade(true);
                        setTimeout(() => {
                          setSelectedImageIdx((selectedImageIdx + 1) % galleryImages.length);
                        }, 200);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow transition"
                      aria-label="Imagen siguiente"
                    >
                      <ArrowRight className="w-6 h-6 text-neutral-700" />
                    </button>
                  )}
                </>
              ) : (
                <span className="text-neutral-400">Sin imagen</span>
              )}
            </div>
            {/* Miniaturas de la imagen principal y de cada color */}
            {thumbnailImages.length > 1 && (
              <div className="flex gap-2 justify-center mt-2">
                {thumbnailImages.map((thumb, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(thumb.idx)}
                    className={`aspect-square w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIdx === thumb.idx ? 'border-neutral-900' : 'border-transparent'
                    }`}
                  >
                    <OptimizedImage
                      src={thumb.url}
                      alt={`Miniatura ${idx + 1}`}
                      className="w-full h-full object-cover"
                      fallbackSrc="/placeholder-thumbnail.jpg"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-neutral-500 uppercase tracking-wider mb-2">
                {producto.categoria?.nombre || "Sin categoría"}
              </p>
              <h1 className="text-3xl font-light text-neutral-900 tracking-wide mb-4">
                {producto.nombre}
              </h1>
              <p className="text-2xl font-semibold text-neutral-900 mb-6">
                €{producto.precio}
              </p>
            </div>

            {/* Selector de colores */}
            {producto.colores && producto.colores.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-neutral-900">Color:</h3>
                <div className="flex gap-3">
                  {producto.colores.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => handleColorSelect(color.id)}
                      className={`px-4 py-2 rounded-md border-2 flex items-center gap-2 transition-colors ${
                        selectedColorId === color.id
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-300 bg-white text-neutral-900 hover:border-neutral-500'
                      }`}
                    >
                      <span
                        className="inline-block w-5 h-5 rounded-full border border-neutral-300"
                        style={{ backgroundColor: color.hex_code }}
                      ></span>
                      {color.nombre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-900">Descripción</h3>
              <p className="text-neutral-600 leading-relaxed">
                {producto.descripcion_larga || producto.descripcion_corta}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-900">Stock disponible</h3>
              <p className={producto.stock > 0 ? "text-green-600" : "text-red-500"}>
                {producto.stock > 0 ? `En stock (${producto.stock} disponibles)` : "Agotado"}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-neutral-900">Cantidad:</label>
                <div className="flex items-center border border-neutral-300 rounded-md">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-neutral-100 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-neutral-300">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-neutral-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleAddToCart}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3"
                  disabled={producto.stock === 0}
                >
                  Agregar al carrito - €{producto.precio}
                </Button>
              </div>
            </div>

            {/* Información de envío */}
            <Card className="border-neutral-200">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-neutral-600" />
                  <div>
                    <p className="font-medium text-neutral-900">Envío gratuito</p>
                    <p className="text-sm text-neutral-600">En pedidos superiores a $300.000 COP</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-neutral-600" />
                  <div>
                    <p className="font-medium text-neutral-900">Garantía extendida</p>
                    <p className="text-sm text-neutral-600">3 meses de garantía incluida</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-neutral-600" />
                  <div>
                    <p className="font-medium text-neutral-900">Devoluciones fáciles</p>
                    <p className="text-sm text-neutral-600">30 días para devoluciones</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalle;
