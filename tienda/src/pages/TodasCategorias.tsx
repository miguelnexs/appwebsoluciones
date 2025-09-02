import { useCategorias } from "../hooks/useCategorias";
import { useProductos } from "../hooks/useProductos";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Package, TrendingUp, ArrowRight, Grid, Filter } from "lucide-react";
import { useState, useMemo } from "react";

const TodasCategorias = () => {
  const { categorias, loading, error } = useCategorias();
  const { products } = useProductos();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("nombre");

  // Calcular productos por categoría
  const categoriasConStats = useMemo(() => {
    return categorias.map(categoria => {
      const productosEnCategoria = products.filter(product => 
        product.category?.toLowerCase() === categoria.nombre?.toLowerCase()
      );
      
      return {
        ...categoria,
        totalProductos: productosEnCategoria.length,
        productosRecientes: productosEnCategoria.slice(0, 3)
      };
    });
  }, [categorias, products]);

  // Filtrar y ordenar categorías
  const categoriasFiltradas = useMemo(() => {
    let filtered = categoriasConStats.filter(categoria =>
      categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (categoria.descripcion && categoria.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    switch (sortBy) {
      case "productos":
        return filtered.sort((a, b) => b.totalProductos - a.totalProductos);
      case "nombre":
      default:
        return filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
  }, [categoriasConStats, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      {/* Header mejorado con gradiente */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
              <Grid className="w-8 h-8" />
            </div>
            <h1 className="text-5xl font-light tracking-wide mb-4">
              Todas las Categorías
            </h1>
            <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
              Explora nuestra amplia gama de productos organizados por categorías
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>{categorias.length} Categorías</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>{products.length} Productos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Controles de filtrado y búsqueda */}
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 mb-12">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-neutral-300 focus:border-neutral-500 rounded-xl"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-neutral-600" />
                <span className="text-sm font-medium text-neutral-700">Ordenar por:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-500"
              >
                <option value="nombre">Nombre</option>
                <option value="productos">Más productos</option>
              </select>
            </div>
          </div>
          
          {searchTerm && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-neutral-600">
                {categoriasFiltradas.length} resultado{categoriasFiltradas.length !== 1 ? 's' : ''} para "{searchTerm}"
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="text-neutral-500 hover:text-neutral-700"
              >
                Limpiar
              </Button>
            </div>
          )}
        </div>

        {/* Estados de carga y error */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mb-4 animate-pulse">
              <Package className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-neutral-500 text-lg">Cargando categorías...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <Package className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        )}

        {/* Grid de categorías mejorado */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {categoriasFiltradas.map((categoria) => (
              <Link key={categoria.slug} to={`/categoria/${categoria.slug}`} className="group">
                <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                  {/* Imagen de la categoría */}
                  <div className="relative h-64 overflow-hidden">
                    {categoria.imagen_url ? (
                      <img
                        src={categoria.imagen_url}
                        alt={categoria.nombre}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                        <Package className="w-16 h-16 text-neutral-400" />
                      </div>
                    )}
                    
                    {/* Overlay con gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Badge de productos */}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/90 text-neutral-800 hover:bg-white">
                        {categoria.totalProductos} producto{categoria.totalProductos !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    {/* Botón de acción en hover */}
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      <Button className="w-full bg-white/90 text-neutral-900 hover:bg-white backdrop-blur-sm">
                        <span className="flex items-center justify-center gap-2">
                          Ver Colección
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Contenido de la tarjeta */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2 group-hover:text-neutral-700 transition-colors">
                      {categoria.nombre}
                    </h3>
                    
                    {categoria.descripcion && (
                      <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                        {categoria.descripcion}
                      </p>
                    )}
                    
                    {/* Estadísticas */}
                    <div className="flex items-center justify-between text-sm text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>{categoria.totalProductos} productos</span>
                      </div>
                      
                      {categoria.totalProductos > 0 && (
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="w-4 h-4" />
                          <span>Disponible</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* Mensaje cuando no hay resultados */}
        {!loading && !error && categoriasFiltradas.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mb-4">
              <Search className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No se encontraron categorías</h3>
            <p className="text-neutral-600 mb-6">Intenta con otros términos de búsqueda</p>
            <Button onClick={() => setSearchTerm("")} variant="outline">
              Ver todas las categorías
            </Button>
          </div>
        )}
        
        {/* Botón de regreso */}
        <div className="text-center mt-16">
          <Link to="/">
            <Button size="lg" className="bg-neutral-900 hover:bg-neutral-800 text-white px-12 py-4 text-base font-medium tracking-wider rounded-xl">
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TodasCategorias;