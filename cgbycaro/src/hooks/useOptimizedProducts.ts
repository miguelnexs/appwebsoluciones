import * as React from "react";
import { API_CONFIG } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { Product } from './useProductos';
import { getImageUrl } from '../config/api';

interface ProductsCache {
  data: Product[];
  timestamp: number;
  categories: string[];
}

interface PaginatedResponse {
  results: any[];
  count: number;
  next: string | null;
  previous: string | null;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const PRODUCTS_PER_PAGE = 20;

// Cache global para productos
let productsCache: ProductsCache | null = null;

export function useOptimizedProducts(options?: {
  category?: string;
  page?: number;
  preload?: boolean;
  enableCache?: boolean;
}) {
  const { tokens } = useAuth();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [hasMore, setHasMore] = React.useState(false);
  const [totalCount, setTotalCount] = React.useState(0);
  const [isPreloading, setIsPreloading] = React.useState(false);

  const {
    category,
    page = 1,
    preload = true,
    enableCache = true
  } = options || {};

  // Función para verificar si el cache es válido
  const isCacheValid = React.useCallback(() => {
    if (!enableCache || !productsCache) return false;
    const now = Date.now();
    return (now - productsCache.timestamp) < CACHE_DURATION;
  }, [enableCache]);

  // Función para mapear productos del backend
  const mapProduct = React.useCallback((p: any): Product => ({
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
    slug: p.slug,
  }), []);

  // Función para obtener productos con paginación
  const fetchProducts = React.useCallback(async (
    pageNum: number = 1,
    categoryFilter?: string,
    useCache: boolean = true
  ): Promise<{ products: Product[]; hasMore: boolean; total: number }> => {
    try {
      // Verificar cache si es la primera página y no hay filtro de categoría
      if (useCache && pageNum === 1 && !categoryFilter && isCacheValid()) {
        const filteredProducts = categoryFilter 
          ? productsCache!.data.filter(p => p.category === categoryFilter)
          : productsCache!.data;
        
        return {
          products: filteredProducts,
          hasMore: false,
          total: filteredProducts.length
        };
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (tokens?.access) {
        headers['Authorization'] = `Bearer ${tokens.access}`;
      }

      // Construir URL con parámetros
      const params = new URLSearchParams({
        publicos: 'true',
        page: pageNum.toString(),
        page_size: PRODUCTS_PER_PAGE.toString(),
      });

      // Si el usuario está autenticado, filtrar solo productos digitales y publicados
      if (tokens?.access) {
        params.append('tipo', 'digital');
        params.append('estado', 'publicado');
      }

      if (categoryFilter) {
        params.append('categoria__nombre', categoryFilter);
      }

      const url = `${API_CONFIG.API_URL}/productos/productos/?${params.toString()}`;
      
      const res = await fetch(url, {
        headers,
        // Timeout más corto para mejor UX
        signal: AbortSignal.timeout(8000)
      });
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      
      const data: PaginatedResponse = await res.json();
      const productosRaw = data.results || [];
      
      if (!Array.isArray(productosRaw)) {
        throw new Error("La respuesta de la API no es válida");
      }

      const mappedProducts = productosRaw.map(mapProduct);

      // Actualizar cache solo si es la primera página sin filtros
      if (pageNum === 1 && !categoryFilter && enableCache) {
        const categories = [...new Set(mappedProducts.map(p => p.category))];
        productsCache = {
          data: mappedProducts,
          timestamp: Date.now(),
          categories
        };
      }

      return {
        products: mappedProducts,
        hasMore: !!data.next,
        total: data.count || mappedProducts.length
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Tiempo de conexión agotado. Verifica tu conexión.');
      }
      throw error;
    }
  }, [tokens, mapProduct, isCacheValid, enableCache]);

  // Función para precargar la siguiente página
  const preloadNextPage = React.useCallback(async (currentPage: number) => {
    if (!preload || isPreloading) return;
    
    setIsPreloading(true);
    try {
      await fetchProducts(currentPage + 1, category, false);
    } catch (error) {
      // Silenciar errores de precarga
      console.warn('Error precargando siguiente página:', error);
    } finally {
      setIsPreloading(false);
    }
  }, [preload, isPreloading, fetchProducts, category]);

  // Efecto principal para cargar productos
  React.useEffect(() => {
    let isMounted = true;
    
    async function loadProducts() {
      if (!isMounted) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await fetchProducts(page, category);
        
        if (!isMounted) return;
        
        if (page === 1) {
          setProducts(result.products);
        } else {
          // Para páginas adicionales, agregar a los existentes
          setProducts(prev => [...prev, ...result.products]);
        }
        
        setHasMore(result.hasMore);
        setTotalCount(result.total);
        
        // Precargar siguiente página si hay más datos
        if (result.hasMore && page === 1) {
          setTimeout(() => preloadNextPage(page), 1000);
        }
      } catch (error: any) {
        if (!isMounted) return;
        setError(error.message || 'Error al cargar productos');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();
    
    return () => {
      isMounted = false;
    };
  }, [page, category, fetchProducts, preloadNextPage]);

  // Función para cargar más productos
  const loadMore = React.useCallback(async () => {
    if (loading || !hasMore) return;
    
    try {
      const result = await fetchProducts(page + 1, category, false);
      setProducts(prev => [...prev, ...result.products]);
      setHasMore(result.hasMore);
    } catch (error: any) {
      setError(error.message || 'Error al cargar más productos');
    }
  }, [loading, hasMore, page, category, fetchProducts]);

  // Función para refrescar datos
  const refresh = React.useCallback(async () => {
    // Limpiar cache
    if (enableCache) {
      productsCache = null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchProducts(1, category, false);
      setProducts(result.products);
      setHasMore(result.hasMore);
      setTotalCount(result.total);
    } catch (error: any) {
      setError(error.message || 'Error al refrescar productos');
    } finally {
      setLoading(false);
    }
  }, [category, fetchProducts, enableCache]);

  return {
    products,
    loading,
    error,
    hasMore,
    totalCount,
    isPreloading,
    loadMore,
    refresh,
    // Información del cache
    isCached: isCacheValid(),
    cacheTimestamp: productsCache?.timestamp
  };
}

// Hook para obtener categorías disponibles del cache
export function useCachedCategories() {
  return React.useMemo(() => {
    if (!productsCache) return [];
    return productsCache.categories;
  }, [productsCache?.timestamp]);
}

// Función para limpiar cache manualmente
export function clearProductsCache() {
  productsCache = null;
}

// Hook para precargar productos en background
export function useProductPreloader() {
  const { tokens } = useAuth();
  const [isPreloading, setIsPreloading] = React.useState(false);

  const preloadProducts = React.useCallback(async () => {
    if (isPreloading || productsCache) return;
    
    setIsPreloading(true);
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (tokens?.access) {
        headers['Authorization'] = `Bearer ${tokens.access}`;
      }

      // Construir URL con filtros para precarga
      let preloadUrl = `${API_CONFIG.API_URL}/productos/productos/?publicos=true&page_size=50`;
      
      // Si el usuario está autenticado, filtrar solo productos digitales y publicados
      if (tokens?.access) {
        preloadUrl += '&tipo=digital&estado=publicado';
      }
      
      const res = await fetch(
        preloadUrl,
        { headers, signal: AbortSignal.timeout(10000) }
      );
      
      if (res.ok) {
        const data = await res.json();
        const productosRaw = data.results || [];
        
        if (Array.isArray(productosRaw)) {
          const mappedProducts = productosRaw.map((p: any) => ({
            id: p.id,
            name: p.nombre,
            price: `$${new Intl.NumberFormat('es-CO').format(p.precio)} COP`,
            priceNumber: Number(p.precio),
            category: p.categoria?.nombre || "Sin categoría",
            colors: [{
              name: "Único",
              images: p.imagen_principal_url ? [getImageUrl(p.imagen_principal_url)] : [],
            }],
            slug: p.slug,
          }));
          
          const categories = [...new Set(mappedProducts.map(p => p.category))];
          productsCache = {
            data: mappedProducts,
            timestamp: Date.now(),
            categories
          };
        }
      }
    } catch (error) {
      console.warn('Error precargando productos:', error);
    } finally {
      setIsPreloading(false);
    }
  }, [tokens, isPreloading]);

  React.useEffect(() => {
    // Precargar después de un pequeño delay
    const timer = setTimeout(preloadProducts, 2000);
    return () => clearTimeout(timer);
  }, [preloadProducts]);

  return { isPreloading, preloadProducts };
}