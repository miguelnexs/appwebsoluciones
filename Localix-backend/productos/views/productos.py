import os
import uuid
import logging
import time
from io import BytesIO
from PIL import Image
from django.db.models import Q
from django.utils import timezone
from django.core.files.base import ContentFile
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from productos.models import Producto
from productos.serializers.producto import ProductoSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    """
    ViewSet completo para gestión de productos con:
    - CRUD básico
    - Manejo avanzado de imágenes
    - Gestión de estados
    - Filtrado y búsqueda avanzada
    - Endpoints especiales
    """
    
    queryset = Producto.objects.all().prefetch_related(
        'variantes',
    ).order_by('-fecha_creacion')
    serializer_class = ProductoSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    lookup_field = 'slug'
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    # Configuración de filtros y búsqueda
    search_fields = ['nombre', 'descripcion_corta', 'descripcion_larga', 'sku']
    filterset_fields = {
        'estado': ['exact', 'in'],
        'categoria': ['exact'],
        'tipo': ['exact', 'in'],
        'gestion_stock': ['exact'],
        'precio': ['exact', 'gte', 'lte'],
        'precio_comparacion': ['exact', 'gte', 'lte', 'isnull'],
        'fecha_creacion': ['date', 'date__gte', 'date__lte'],
        'fecha_publicacion': ['date', 'date__gte', 'date__lte'],
    }
    ordering_fields = [
        'precio', 'fecha_creacion', 'nombre', 
        'stock', 'vendidos', 'fecha_publicacion'
    ]
    ordering = ['-fecha_creacion']

    def get_queryset(self):
        """
        Sobreescribe el queryset para incluir filtros personalizados y multi-tenancy
        """
        queryset = Producto.objects.filter(usuario=self.request.user).prefetch_related(
            'variantes',
        ).order_by('-fecha_creacion')
        
        # Filtro para productos públicos
        if self.request.query_params.get('publicos') == 'true':
            queryset = queryset.filter(estado='publicado')
            
        # Filtro por rango de fechas
        fecha_inicio = self.request.query_params.get('fecha_inicio')
        fecha_fin = self.request.query_params.get('fecha_fin')
        if fecha_inicio and fecha_fin:
            queryset = queryset.filter(
                fecha_creacion__date__range=[fecha_inicio, fecha_fin]
            )
            
        # Filtro por categoría padre
        categoria_padre = self.request.query_params.get('categoria_padre')
        if categoria_padre:
            queryset = queryset.filter(
                Q(categoria__parent__id=categoria_padre)
            )
            
        # Filtro por disponibilidad
        if self.request.query_params.get('disponibles') == 'true':
            queryset = queryset.filter(
                Q(estado='publicado') & 
                (Q(gestion_stock=False) | Q(stock__gt=0))
            )

        return queryset.distinct()

    @action(detail=True, methods=['POST'], parser_classes=[MultiPartParser])
    def upload_imagen_principal(self, request, slug=None):
        """
        Sube y procesa la imagen principal del producto.
        """
        logger = logging.getLogger("django")
        producto = self.get_object()
        logger.info(f"[upload_imagen_principal] Producto: {producto} (slug={slug})")
        logger.info(f"[upload_imagen_principal] Archivos recibidos: {request.FILES}")
        if 'imagen_principal' in request.FILES:
            logger.info(f"[upload_imagen_principal] Tamaño archivo: {request.FILES['imagen_principal'].size}")
        logger.info(f"[upload_imagen_principal] POST data: {request.POST}")

        if 'imagen_principal' not in request.FILES:
            logger.error("[upload_imagen_principal] No se recibió el campo 'imagen_principal'")
            return Response(
                {"error": "El campo 'imagen_principal' es requerido"},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            imagen = request.FILES['imagen_principal']
            logger.info(f"[upload_imagen_principal] Nombre de archivo: {imagen.name}, tamaño: {imagen.size}, tipo: {imagen.content_type}")
            # Validaciones de imagen
            try:
                img = Image.open(imagen)
                img.verify()
                img = Image.open(imagen)
                logger.info(f"[upload_imagen_principal] Imagen verificada. Formato: {img.format}, tamaño: {img.size}")
            except Exception as e:
                logger.error(f"[upload_imagen_principal] El archivo no es una imagen válida: {e}")
                return Response(
                    {"error": "El archivo no es una imagen válida"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Tamaño máximo 5MB
            if imagen.size > 5 * 1024 * 1024:
                logger.error("[upload_imagen_principal] La imagen supera los 5MB")
                return Response(
                    {"error": "La imagen no puede superar los 5MB"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Eliminar imagen anterior si existe
            if producto.imagen_principal:
                logger.info("[upload_imagen_principal] Eliminando imagen anterior")
                try:
                    producto.imagen_principal.delete()
                except PermissionError as e:
                    logger.warning(f"[upload_imagen_principal] No se pudo eliminar imagen anterior inmediatamente: {e}")
                    # Intentar de nuevo después de un breve retraso
                    time.sleep(0.5)
                    try:
                        producto.imagen_principal.delete()
                        logger.info("[upload_imagen_principal] Imagen anterior eliminada en segundo intento")
                    except PermissionError as e2:
                        logger.warning(f"[upload_imagen_principal] No se pudo eliminar imagen anterior: {e2}")
                        # Continuar sin eliminar la imagen anterior
                
                if hasattr(producto, 'imagen_thumbnail') and producto.imagen_thumbnail:
                    try:
                        producto.imagen_thumbnail.delete()
                    except PermissionError:
                        logger.warning("[upload_imagen_principal] No se pudo eliminar thumbnail anterior")
                        pass
            # Generar nombre único para la imagen
            ext = os.path.splitext(imagen.name)[1]
            new_filename = f"{uuid.uuid4().hex}{ext}"
            # Asignar nueva imagen
            producto.imagen_principal.save(new_filename, imagen, save=True)
            logger.info(f"[upload_imagen_principal] Imagen guardada como: {new_filename}")
            # Generar thumbnail
            self._generate_thumbnail(producto)
            logger.info("[upload_imagen_principal] Thumbnail generado")
            # Construir respuesta
            serializer = self.get_serializer(producto)
            response_data = serializer.data
            # Asegurar que la URL de la imagen esté incluida
            if producto.imagen_principal:
                response_data['imagen_principal_url'] = request.build_absolute_uri(
                    producto.imagen_principal.url
                )
            logger.info(f"[upload_imagen_principal] Respuesta exitosa: {response_data}")
            return Response(
                response_data,
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"[upload_imagen_principal] Error inesperado: {e}", exc_info=True)
            return Response(
                {"error": f"Error al procesar la imagen: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['DELETE'])
    def remove_imagen_principal(self, request, slug=None):
        """
        Elimina la imagen principal del producto
        """
        producto = self.get_object()
        
        if not producto.imagen_principal:
            return Response(
                {"error": "El producto no tiene imagen principal"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Eliminar archivos físicos
            producto.imagen_principal.delete()
            if hasattr(producto, 'imagen_thumbnail') and producto.imagen_thumbnail:
                producto.imagen_thumbnail.delete()
            
            # Actualizar modelo
            producto.imagen_principal = None
            if hasattr(producto, 'imagen_thumbnail'):
                producto.imagen_thumbnail = None
            producto.save()
            
            return Response(
                {"success": "Imagen eliminada correctamente"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": f"Error al eliminar la imagen: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



    @action(detail=True, methods=['GET'])
    def imagen_principal_info(self, request, slug=None):
        """
        Obtiene metadatos de la imagen principal
        """
        producto = self.get_object()
        
        if not producto.imagen_principal:
            return Response(
                {"detail": "El producto no tiene imagen principal"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        try:
            img = Image.open(producto.imagen_principal)
            response_data = {
                'url': request.build_absolute_uri(producto.imagen_principal.url),
                'nombre': os.path.basename(producto.imagen_principal.name),
                'tamaño': f"{round(producto.imagen_principal.size / 1024, 2)} KB",
                'dimensiones': f"{img.width}x{img.height}",
                'formato': img.format,
                'modo_color': img.mode,
                'ultima_modificacion': producto.fecha_actualizacion
            }
            
            if hasattr(producto, 'imagen_thumbnail') and producto.imagen_thumbnail:
                response_data['thumbnail_url'] = request.build_absolute_uri(
                    producto.imagen_thumbnail.url
                )
            
            return Response(response_data)
        except Exception as e:
            return Response(
                {"error": f"Error al leer la imagen: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['POST'])
    def publicar(self, request, slug=None):
        """
        Publica el producto (estado: publicado)
        """
        producto = self.get_object()
        
        if producto.estado == 'publicado':
            return Response(
                {"detail": "El producto ya está publicado"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        producto.estado = 'publicado'
        producto.fecha_publicacion = timezone.now()
        producto.save()
        
        return Response(
            self.get_serializer(producto).data,
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['POST'])
    def ocultar(self, request, slug=None):
        """
        Oculta el producto (estado: borrador)
        """
        producto = self.get_object()
        
        if producto.estado == 'borrador':
            return Response(
                {"detail": "El producto ya está oculto"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        producto.estado = 'borrador'
        producto.save()
        
        return Response(
            self.get_serializer(producto).data,
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['POST'])
    def descontinuar(self, request, slug=None):
        """
        Marca el producto como descontinuado
        """
        producto = self.get_object()
        
        if producto.estado == 'descontinuado':
            return Response(
                {"detail": "El producto ya está descontinuado"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        producto.estado = 'descontinuado'
        producto.save()
        
        return Response(
            self.get_serializer(producto).data,
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['GET'])
    def destacados(self, request):
        """
        Obtiene los 10 productos más vendidos (publicados)
        """
        productos = self.get_queryset().filter(
            estado='publicado'
        ).order_by('-vendidos')[:10]
        
        serializer = self.get_serializer(productos, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def nuevos(self, request):
        """
        Obtiene los 10 productos más recientes (publicados)
        """
        productos = self.get_queryset().filter(
            estado='publicado'
        ).order_by('-fecha_creacion')[:10]
        
        serializer = self.get_serializer(productos, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def sin_stock(self, request):
        """
        Obtiene productos publicados sin stock
        """
        productos = self.get_queryset().filter(
            Q(gestion_stock=True) & Q(stock__lte=0),
            estado='publicado'
        )
        
        serializer = self.get_serializer(productos, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def con_descuento(self, request):
        """
        Obtiene productos con descuento (precio_comparacion > precio)
        """
        productos = self.get_queryset().filter(
            Q(precio_comparacion__gt=Q(precio=models.F('precio'))),
            estado='publicado'
        ).order_by('-fecha_creacion')
        
        serializer = self.get_serializer(productos, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """
        Crea un nuevo producto con respuesta enriquecida
        """
        # Debug: Verificar autenticación al inicio
        print(f"🔍 DEBUG CREATE - Usuario: {request.user}")
        print(f"🔍 DEBUG CREATE - Autenticado: {request.user.is_authenticated}")
        print(f"🔍 DEBUG CREATE - Auth header: {request.headers.get('Authorization', 'No encontrado')}")
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Usar perform_create para asignar el usuario correctamente
            producto = self.perform_create(serializer)
            
            # Generar thumbnail si se subió imagen
            if 'imagen_principal' in request.FILES:
                self._generate_thumbnail(producto)
            
            # Construir respuesta
            response_data = self.get_serializer(producto).data
            if producto.imagen_principal:
                response_data['imagen_url'] = request.build_absolute_uri(
                    producto.imagen_principal.url
                )
            
            headers = self.get_success_headers(serializer.data)
            return Response(
                {
                    'producto': response_data,
                    'message': 'Producto creado exitosamente',
                    'next_steps': [
                        'Agregar variantes',
                        'Configurar inventario'
                    ]
                },
                status=status.HTTP_201_CREATED,
                headers=headers
            )
        except Exception as e:
            return Response(
                {"error": f"Error al crear el producto: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        """
        Actualiza un producto existente
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        try:
            producto = serializer.save()
            
            # Regenerar thumbnail si se actualizó la imagen
            if 'imagen_principal' in request.FILES:
                self._generate_thumbnail(producto)
            
            # Construir respuesta
            response_data = self.get_serializer(producto).data
            if producto.imagen_principal:
                response_data['imagen_url'] = request.build_absolute_uri(
                    producto.imagen_principal.url
                )
            
            return Response(response_data)
        except Exception as e:
            return Response(
                {"error": f"Error al actualizar el producto: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_destroy(self, instance):
        """
        Elimina un producto y sus archivos asociados
        """
        try:
            # Eliminar imagen principal si existe
            if instance.imagen_principal:
                instance.imagen_principal.delete()
                print(f"✅ Imagen principal eliminada para producto: {instance.nombre}")
            
            # Eliminar thumbnail si existe
            if hasattr(instance, 'imagen_thumbnail') and instance.imagen_thumbnail:
                instance.imagen_thumbnail.delete()
                print(f"✅ Thumbnail eliminado para producto: {instance.nombre}")
            
            # Eliminar el producto
            instance.delete()
            print(f"✅ Producto eliminado exitosamente: {instance.nombre}")
            
        except Exception as e:
            print(f"❌ Error eliminando producto {instance.nombre}: {str(e)}")
            raise e

    def _generate_thumbnail(self, producto):
        """
        Genera un thumbnail de 300x300px para la imagen principal
        """
        if not producto.imagen_principal:
            return
            
        try:
            # Abrir imagen original
            img = Image.open(producto.imagen_principal)
            
            # Convertir a RGB si es necesario
            if img.mode in ('RGBA', 'LA'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[-1])
                img = background
            
            # Redimensionar manteniendo relación de aspecto
            img.thumbnail((300, 300))
            
            # Guardar en buffer
            thumb_io = BytesIO()
            img.save(thumb_io, format='JPEG', quality=85)
            thumb_io.seek(0)
            
            # Guardar thumbnail si el modelo tiene el campo
            if hasattr(producto, 'imagen_thumbnail'):
                # Eliminar thumbnail anterior si existe
                if producto.imagen_thumbnail:
                    producto.imagen_thumbnail.delete()
                
                # Guardar nuevo thumbnail
                thumb_name = f"thumb_{uuid.uuid4().hex}.jpg"
                producto.imagen_thumbnail.save(
                    thumb_name,
                    ContentFile(thumb_io.getvalue()),
                    save=False
                )
                producto.save()
                
        except Exception as e:
            print(f"[ERROR] No se pudo generar thumbnail: {str(e)}")

    @action(detail=True, methods=['POST'])
    def forzar_actualizar_stock(self, request, slug=None):
        """
        Forzar la actualización del stock total del producto
        """
        producto = self.get_object()
        
        try:
            # Llamar al método de actualización
            producto.actualizar_stock_total()
            
            # Recargar el producto desde la base de datos
            producto.refresh_from_db()
            
            serializer = self.get_serializer(producto)
            return Response({
                'message': 'Stock actualizado correctamente',
                'producto': serializer.data
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error actualizando stock: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        """
        Crear producto y asignar usuario
        """
        # Debug: Verificar que el usuario esté autenticado
        if not self.request.user.is_authenticated:
            print(f"❌ ERROR: Usuario no autenticado en perform_create")
            print(f"❌ request.user: {self.request.user}")
            print(f"❌ request.auth: {self.request.auth}")
            raise Exception("Usuario no autenticado")
        
        print(f"✅ Usuario autenticado: {self.request.user.username} (ID: {self.request.user.id})")
        return serializer.save(usuario=self.request.user)