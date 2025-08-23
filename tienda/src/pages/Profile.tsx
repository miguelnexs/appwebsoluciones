import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserStats, useTiendaData, useRecommendations } from '../hooks/useUserData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  ShoppingBag, 
  DollarSign, 
  Package, 
  Heart, 
  Calendar,
  TrendingUp,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe
} from 'lucide-react';
import { getImageUrl } from '../config/api';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { data: userStats, isLoading: statsLoading } = useUserStats();
  const { data: tiendaData, isLoading: tiendaLoading } = useTiendaData();
  const { data: recommendations, isLoading: recsLoading } = useRecommendations();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Debes iniciar sesión para ver tu perfil.</p>
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header del Perfil */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="h-20 w-20">
              <AvatarImage 
                src={user.tienda?.logo ? getImageUrl(user.tienda.logo) : undefined} 
                alt={user.first_name || user.username}
              />
              <AvatarFallback className="bg-blue-600 text-white text-xl">
                {user.first_name && user.last_name 
                  ? getInitials(user.first_name, user.last_name)
                  : user.username.charAt(0).toUpperCase()
                }
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : user.username
                }
              </h1>
              <p className="text-gray-600">{user.email}</p>
              {user.tienda && (
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Package className="h-3 w-3 mr-1" />
                    {user.tienda.nombre}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Estadísticas del Usuario */}
            {statsLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-16 bg-gray-200 rounded"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : userStats ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Mis Estadísticas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
                        <ShoppingBag className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{userStats.totalPedidos}</p>
                      <p className="text-sm text-gray-600">Pedidos Realizados</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(userStats.totalGastado)}
                      </p>
                      <p className="text-sm text-gray-600">Total Gastado</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
                        <Heart className="h-6 w-6 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{userStats.productosComprados.length}</p>
                      <p className="text-sm text-gray-600">Productos Únicos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Pedidos Recientes */}
            {userStats?.pedidosRecientes && userStats.pedidosRecientes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Pedidos Recientes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userStats.pedidosRecientes.slice(0, 5).map((pedido) => (
                      <div key={pedido.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">Pedido #{pedido.id}</p>
                            <p className="text-sm text-gray-600">{formatDate(pedido.fecha)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(pedido.total)}</p>
                            <Badge 
                              variant={pedido.estado === 'entregado' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {pedido.estado}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {pedido.productos.length} producto(s)
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Categorías Preferidas */}
            {userStats?.categoriasPreferidas && userStats.categoriasPreferidas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5" />
                    <span>Mis Categorías Favoritas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userStats.categoriasPreferidas.map((categoria, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium">{categoria.categoria}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${categoria.porcentaje}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">
                            {categoria.porcentaje}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Información de la Tienda */}
            {user.tienda && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Mi Tienda</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    {user.tienda.logo && (
                      <img 
                        src={getImageUrl(user.tienda.logo)} 
                        alt={user.tienda.nombre}
                        className="w-16 h-16 mx-auto rounded-full object-cover mb-3"
                      />
                    )}
                    <h3 className="font-bold text-lg">{user.tienda.nombre}</h3>
                    {user.tienda.descripcion && (
                      <p className="text-sm text-gray-600 mt-2">{user.tienda.descripcion}</p>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2 text-sm">
                    {user.tienda.telefono && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{user.tienda.telefono}</span>
                      </div>
                    )}
                    {user.tienda.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{user.tienda.email}</span>
                      </div>
                    )}
                    {user.tienda.direccion && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{user.tienda.direccion}</span>
                      </div>
                    )}
                    {user.tienda.website && (
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <a 
                          href={user.tienda.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {user.tienda.website}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recomendaciones */}
            {!recsLoading && recommendations && recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5" />
                    <span>Recomendado para Ti</span>
                  </CardTitle>
                  <CardDescription>
                    Basado en tus compras anteriores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recommendations.slice(0, 3).map((producto: any) => (
                      <Link 
                        key={producto.id} 
                        to={`/producto/${producto.slug}`}
                        className="block hover:bg-gray-50 rounded-lg p-2 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          {producto.imagen && (
                            <img 
                              src={getImageUrl(producto.imagen)} 
                              alt={producto.nombre}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{producto.nombre}</p>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(producto.precio)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link to="/todos-productos">Ver Más Productos</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;