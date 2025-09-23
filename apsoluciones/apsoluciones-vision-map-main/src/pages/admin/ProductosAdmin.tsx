import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getProductos, Producto, ApiResponse } from '@/data/staticData';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Search, 
  Package, 
  Filter,
  Loader2,
  AlertCircle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductosAdmin: React.FC = () => {
  const { user, logout } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadProductos = (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response: ApiResponse<Producto> = getProductos({
        page,
        search: search || undefined,
        ordering: 'nombre'
      });
      
      // Verificar que response.results existe y es un array
      if (response && response.results && Array.isArray(response.results)) {
        setProductos(response.results);
        setTotalCount(response.count || 0);
        setCurrentPage(page);
      } else {
        console.error('API response structure is invalid:', response);
        setProductos([]);
        setTotalCount(0);
        setError('La respuesta de la API no tiene el formato esperado.');
      }
    } catch (err) {
      console.error('Error loading productos:', err);
      setProductos([]); // Asegurar que productos sea siempre un array
      setTotalCount(0);
      setError('Error al cargar los productos. Verifica que el backend esté funcionando.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductos();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProductos(1, searchTerm);
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(parseFloat(price));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft size={16} className="mr-2" />
                  Volver
                </Button>
              </Link>
              <div className="flex items-center">
                <Package className="w-6 h-6 text-blue-600 mr-2" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Gestión de Productos
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.username}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Productos</h2>
              <p className="text-gray-600 mt-1">
                {totalCount > 0 ? `${totalCount} productos encontrados` : 'Cargando productos...'}
              </p>
            </div>
            
            <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
              </Button>
            </form>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && productos.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Cargando productos...</p>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!loading && productos.length === 0 && !error && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
            <p className="text-gray-600">
              {searchTerm ? 'No se encontraron productos con ese término de búsqueda.' : 'No hay productos registrados en el sistema.'}
            </p>
          </div>
        )}

        {productos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos.map((producto) => (
              <Card key={producto.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  {producto.imagen_principal && (
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-3 overflow-hidden">
                      <img
                        src={producto.imagen_principal}
                        alt={producto.nombre}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <CardTitle className="text-lg line-clamp-2">{producto.nombre}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {producto.descripcion || 'Sin descripción'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(producto.precio)}
                    </span>
                    {producto.categoria_nombre && (
                      <Badge variant="secondary">
                        {producto.categoria_nombre}
                      </Badge>
                    )}
                  </div>
                  
                  {producto.stock !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Stock:</span>
                      <span className={`font-medium ${producto.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {producto.stock} unidades
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalCount > 20 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => loadProductos(currentPage - 1, searchTerm)}
                disabled={currentPage <= 1 || loading}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Página {currentPage}
              </span>
              <Button
                variant="outline"
                onClick={() => loadProductos(currentPage + 1, searchTerm)}
                disabled={productos.length < 20 || loading}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductosAdmin;