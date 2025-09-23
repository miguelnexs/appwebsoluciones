import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { productService, BackendProduct } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

// Definir el tipo Product localmente
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  slug?: string;
  featured?: boolean;
  rating?: number;
}

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [backendProducts, setBackendProducts] = useState<BackendProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // Función para convertir productos del backend al formato del frontend
  const convertBackendProduct = (backendProduct: BackendProduct): Product => ({
    id: backendProduct.id.toString(),
    name: backendProduct.nombre,
    price: parseFloat(backendProduct.precio),
    image: backendProduct.imagen_principal_url || backendProduct.imagen || '/placeholder.svg',
    description: backendProduct.descripcion,
    category: backendProduct.categoria.nombre.toLowerCase().replace(/\s+/g, '-'),
    slug: backendProduct.slug || backendProduct.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    rating: 4.5,
    featured: false
  });

  // Cargar productos del backend
  useEffect(() => {
    const loadProducts = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await productService.getMyProducts();
        
        if (response.success) {
          setBackendProducts(response.data);
          const convertedProducts = response.data.map(convertBackendProduct);
          setFilteredProducts(convertedProducts);
        } else {
          toast({
            title: "Error",
            description: response.message || "Error al cargar productos",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Error de conexión al cargar productos",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [isAuthenticated]);

  // Filtrar por categoría
  useEffect(() => {
    const categoria = searchParams.get('categoria');
    if (categoria) {
      setSelectedCategory(categoria);
      if (backendProducts.length > 0) {
        const convertedProducts = backendProducts.map(convertBackendProduct);
        const filtered = convertedProducts.filter(product => 
          product.category === categoria ||
          product.category.includes(categoria.toLowerCase())
        );
        setFilteredProducts(filtered);
      }
    } else {
      setSelectedCategory('');
      if (backendProducts.length > 0) {
        setFilteredProducts(backendProducts.map(convertBackendProduct));
      }
    }
  }, [searchParams, backendProducts]);

  const handleCategoryFilter = (categoryId: string) => {
    if (categoryId === selectedCategory) {
      // Si ya está seleccionada, quitar el filtro
      setSearchParams({});
    } else {
      setSearchParams({ categoria: categoryId });
    }
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Nuestros Productos
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre nuestra selección completa de cafés artesanales y accesorios premium
          </p>
        </div>

        {/* Category Filters */}
        {isAuthenticated && (
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant={selectedCategory === '' ? 'default' : 'outline'}
                onClick={clearFilters}
                className="hover-lift"
              >
                Todos
              </Button>
              {/* Categorías dinámicas basadas en productos del backend */}
              {Array.from(new Set(backendProducts.map(p => p.categoria.nombre))).map((categoryName) => {
                const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
                return (
                  <Button
                    key={categoryId}
                    variant={selectedCategory === categoryId ? 'default' : 'outline'}
                    onClick={() => handleCategoryFilter(categoryId)}
                    className="hover-lift"
                  >
                    {categoryName}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Results Counter */}
        <div className="mb-6">
          <p className="text-muted-foreground text-center">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
            {selectedCategory && (
              <span className="ml-1">
                en {selectedCategory.replace('-', ' ')}
              </span>
            )}
          </p>
        </div>

        {/* Products Grid */}
        {!isAuthenticated ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              Debes iniciar sesión para ver tus productos.
            </p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              Cargando productos...
            </p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              {selectedCategory 
                ? 'No se encontraron productos en esta categoría.'
                : 'No tienes productos registrados aún.'
              }
            </p>
            {selectedCategory && (
              <Button onClick={clearFilters} variant="outline">
                Ver todos los productos
              </Button>
            )}
          </div>
        )}

        {/* CTA Section */}
        <section className="mt-20 text-center">
          <div className="bg-card rounded-lg p-8 shadow-card">
            <h2 className="text-2xl font-bold mb-4">¿No encuentras lo que buscas?</h2>
            <p className="text-muted-foreground mb-6">
              Contáctanos y te ayudaremos a encontrar el café perfecto para ti
            </p>
            <Button className="gradient-coffee text-white hover:opacity-90">
              Contáctanos
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Products;