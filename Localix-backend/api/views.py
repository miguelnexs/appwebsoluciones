from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone

from .authentication import APIKeyAuthentication
from .serializers import (
    PublicCategoriaSerializer, 
    PublicProductoListSerializer, 
    PublicProductoDetailSerializer
)
from productos.models import Producto
from categorias.models import CategoriaProducto

class PublicCategoriaListView(generics.ListAPIView):
    """
    Vista pública para listar categorías de un usuario
    """
    serializer_class = PublicCategoriaSerializer
    authentication_classes = [APIKeyAuthentication]
    
    def get_queryset(self):
        user = self.request.user
        return CategoriaProducto.objects.filter(
            usuario=user,
            activa=True
        ).order_by('orden', 'nombre')

class PublicProductoListView(generics.ListAPIView):
    """
    Vista pública para listar productos de un usuario
    """
    serializer_class = PublicProductoListSerializer
    authentication_classes = [APIKeyAuthentication]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Producto.objects.filter(
            usuario=user,
            estado='publicado'
        ).select_related('categoria')
        
        # Filtros opcionales
        categoria_id = self.request.query_params.get('categoria')
        if categoria_id:
            queryset = queryset.filter(categoria_id=categoria_id)
        
        tipo = self.request.query_params.get('tipo')
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(nombre__icontains=search) |
                Q(descripcion_corta__icontains=search) |
                Q(sku__icontains=search)
            )
        
        # Ordenamiento
        ordering = self.request.query_params.get('ordering', '-fecha_creacion')
        if ordering in ['nombre', '-nombre', 'precio', '-precio', 'fecha_creacion', '-fecha_creacion']:
            queryset = queryset.order_by(ordering)
        
        return queryset

class PublicProductoDetailView(generics.RetrieveAPIView):
    """
    Vista pública para obtener detalle de un producto específico
    """
    serializer_class = PublicProductoDetailSerializer
    authentication_classes = [APIKeyAuthentication]
    lookup_field = 'slug'
    
    def get_queryset(self):
        user = self.request.user
        return Producto.objects.filter(
            usuario=user,
            estado='publicado'
        ).select_related('categoria').prefetch_related(
            'variantes', 'colores__imagenes', 'caracteristicas'
        )

@api_view(['GET'])
@authentication_classes([APIKeyAuthentication])
def public_user_info(request):
    """
    Endpoint para obtener información básica del usuario autenticado
    """
    user = request.user
    return Response({
        'username': user.username,
        'nombre_completo': user.nombre_completo,
        'email': user.email,
        'fecha_creacion': user.fecha_creacion,
        'public_access_created_at': user.public_access_created_at,
        'total_productos': Producto.objects.filter(
            usuario=user, 
            estado='publicado'
        ).count(),
        'total_categorias': CategoriaProducto.objects.filter(
            usuario=user, 
            activa=True
        ).count()
    })

@api_view(['GET'])
@authentication_classes([APIKeyAuthentication])
def public_stats(request):
    """
    Endpoint para obtener estadísticas públicas del catálogo
    """
    user = request.user
    
    productos = Producto.objects.filter(usuario=user, estado='publicado')
    categorias = CategoriaProducto.objects.filter(usuario=user, activa=True)
    
    stats = {
        'total_productos': productos.count(),
        'total_categorias': categorias.count(),
        'productos_por_tipo': {},
        'productos_por_categoria': {},
        'stock_total': sum(p.stock for p in productos if p.gestion_stock),
        'productos_sin_stock': productos.filter(stock=0, gestion_stock=True).count(),
        'productos_vendidos_total': sum(p.vendidos for p in productos),
    }
    
    # Productos por tipo
    for tipo_code, tipo_name in Producto.TIPO_CHOICES:
        count = productos.filter(tipo=tipo_code).count()
        if count > 0:
            stats['productos_por_tipo'][tipo_name] = count
    
    # Productos por categoría
    for categoria in categorias:
        count = productos.filter(categoria=categoria).count()
        if count > 0:
            stats['productos_por_categoria'][categoria.nombre] = count
    
    return Response(stats)