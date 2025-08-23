from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from productos.models import Producto, CaracteristicaProducto
from productos.serializers.caracteristica import (
    CaracteristicaProductoSerializer,
    CaracteristicaProductoCreateSerializer,
    CaracteristicaProductoListSerializer
)


class CaracteristicaProductoListCreateView(generics.ListCreateAPIView):
    """
    Vista para listar y crear características de un producto
    """
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        producto_id = self.kwargs.get('producto_id')
        return CaracteristicaProducto.objects.filter(producto_id=producto_id).order_by('orden', 'nombre')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CaracteristicaProductoCreateSerializer
        return CaracteristicaProductoListSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['producto_id'] = self.kwargs.get('producto_id')
        return context
    
    def perform_create(self, serializer):
        producto_id = self.kwargs.get('producto_id')
        producto = get_object_or_404(Producto, id=producto_id)
        caracteristica = serializer.save(producto=producto)


class CaracteristicaProductoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para obtener, actualizar y eliminar una característica específica
    """
    permission_classes = [AllowAny]
    serializer_class = CaracteristicaProductoSerializer
    
    def get_queryset(self):
        producto_id = self.kwargs.get('producto_id')
        return CaracteristicaProducto.objects.filter(producto_id=producto_id)
    
    def perform_update(self, serializer):
        caracteristica = serializer.save()
    
    def perform_destroy(self, instance):
        instance.delete()


@api_view(['GET'])
@permission_classes([AllowAny])
def caracteristicas_producto_publico(request, producto_id):
    """
    Obtener características de un producto para la vista pública
    """
    try:
        producto = get_object_or_404(Producto, id=producto_id)
        caracteristicas = CaracteristicaProducto.objects.filter(
            producto=producto, 
            activo=True
        ).order_by('orden', 'nombre')
        
        serializer = CaracteristicaProductoListSerializer(caracteristicas, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )