import { useState, useEffect } from 'react';
import { HeroSection } from '@/components/HeroSection';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { productService, BackendProduct } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

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

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const { isAuthenticated } = useAuth();

  // Función para convertir productos del backend al formato del frontend
  const convertBackendProduct = (backendProduct: BackendProduct): Product => ({
    id: backendProduct.id.toString(),
    name: backendProduct.nombre,
    price: parseFloat(backendProduct.precio),
    image: backendProduct.imagen_principal_url || backendProduct.imagen || '/placeholder.svg',
    description: backendProduct.descripcion,
    category: backendProduct.categoria.nombre.toLowerCase().replace(/\s+/g, '-'),
    rating: 4.5,
    featured: true
  });

  // Cargar productos destacados del backend
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await productService.getMyProducts();
        if (response.success && response.data.length > 0) {
          // Tomar los primeros 4 productos como destacados
          const featured = response.data.slice(0, 4).map(convertBackendProduct);
          setFeaturedProducts(featured);
          
          // Extraer categorías únicas
          const uniqueCategories = Array.from(
            new Set(response.data.map(p => p.categoria.nombre))
          ).map(name => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: name
          }));
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error loading featured products:', error);
      }
    };

    loadFeaturedProducts();
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Productos Destacados
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Los favoritos de nuestros clientes, seleccionados especialmente para ti
            </p>
          </div>

          {isAuthenticated && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                {!isAuthenticated 
                  ? 'Inicia sesión para ver productos destacados'
                  : 'No hay productos disponibles'
                }
              </p>
            </div>
          )}

          <div className="text-center">
            <Button asChild size="lg" className="gradient-coffee text-white hover:opacity-90">
              <Link to="/productos">Ver Todos los Productos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 gradient-warm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Explora por Categorías
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Encuentra exactamente lo que buscas para tu ritual perfecto del café
            </p>
          </div>

          {isAuthenticated && categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/productos?categoria=${category.id}`}
                  className="group block"
                >
                  <div className="bg-card rounded-lg p-6 shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                      <div className="w-8 h-8 bg-primary/20 rounded-full"></div>
                    </div>
                    <h3 className="text-xl font-semibold text-center mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-muted-foreground text-center text-sm">
                      Productos de {category.name.toLowerCase()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                {!isAuthenticated 
                  ? 'Inicia sesión para explorar categorías'
                  : 'No hay categorías disponibles'
                }
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-coffee text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para la Experiencia Perfecta?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Únete a miles de amantes del café que ya disfrutan de nuestros productos premium
          </p>
          <Button 
            asChild 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-6 text-lg hover-lift"
          >
            <Link to="/productos">Comprar Ahora</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
