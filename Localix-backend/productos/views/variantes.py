from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from productos.models import VarianteProducto
from productos.serializers.variante import VarianteProductoSerializer

class VarianteProductoViewSet(viewsets.ModelViewSet):
    """
    Vista para gestionar variantes de productos
    """
    queryset = VarianteProducto.objects.all().select_related('producto')
    serializer_class = VarianteProductoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = [
        'producto',
        'nombre',
        'stock'
    ]
    ordering_fields = [
        'orden', 
        'nombre',
        'precio_extra',
        'stock'
    ]
    ordering = ['orden']

    def perform_create(self, serializer):
        instance = serializer.save()
        # Actualizar stock del producto si es necesario
        if instance.producto.gestion_stock:
            instance.producto.actualizar_stock_total()

    def perform_update(self, serializer):
        instance = serializer.save()
        # Actualizar stock del producto si es necesario
        if instance.producto.gestion_stock:
            instance.producto.actualizar_stock_total()

    def perform_destroy(self, instance):
        producto = instance.producto
        instance.delete()
        # Actualizar stock del producto si es necesario
        if producto.gestion_stock:
            producto.actualizar_stock_total()

    @action(detail=True, methods=['get'])
    def precio_final(self, request, pk=None):
        """
        Calcula el precio final de la variante (precio base + precio extra)
        """
        variante = self.get_object()
        return Response({
            'precio_final': variante.precio_final(),
            'precio_base': variante.producto.precio,
            'precio_extra': variante.precio_extra
        })