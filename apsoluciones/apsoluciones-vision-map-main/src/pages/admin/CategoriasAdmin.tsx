import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getCategorias, getSubCategorias, Categoria, SubCategoria, ApiResponse } from '@/data/staticData';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  Search, 
  Tag, 
  Loader2,
  AlertCircle,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CategoriasAdmin: React.FC = () => {
  const { user, logout } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<SubCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const loadCategorias = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const categoriasResponse: ApiResponse<Categoria> = getCategorias();
      const subcategoriasResponse: ApiResponse<SubCategoria> = getSubCategorias();
      
      setCategorias(categoriasResponse.results);
      setSubcategorias(subcategoriasResponse.results);
    } catch (err) {
      console.error('Error loading categorias:', err);
      setError('Error al cargar las categorías.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategorias();
  }, []);

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getSubcategoriasByCategory = (categoryId: number) => {
    return subcategorias.filter(sub => sub.categoria_padre_id === categoryId);
  };

  const filteredCategorias = categorias.filter(categoria =>
    categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (categoria.descripcion && categoria.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
                <Tag className="w-6 h-6 text-green-600 mr-2" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Gestión de Categorías
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
        {/* Search and Actions */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Categorías</h2>
              <p className="text-gray-600 mt-1">
                {categorias.length > 0 ? `${categorias.length} categorías encontradas` : 'Cargando categorías...'}
              </p>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar categorías..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva
              </Button>
            </div>
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
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
              <p className="text-gray-600">Cargando categorías...</p>
            </div>
          </div>
        )}

        {/* Categories List */}
        {!loading && filteredCategorias.length === 0 && !error && (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay categorías</h3>
            <p className="text-gray-600">
              {searchTerm ? 'No se encontraron categorías con ese término de búsqueda.' : 'No hay categorías registradas en el sistema.'}
            </p>
          </div>
        )}

        {filteredCategorias.length > 0 && (
          <div className="space-y-4">
            {filteredCategorias.map((categoria) => {
              const subcategoriasDeCategoria = getSubcategoriasByCategory(categoria.id);
              const isExpanded = expandedCategories.has(categoria.id);
              
              return (
                <Card key={categoria.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-8 w-8 mr-2"
                            onClick={() => toggleCategory(categoria.id)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                            {isExpanded ? (
                              <FolderOpen className="w-4 h-4 text-green-600" />
                            ) : (
                              <Folder className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          {categoria.nombre}
                          <span className="ml-2 text-sm text-gray-500 font-normal">
                            ({subcategoriasDeCategoria.length} subcategorías)
                          </span>
                        </CardTitle>
                        <CardDescription className="mt-2 ml-12">
                          {categoria.descripcion || 'Sin descripción'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="text-sm text-gray-600 ml-12">
                      <span className="font-medium">Slug:</span> {categoria.slug}
                    </div>
                    
                    {/* Subcategorías expandibles */}
                    {isExpanded && subcategoriasDeCategoria.length > 0 && (
                      <div className="ml-12 mt-4 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Subcategorías:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {subcategoriasDeCategoria.map((subcategoria) => (
                            <div
                              key={subcategoria.id}
                              className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                            >
                              <div className="flex items-start">
                                <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center mr-2 mt-0.5">
                                  <Tag className="w-3 h-3 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <h5 className="text-sm font-medium text-gray-900">
                                    {subcategoria.nombre}
                                  </h5>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {subcategoria.descripcion || 'Sin descripción'}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Slug: {subcategoria.slug}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2 ml-12">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {categorias.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen de Categorías
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Categorías
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{categorias.length}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Categorías principales
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Subcategorías
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {subcategorias.length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Subcategorías registradas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Con Descripción
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {categorias.filter(c => c.descripcion).length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Categorías con descripción
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Estado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Activo</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Sistema funcionando
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoriasAdmin;