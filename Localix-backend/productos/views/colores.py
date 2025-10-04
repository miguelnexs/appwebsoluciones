from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.db import transaction
from productos.models import Producto, ColorProducto, ImagenProducto
from productos.serializers.color import (
    ColorProductoSerializer,
    ColorProductoCreateSerializer,
    ColorProductoListSerializer,
    ImagenProductoSerializer
)
from rest_framework import serializers


class ColorProductoListCreateView(generics.ListCreateAPIView):
    """
    Vista para listar y crear colores de un producto
    """
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        producto_id = self.kwargs.get('producto_id')
        return ColorProducto.objects.filter(producto_id=producto_id).order_by('orden', 'nombre')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ColorProductoCreateSerializer
        return ColorProductoListSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['producto_id'] = self.kwargs.get('producto_id')
        return context
    
    def perform_create(self, serializer):
        producto_id = self.kwargs.get('producto_id')
        producto = get_object_or_404(Producto, id=producto_id)
        color = serializer.save(producto=producto)
        # ✅ Actualizar stock total del producto después de crear el color
        producto.actualizar_stock_total()


class ColorProductoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para obtener, actualizar y eliminar un color específico
    """
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = ColorProductoSerializer
    
    def get_queryset(self):
        producto_id = self.kwargs.get('producto_id')
        return ColorProducto.objects.filter(producto_id=producto_id)
    
    def perform_update(self, serializer):
        # ✅ Obtener el producto antes de actualizar
        producto = serializer.instance.producto
        color = serializer.save()
        # ✅ Actualizar stock total del producto después de actualizar el color
        producto.actualizar_stock_total()
    
    def perform_destroy(self, instance):
        # ✅ Obtener el producto antes de eliminar
        producto = instance.producto
        instance.delete()
        # ✅ Actualizar stock total del producto después de eliminar el color
        producto.actualizar_stock_total()


class ImagenProductoListCreateView(generics.ListCreateAPIView):
    """
    Vista para listar y crear imágenes de un color
    """
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = ImagenProductoSerializer
    
    def get_queryset(self):
        color_id = self.kwargs.get('color_id')
        return ImagenProducto.objects.filter(color_id=color_id).order_by('orden')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['color_id'] = self.kwargs.get('color_id')
        return context
    
    def perform_create(self, serializer):
        color_id = self.kwargs.get('color_id')
        color = get_object_or_404(ColorProducto, id=color_id)
        
        # Verificar límite de imágenes
        if color.imagenes.count() >= 4:
            raise serializers.ValidationError(
                "No se pueden agregar más de 4 imágenes por color"
            )
        
        serializer.save(color=color)


class ImagenProductoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para obtener, actualizar y eliminar una imagen específica
    """
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = ImagenProductoSerializer
    
    def get_queryset(self):
        color_id = self.kwargs.get('color_id')
        return ImagenProducto.objects.filter(color_id=color_id)


@api_view(['POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def reordenar_imagenes(request, color_id):
    """
    Reordenar imágenes de un color
    """
    try:
        color = get_object_or_404(ColorProducto, id=color_id)
        orden_data = request.data.get('orden', [])
        
        if not isinstance(orden_data, list):
            return Response(
                {'error': 'El campo orden debe ser una lista'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            for item in orden_data:
                imagen_id = item.get('id')
                nuevo_orden = item.get('orden')
                
                if imagen_id and nuevo_orden is not None:
                    ImagenProducto.objects.filter(
                        id=imagen_id, color=color
                    ).update(orden=nuevo_orden)
        
        return Response({'message': 'Imágenes reordenadas correctamente'})
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def establecer_imagen_principal(request, color_id, imagen_id):
    """
    Establecer una imagen como principal para un color
    """
    try:
        color = get_object_or_404(ColorProducto, id=color_id)
        imagen = get_object_or_404(ImagenProducto, id=imagen_id, color=color)
        
        # Desmarcar todas las imágenes principales del color
        ImagenProducto.objects.filter(color=color, es_principal=True).update(es_principal=False)
        
        # Marcar la imagen seleccionada como principal
        imagen.es_principal = True
        imagen.save()
        
        return Response({'message': 'Imagen principal establecida correctamente'})
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def colores_producto_publico(request, producto_id):
    """
    Obtener colores de un producto para la vista pública
    """
    try:
        producto = get_object_or_404(Producto, id=producto_id)
        colores = ColorProducto.objects.filter(
            producto=producto, 
            activo=True
        ).order_by('orden', 'nombre')
        
        serializer = ColorProductoListSerializer(colores, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )