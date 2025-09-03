// Este hook requiere que React esté instalado y tipado correctamente en el proyecto.
import * as React from "react";
import { API_CONFIG } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { productService, ColorProducto } from '../services/productService';

export interface ProductColor {
  name: string;
  images: string[];
  hex_code?: string;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  priceNumber: number;
  category: string;
  colors: ProductColor[];
  slug: string; // <-- Agregado
}

// Utilidad para asegurar URLs absolutas y seguras
import { getImageUrl } from '../config/api';

export function useProductos() {
  const { tokens } = useAuth();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        // Agregar token de autenticación si está disponible
        if (tokens?.access) {
          headers['Authorization'] = `Bearer ${tokens.access}`;
        }
        
        // Construir URL con filtros según el estado de autenticación
        let url = `${API_CONFIG.API_URL}/productos/productos/?publicos=true`;
        
        // Si el usuario está autenticado, filtrar solo productos digitales y publicados
        if (tokens?.access) {
          url += '&tipo=digital&estado=publicado';
        }
        
        const res = await fetch(url, {
          headers,
        });
        if (!res.ok) throw new Error("Error al obtener productos");
        const data = await res.json();
        // Soporta respuesta paginada (con results) o array directo
        const productosRaw = Array.isArray(data) ? data : data.results;
        if (!Array.isArray(productosRaw)) throw new Error("La respuesta de la API no es un array de productos");
        // Mapear los productos del backend al formato esperado y obtener colores
        const mapped: Product[] = await Promise.all(
          productosRaw.map(async (p: any) => {
            try {
              // Obtener colores del producto
              const colores = await productService.obtenerColoresPublicos(p.id);
              
              let productColors: ProductColor[] = [];
              
              if (colores && colores.length > 0) {
                // Mapear colores reales del backend
                productColors = colores.map((color: ColorProducto) => ({
                  name: color.nombre,
                  hex_code: color.hex_code,
                  images: color.imagenes && color.imagenes.length > 0 
                    ? color.imagenes.map(img => getImageUrl(img.url_imagen))
                    : p.imagen_principal_url ? [getImageUrl(p.imagen_principal_url)] : []
                }));
              } else {
                // Fallback al color único si no hay colores específicos
                productColors = [
                  {
                    name: "Único",
                    images: p.imagen_principal_url ? [getImageUrl(p.imagen_principal_url)] : [],
                  },
                ];
              }
              
              return {
                id: p.id,
                name: p.nombre,
                price: `$${new Intl.NumberFormat('es-CO').format(p.precio)} COP`,
                priceNumber: Number(p.precio),
                category: p.categoria?.nombre || "Sin categoría",
                colors: productColors,
                slug: p.slug, // <-- Agregado
              };
            } catch (error) {
              console.warn(`Error obteniendo colores para producto ${p.id}:`, error);
              // Fallback en caso de error
              return {
                id: p.id,
                name: p.nombre,
                price: `$${new Intl.NumberFormat('es-CO').format(p.precio)} COP`,
                priceNumber: Number(p.precio),
                category: p.categoria?.nombre || "Sin categoría",
                colors: [
                  {
                    name: "Único",
                    images: p.imagen_principal_url ? [getImageUrl(p.imagen_principal_url)] : [],
                  },
                ],
                slug: p.slug, // <-- Agregado
              };
            }
          })
        );
        setProducts(mapped);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [tokens]);

  return { products, loading, error };
}