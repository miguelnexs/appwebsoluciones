from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from .models import TiendaVirtual, ConfiguracionTienda
from .serializers import (
    TiendaVirtualSerializer,
    TiendaVirtualPublicaSerializer,
    ConfiguracionTiendaSerializer,
    TiendaVirtualConProductosSerializer,
    TiendaVirtualResumenSerializer,
    CrearTiendaVirtualSerializer
)
from productos.models import Producto
from categorias.models import CategoriaProducto
from productos.serializers import ProductoSerializer
from categorias.serializers import CategoriaSerializer

class TiendaVirtualListCreateView(generics.ListCreateAPIView):
    """
    Vista para listar y crear tiendas virtuales
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CrearTiendaVirtualSerializer
        return TiendaVirtualResumenSerializer
    
    def get_queryset(self):
        # Solo mostrar la tienda del usuario autenticado
        return TiendaVirtual.objects.filter(usuario=self.request.user)
    
    def perform_create(self, serializer):
        # Verificar que el usuario no tenga ya una tienda
        if hasattr(self.request.user, 'tienda_virtual'):
            return Response(
                {'error': 'Ya tienes una tienda virtual creada.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer.save(usuario=self.request.user)

class TiendaVirtualDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para obtener, actualizar y eliminar una tienda virtual
    """
    serializer_class = TiendaVirtualSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return TiendaVirtual.objects.filter(usuario=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(fecha_ultima_actividad=timezone.now())

class TiendaVirtualPublicaView(generics.RetrieveAPIView):
    """
    Vista pública para obtener información de una tienda por slug
    """
    serializer_class = TiendaVirtualPublicaSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    
    def get_queryset(self):
        return TiendaVirtual.objects.filter(estado='activa')

class TiendaVirtualConProductosView(generics.RetrieveAPIView):
    """
    Vista pública para obtener tienda con productos y categorías
    """
    serializer_class = TiendaVirtualConProductosSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    
    def get_queryset(self):
        return TiendaVirtual.objects.filter(estado='activa')

class ConfiguracionTiendaView(generics.RetrieveUpdateAPIView):
    """
    Vista para obtener y actualizar la configuración de la tienda
    """
    serializer_class = ConfiguracionTiendaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        tienda = get_object_or_404(TiendaVirtual, usuario=self.request.user)
        configuracion, created = ConfiguracionTienda.objects.get_or_create(tienda=tienda)
        return configuracion

@api_view(['GET'])
@permission_classes([AllowAny])
def productos_tienda_publica(request, slug):
    """
    Obtener productos de una tienda pública
    """
    tienda = get_object_or_404(TiendaVirtual, slug=slug, estado='activa')
    
    # Parámetros de filtrado
    categoria_id = request.GET.get('categoria')
    busqueda = request.GET.get('busqueda', '')
    orden = request.GET.get('orden', 'nombre')
    
    # Filtrar productos
    productos = Producto.objects.filter(
        usuario=tienda.usuario,
        estado='publicado'
    )
    
    if categoria_id:
        productos = productos.filter(categoria_id=categoria_id)
    
    if busqueda:
        productos = productos.filter(
            Q(nombre__icontains=busqueda) |
            Q(descripcion__icontains=busqueda) |
            Q(sku__icontains=busqueda)
        )
    
    # Ordenar productos
    if orden == 'precio_asc':
        productos = productos.order_by('precio')
    elif orden == 'precio_desc':
        productos = productos.order_by('-precio')
    elif orden == 'fecha_desc':
        productos = productos.order_by('-fecha_creacion')
    elif orden == 'fecha_asc':
        productos = productos.order_by('fecha_creacion')
    else:
        productos = productos.order_by('nombre')
    
    # Paginación simple
    page = int(request.GET.get('page', 1))
    per_page = int(request.GET.get('per_page', 12))
    start = (page - 1) * per_page
    end = start + per_page
    
    productos_paginados = productos[start:end]
    total = productos.count()
    
    serializer = ProductoSerializer(productos_paginados, many=True, context={'request': request})
    
    return Response({
        'productos': serializer.data,
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': (total + per_page - 1) // per_page
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def categorias_tienda_publica(request, slug):
    """
    Obtener categorías de una tienda pública
    """
    tienda = get_object_or_404(TiendaVirtual, slug=slug, estado='activa')
    
    categorias = CategoriaProducto.objects.filter(
        usuario=tienda.usuario,
        activa=True
    ).order_by('orden', 'nombre')
    
    serializer = CategoriaSerializer(categorias, many=True, context={'request': request})
    
    return Response({
        'categorias': serializer.data
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def producto_detalle_tienda(request, slug, producto_slug):
    """
    Obtener detalle de un producto en una tienda pública
    """
    tienda = get_object_or_404(TiendaVirtual, slug=slug, estado='activa')
    
    producto = get_object_or_404(
        Producto,
        usuario=tienda.usuario,
        slug=producto_slug,
        estado='publicado'
    )
    
    serializer = ProductoSerializer(producto, context={'request': request})
    
    # Productos relacionados (misma categoría)
    productos_relacionados = Producto.objects.filter(
        usuario=tienda.usuario,
        categoria=producto.categoria,
        estado='publicado'
    ).exclude(id=producto.id)[:4]
    
    productos_relacionados_serializer = ProductoSerializer(
        productos_relacionados, 
        many=True, 
        context={'request': request}
    )
    
    return Response({
        'producto': serializer.data,
        'productos_relacionados': productos_relacionados_serializer.data,
        'tienda': TiendaVirtualPublicaSerializer(tienda, context={'request': request}).data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mi_tienda(request):
    """
    Obtener información de la tienda del usuario autenticado
    """
    try:
        tienda = request.user.tienda_virtual
        serializer = TiendaVirtualSerializer(tienda, context={'request': request})
        return Response(serializer.data)
    except TiendaVirtual.DoesNotExist:
        return Response(
            {'error': 'No tienes una tienda virtual creada.'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def activar_tienda(request):
    """
    Activar/desactivar la tienda del usuario
    """
    try:
        tienda = request.user.tienda_virtual
        nuevo_estado = request.data.get('estado', 'activa')
        
        if nuevo_estado not in ['activa', 'inactiva', 'mantenimiento']:
            return Response(
                {'error': 'Estado no válido.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        tienda.estado = nuevo_estado
        tienda.fecha_ultima_actividad = timezone.now()
        tienda.save()
        
        return Response({
            'message': f'Tienda {nuevo_estado} correctamente.',
            'estado': nuevo_estado
        })
    except TiendaVirtual.DoesNotExist:
        return Response(
            {'error': 'No tienes una tienda virtual creada.'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def buscar_tiendas(request):
    """
    Buscar tiendas públicas
    """
    busqueda = request.GET.get('q', '')
    
    tiendas = TiendaVirtual.objects.filter(
        estado='activa'
    )
    
    if busqueda:
        tiendas = tiendas.filter(
            Q(nombre_tienda__icontains=busqueda) |
            Q(descripcion__icontains=busqueda)
        )
    
    # Paginación
    page = int(request.GET.get('page', 1))
    per_page = int(request.GET.get('per_page', 10))
    start = (page - 1) * per_page
    end = start + per_page
    
    tiendas_paginadas = tiendas[start:end]
    total = tiendas.count()
    
    serializer = TiendaVirtualPublicaSerializer(
        tiendas_paginadas, 
        many=True, 
        context={'request': request}
    )
    
    return Response({
        'tiendas': serializer.data,
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': (total + per_page - 1) // per_page
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def estadisticas_tienda(request):
    """
    Obtener estadísticas de la tienda del usuario
    """
    try:
        tienda = request.user.tienda_virtual
        
        # Estadísticas básicas
        total_productos = tienda.total_productos
        total_categorias = tienda.total_categorias
        
        # Productos por categoría
        productos_por_categoria = {}
        for categoria in tienda.categorias_activas:
            count = Producto.objects.filter(
                usuario=tienda.usuario,
                categoria=categoria,
                estado='publicado'
            ).count()
            productos_por_categoria[categoria.nombre] = count
        
        # Productos con stock bajo (menos de 5)
        productos_stock_bajo = Producto.objects.filter(
            usuario=tienda.usuario,
            estado='publicado',
            stock__lt=5
        ).count()
        
        return Response({
            'total_productos': total_productos,
            'total_categorias': total_categorias,
            'productos_por_categoria': productos_por_categoria,
            'productos_stock_bajo': productos_stock_bajo,
            'estado_tienda': tienda.estado,
            'plan_tienda': tienda.plan,
            'fecha_creacion': tienda.fecha_creacion,
            'ultima_actividad': tienda.fecha_ultima_actividad
        })
    except TiendaVirtual.DoesNotExist:
        return Response(
            {'error': 'No tienes una tienda virtual creada.'},
            status=status.HTTP_404_NOT_FOUND
        )