from rest_framework import viewsets, status, filters, serializers, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.text import slugify
from django.core.files.images import get_image_dimensions
from categorias.models import CategoriaProducto
from categorias.serializers import CategoriaSerializer
import os
import logging

logger = logging.getLogger(__name__)

class CategoriaViewSet(viewsets.ModelViewSet):
    """
    Vista completa para categorías (CRUD)
    """
    queryset = CategoriaProducto.objects.all()
    serializer_class = CategoriaSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion']
    filterset_fields = ['activa']
    ordering_fields = ['orden', 'nombre']
    ordering = ['orden', 'nombre']
    lookup_field = 'slug'
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get_queryset(self):
        """
        Filtra las categorías por usuario autenticado
        """
        if self.request.user.is_authenticated:
            return CategoriaProducto.objects.filter(usuario=self.request.user)
        return CategoriaProducto.objects.none()

    def create(self, request, *args, **kwargs):
        """Crear categoría con mejor manejo de errores"""
        try:
            logger.info(f"Creando categoría con datos: {request.data}")
            logger.info(f"Archivos recibidos: {request.FILES}")
            
            # Validar que los datos básicos estén presentes
            if not request.data.get('nombre'):
                return Response(
                    {"nombre": ["El nombre de la categoría es requerido."]},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                logger.info("Vista: Serializer válido")
                print("Vista: Serializer válido")
                try:
                    self.perform_create(serializer)
                    headers = self.get_success_headers(serializer.data)
                    return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
                except Exception as save_error:
                    logger.error(f"Error en perform_create: {str(save_error)}")
                    print(f"Vista: Error en perform_create: {str(save_error)}")
                    return Response(
                        {"error": f"Error al guardar categoría: {str(save_error)}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            else:
                logger.error(f"Errores de validación: {serializer.errors}")
                print("Vista: Errores de validación:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error al crear categoría: {str(e)}")
            print(f"Vista: Error al crear categoría: {str(e)}")
            import traceback
            print(f"Traceback completo: {traceback.format_exc()}")
            return Response(
                {"error": f"Error interno del servidor: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        """Actualizar categoría con mejor manejo de errores"""
        try:
            logger.info(f"Actualizando categoría con datos: {request.data}")
            logger.info(f"Archivos recibidos: {request.FILES}")
            
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            if serializer.is_valid():
                self.perform_update(serializer)
                return Response(serializer.data)
            else:
                logger.error(f"Errores de validación: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error al actualizar categoría: {str(e)}")
            return Response(
                {"error": f"Error interno del servidor: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



    def perform_create(self, serializer):
        """Crear categoría con validación de imagen"""
        try:
            instance = serializer.save()
            logger.info(f"Categoría creada exitosamente: {instance.nombre} (ID: {instance.id})")
            
            # Validar imagen si se proporcionó
            if 'imagen' in self.request.FILES:
                self._validate_and_save_image(instance, self.request.FILES['imagen'])
                
        except Exception as e:
            logger.error(f"Error en perform_create: {str(e)}")
            print(f"Error en perform_create: {str(e)}")
            import traceback
            print(f"Traceback perform_create: {traceback.format_exc()}")
            raise

    def perform_update(self, serializer):
        """Actualizar categoría con validación de imagen"""
        instance = serializer.save()
        
        # Validar imagen si se proporcionó
        if 'imagen' in self.request.FILES:
            self._validate_and_save_image(instance, self.request.FILES['imagen'])

    def _validate_and_save_image(self, categoria, imagen):
        """Validar y guardar imagen de categoría"""
        try:
            # Validar tipo de archivo
            allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
            if imagen.content_type not in allowed_types:
                raise serializers.ValidationError({
                    "imagen": "Tipo de archivo no permitido. Use JPEG, PNG, WEBP, GIF o SVG"
                })
            
            # Validar extensión
            valid_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
            ext = os.path.splitext(imagen.name)[1].lower()
            if ext not in valid_extensions:
                raise serializers.ValidationError({
                    "imagen": "Formato de imagen no soportado. Use JPG, PNG, WEBP, GIF o SVG"
                })
            
            # Validar tamaño (máximo 10MB para desarrollo)
            if imagen.size > 10 * 1024 * 1024:
                raise serializers.ValidationError({
                    "imagen": "La imagen es demasiado grande. Máximo 10MB"
                })
            
            # Guardar imagen
            categoria.imagen = imagen
            categoria.save()
            logger.info(f"Imagen guardada exitosamente para categoría: {categoria.nombre}")
            
        except Exception as e:
            logger.error(f"Error al procesar imagen: {str(e)}")
            raise

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def test_connection(self, request):
        """Endpoint de prueba para diagnosticar problemas"""
        try:
            # Verificar conexión a la base de datos
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            
            # Verificar que el modelo funciona
            count = CategoriaProducto.objects.count()
            
            return Response({
                "status": "ok",
                "message": "Conexión exitosa",
                "categorias_count": count,
                "database": "connected"
            })
        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e),
                "database": "error"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def test_create(self, request):
        """Endpoint de prueba para crear categoría simple"""
        try:
            # Crear una categoría de prueba sin validaciones complejas
            categoria = CategoriaProducto.objects.create(
                nombre="Test Category",
                descripcion="Categoría de prueba",
                activa=True,
                orden=999
            )
            
            return Response({
                "status": "ok",
                "message": "Categoría de prueba creada exitosamente",
                "categoria": {
                    "id": categoria.id,
                    "nombre": categoria.nombre,
                    "slug": categoria.slug
                }
            })
        except Exception as e:
            import traceback
            return Response({
                "status": "error",
                "message": str(e),
                "traceback": traceback.format_exc()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_imagen(self, request, slug=None):
        """Endpoint para subir imagen a categoría"""
        categoria = self.get_object()
        
        if 'imagen' not in request.FILES:
            return Response(
                {"error": "No se proporcionó imagen en el campo 'imagen'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            self._validate_and_save_image(categoria, request.FILES['imagen'])
            return Response(
                self.get_serializer(categoria).data,
                status=status.HTTP_200_OK
            )
        except serializers.ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": f"Error al procesar la imagen: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )