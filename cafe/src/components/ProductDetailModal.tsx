import React, { useEffect, useState } from "react";
import { X, ArrowLeft, ArrowRight, Star, Heart, Share2, Truck, Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { productService, BackendProduct } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

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

interface CaracteristicaProducto {
  id: number;
  nombre: string;
  valor: string;
}

interface ProductDetailModalProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
    category: string;
    slug?: string;
    featured?: boolean;
    rating?: number;
  };
  isOpen: boolean;
  onClose: () => void;
}

interface GalleryImage {
  url: string;
  colorId: number | null;
  colorIdx: number | null;
  isMainProduct: boolean;
}

export function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [backendProduct, setBackendProduct] = useState<BackendProduct | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [fade, setFade] = useState(false);
  const [imageTransition, setImageTransition] = useState(false);

  // Cargar detalles completos del producto del backend
  useEffect(() => {
    if (isOpen && product && isAuthenticated) {
      const loadProductDetails = async () => {
        setLoading(true);
        try {
          const response = await productService.getProductBySlug(product.slug || product.id);
          if (response.success) {
            setBackendProduct(response.data);
            // Seleccionar el primer color por defecto si hay colores
            if (response.data.colores && response.data.colores.length > 0) {
              setSelectedColorId(response.data.colores[0].id);
            }
          }
        } catch (error) {
          console.error('Error loading product details:', error);
        } finally {
          setLoading(false);
        }
      };
      loadProductDetails();
    }
  }, [isOpen, product, isAuthenticated]);

  // Construir galería de imágenes
  let galleryImages: GalleryImage[] = [];
  if (backendProduct?.imagen_principal_url) {
    galleryImages.push({
      url: backendProduct.imagen_principal_url,
      colorId: null,
      colorIdx: null,
      isMainProduct: true,
    });
  } else if (product.image) {
    galleryImages.push({
      url: product.image,
      colorId: null,
      colorIdx: null,
      isMainProduct: true,
    });
  }

  if (backendProduct?.colores && backendProduct.colores.length > 0) {
    backendProduct.colores.forEach((color, idx) => {
      color.imagenes.forEach(img => {
        if (img.url_imagen !== backendProduct.imagen_principal_url) {
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

  // Miniaturas: imagen principal + principal de cada color
  let thumbnailImages: { url: string; idx: number }[] = [];
  if (galleryImages.length > 0) {
    thumbnailImages.push({ url: galleryImages[0].url, idx: 0 });
    const colorIds: Set<number> = new Set();
    for (let i = 1; i < galleryImages.length; i++) {
      const img = galleryImages[i];
      if (img.colorId && !colorIds.has(img.colorId)) {
        thumbnailImages.push({ url: img.url, idx: i });
        colorIds.add(img.colorId);
      }
    }
  }

  const selectedColor = backendProduct?.colores?.find(c => c.id === selectedColorId) || null;

  const handleColorSelect = (colorId: number) => {
    setSelectedColorId(colorId);
    const idx = galleryImages.findIndex(img => img.colorId === colorId);
    if (idx !== -1) setSelectedImageIdx(idx);
  };

  const nextImage = () => {
    setImageTransition(true);
    setTimeout(() => {
      setSelectedImageIdx((selectedImageIdx + 1) % galleryImages.length);
      setImageTransition(false);
    }, 150);
  };

  const prevImage = () => {
    setImageTransition(true);
    setTimeout(() => {
      setSelectedImageIdx((selectedImageIdx - 1 + galleryImages.length) % galleryImages.length);
      setImageTransition(false);
    }, 150);
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

  useEffect(() => {
    setFade(false);
  }, [selectedImageIdx]);

  useEffect(() => {
    const current = galleryImages[selectedImageIdx];
    if (!current) return;
    if (current.isMainProduct) {
      if (selectedColorId !== null) setSelectedColorId(null);
    } else if (current.colorId && current.colorId !== selectedColorId) {
      setSelectedColorId(current.colorId);
    }
  }, [selectedImageIdx]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-2xl font-light text-neutral-900 tracking-wide">
              {product.name}
            </h2>
            <p className="text-sm text-neutral-500 uppercase tracking-wider mt-1">
              {backendProduct?.categoria?.nombre || "Café"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 max-h-[calc(90vh-80px)] overflow-y-auto">
          {/* Image Gallery */}
          <div className="p-6 space-y-4">
            <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden flex items-center justify-center relative">
              {galleryImages.length > 0 ? (
                <>
                  <img
                    key={selectedImageIdx}
                    src={galleryImages[selectedImageIdx].url}
                    alt={product.name}
                    className={`w-full h-full object-contain transition-all duration-300 ${
                      imageTransition ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                    }`}
                  />
                  {/* Navigation arrows */}
                  {galleryImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110"
                        aria-label="Imagen anterior"
                      >
                        <ArrowLeft className="w-5 h-5 text-neutral-700" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110"
                        aria-label="Imagen siguiente"
                      >
                        <ArrowRight className="w-5 h-5 text-neutral-700" />
                      </button>
                    </>
                  )}
                  {/* Image Counter */}
                  {galleryImages.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs">
                      {selectedImageIdx + 1} / {galleryImages.length}
                    </div>
                  )}
                </>
              ) : (
                <span className="text-neutral-400">Sin imagen</span>
              )}
            </div>
            
            {/* Thumbnails */}
            {thumbnailImages.length > 1 && (
              <div className="flex gap-2 justify-center pb-2">
                {thumbnailImages.map((thumb, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleThumbnailClick(thumb.idx)}
                    className={`aspect-square w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImageIdx === thumb.idx ? 'border-neutral-900 shadow-md scale-105' : 'border-transparent hover:border-neutral-400 hover:scale-102'
                    }`}
                  >
                    <img
                      src={thumb.url}
                      alt={`Miniatura ${idx + 1}`}
                      className="w-full h-full object-contain bg-gray-50 transition-transform duration-200 hover:scale-110"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-6 space-y-6">
            {/* Price */}
            <div className="text-3xl font-semibold text-neutral-900">
              ${product.price.toFixed(2)}
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating!)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-neutral-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-neutral-600">({product.rating})</span>
              </div>
            )}

            {/* Colors */}
            {backendProduct?.colores && backendProduct.colores.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-neutral-900">Colores disponibles</h3>
                <div className="flex flex-wrap gap-2">
                  {backendProduct.colores.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => handleColorSelect(color.id)}
                      className={`relative w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                        selectedColorId === color.id
                          ? 'border-neutral-800 shadow-lg scale-110'
                          : 'border-neutral-300 hover:border-neutral-500'
                      }`}
                      style={{ backgroundColor: color.hex_code }}
                      title={color.nombre}
                    >
                      {selectedColorId === color.id && (
                        <div className="absolute inset-0 rounded-full border-2 border-white" />
                      )}
                    </button>
                  ))}
                </div>
                {selectedColor && (
                  <p className="text-sm text-neutral-600">
                    Color seleccionado: <span className="font-medium">{selectedColor.nombre}</span>
                  </p>
                )}
              </div>
            )}

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-neutral-900">Descripción</h3>
              <p className="text-neutral-600 leading-relaxed">
                {backendProduct?.descripcion_larga || backendProduct?.descripcion_corta || product.description}
              </p>
            </div>

            {/* Characteristics */}
            {backendProduct?.caracteristicas && backendProduct.caracteristicas.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-neutral-900">Características</h3>
                <div className="grid grid-cols-1 gap-2">
                  {backendProduct.caracteristicas.map((caracteristica, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-neutral-100 last:border-b-0">
                      <span className="text-sm font-medium text-neutral-700">{caracteristica.nombre}:</span>
                      <span className="text-sm text-neutral-600">{caracteristica.valor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            {backendProduct?.stock !== undefined && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-neutral-900">Disponibilidad</h3>
                <p className={backendProduct.stock > 0 ? "text-green-600" : "text-red-500"}>
                  {backendProduct.stock > 0 ? `${backendProduct.stock} disponibles` : "Agotado"}
                </p>
              </div>
            )}

            {/* Features */}
            <Card className="border-neutral-200">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 text-neutral-900">¿Por qué elegir este producto?</h3>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    Calidad premium garantizada
                  </li>
                  <li className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-blue-600" />
                    Envío rápido y seguro
                  </li>
                  <li className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-orange-600" />
                    Tostado artesanal en pequeños lotes
                  </li>
                  <li className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-600" />
                    Origen rastreado y sostenible
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}