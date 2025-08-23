from rest_framework import serializers
from productos.models import Producto
from categorias.models import CategoriaProducto
from categorias.serializers import CategoriaSerializer
from django.utils.text import slugify
from django.utils import timezone
import os
from io import BytesIO
from PIL import Image, ImageOps
import uuid
from decimal import Decimal
from django.utils.translation import gettext_lazy as _
from django.core.files.base import ContentFile
from .color import ColorProductoSerializer

class ProductoSerializer(serializers.ModelSerializer):
    # Campos de relación (lectura)
    categoria = serializers.SerializerMethodField()
    
    # Campos de relación (escritura)
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=CategoriaProducto.objects.all(),  # type: ignore
        source='categoria',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    # Campos calculados
    margen_ganancia = serializers.DecimalField(
        max_digits=5, 
        decimal_places=2,
        read_only=True
    )
    disponible_para_venta = serializers.BooleanField(read_only=True)
    imagen_principal_url = serializers.SerializerMethodField()
    tipo_display = serializers.SerializerMethodField()
    estado_display = serializers.SerializerMethodField()
    stock_total_calculado = serializers.SerializerMethodField()
    colores = ColorProductoSerializer(many=True, read_only=True)

    class Meta:
        model = Producto
        fields = [
            'id', 'sku', 'nombre', 'slug', 'imagen_principal', 'imagen_principal_url',
            'descripcion_corta', 'descripcion_larga', 'tipo', 'tipo_display', 'estado',
            'estado_display', 'categoria', 'categoria_id', 'precio', 'precio_comparacion', 'costo',
            'gestion_stock', 'stock', 'stock_minimo', 'vendidos', 'peso', 'dimensiones',
            'meta_titulo', 'meta_descripcion', 'fecha_creacion', 'fecha_publicacion',
            'fecha_actualizacion', 'margen_ganancia', 'disponible_para_venta',
            'stock_total_calculado', 'colores',
        ]
        read_only_fields = [
            'id', 'slug', 'fecha_creacion', 'fecha_actualizacion', 
            'margen_ganancia', 'disponible_para_venta', 'imagen_principal_url',
            'tipo_display', 'estado_display'
        ]
        extra_kwargs = {
            'imagen_principal': {
                'required': False,
                'allow_null': True,
                'write_only': True
            },
            'sku': {
                'help_text': _('Código único de identificación del producto'),
                'required': True
            }
        }

    # Métodos para campos display
    def get_tipo_display(self, obj):
        return obj.get_tipo_display()

    def get_estado_display(self, obj):
        return obj.get_estado_display()

    def get_imagen_principal_url(self, obj):
        if obj.imagen_principal:
            try:
                request = self.context.get('request')
                if request is not None:
                    return request.build_absolute_uri(obj.imagen_principal.url)
                return obj.imagen_principal.url
            except Exception as e:
                print(f"Error generando URL para imagen de {obj.nombre}: {str(e)}")
                return None
        return None

    def get_stock_total_calculado(self, obj):
        """Calcula el stock total sumando variantes y colores sin modificar el stock principal"""
        try:
            # Sumar stock de variantes
            stock_variantes = sum(variante.stock for variante in obj.variantes.all())
            
            # Sumar stock de colores activos
            stock_colores = sum(color.stock for color in obj.colores.filter(activo=True))
            
            # El stock total es la suma de variantes + colores
            return stock_variantes + stock_colores
        except Exception as e:
            print(f"❌ Error calculando stock total para {obj.nombre}: {str(e)}")
            return 0

    def get_categoria(self, obj):
        if obj.categoria:
            return {
                'id': obj.categoria.id,
                'nombre': obj.categoria.nombre,
                'slug': obj.categoria.slug,
            }
        return None

    # Validaciones de campos
    def validate_sku(self, value):
        value = value.strip().upper()
        if not value:
            raise serializers.ValidationError(_("El SKU no puede estar vacío"))
            
        # Obtener el usuario del contexto de la request
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            # Filtrar por usuario para evitar conflictos entre diferentes usuarios
            queryset = Producto.objects.filter(sku__iexact=value, usuario=request.user)  # type: ignore
        else:
            queryset = Producto.objects.filter(sku__iexact=value)  # type: ignore
            
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
            
        if queryset.exists():
            raise serializers.ValidationError(_("Ya existe un producto con este SKU"))
        return value

    def validate_nombre(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError(_("El nombre no puede estar vacío"))
            
        # Obtener el usuario del contexto de la request
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            # Filtrar por usuario para evitar conflictos entre diferentes usuarios
            queryset = Producto.objects.filter(nombre__iexact=value, usuario=request.user)  # type: ignore
        else:
            queryset = Producto.objects.filter(nombre__iexact=value)  # type: ignore
            
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
            
        if queryset.exists():
            raise serializers.ValidationError(_("Ya existe un producto con este nombre"))
        return value

    def validate_imagen_principal(self, value):
        if not value:
            return value
            
        # Validaciones básicas
        max_size = 5 * 1024 * 1024  # 5MB
        if value.size > max_size:
            raise serializers.ValidationError(_("El tamaño máximo permitido es 5MB"))
        
        # Extensiones permitidas
        valid_extensions = ['.jpg', '.jpeg', '.png', '.webp']
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in valid_extensions:
            raise serializers.ValidationError(_("Formato de imagen no soportado. Use JPG, PNG o WEBP"))
        
        try:
            # Verificar que el archivo no esté vacío
            if value.size == 0:
                raise serializers.ValidationError(_("El archivo de imagen está vacío"))
            
            # Procesar la imagen
            processed_image = self._process_image(value)
            return processed_image
            
        except serializers.ValidationError:
            raise  # Re-lanzar los errores de validación
        except Exception as e:
            raise serializers.ValidationError(
                _(f"Error procesando la imagen: {str(e)}")
            )

    def validate(self, data):
        errors = {}
        
        # Validación de precios vs costo
        precio = data.get('precio', getattr(self.instance, 'precio', None))
        costo = data.get('costo', getattr(self.instance, 'costo', None))
        
        if precio is not None and costo is not None and precio < costo:
            errors['precio'] = _("El precio no puede ser menor que el costo")
        
        # Validación de gestión de stock
        gestion_stock = data.get('gestion_stock', getattr(self.instance, 'gestion_stock', False))
        stock = data.get('stock', getattr(self.instance, 'stock', None))
        
        if gestion_stock and stock is not None and stock < 0:
            errors['stock'] = _("El stock no puede ser negativo")
        
        if errors:
            raise serializers.ValidationError(errors)
            
        return data

    def create(self, validated_data):
        try:
            print(f"🔍 SERIALIZER CREATE - Datos validados: {list(validated_data.keys())}")
            
            # Extraer IDs de categorías secundarias
            # Eliminado: categorias_secundarias_ids = validated_data.pop('categorias_secundarias_ids', [])
            
            # Generar slug único
            base_slug = slugify(validated_data['nombre'])
            validated_data['slug'] = self._generate_unique_slug(base_slug)
            print(f"🔍 SERIALIZER CREATE - Slug generado: {validated_data['slug']}")
            
            # Establecer fechas
            now = timezone.now()
            validated_data['fecha_creacion'] = now
            validated_data['fecha_actualizacion'] = now
            
            if validated_data.get('estado') == 'publicado':
                validated_data['fecha_publicacion'] = now
            
            # Procesar imagen principal si existe
            if 'imagen_principal' in validated_data and validated_data['imagen_principal']:
                print(f"🔍 SERIALIZER CREATE - Procesando imagen: {validated_data['imagen_principal'].name}")
                validated_data['imagen_principal'] = self._process_image(validated_data['imagen_principal'])
            
            # Crear producto
            print(f"🔍 SERIALIZER CREATE - Creando producto con usuario desde contexto")
            producto = super().create(validated_data)
            print(f"✅ SERIALIZER CREATE - Producto creado exitosamente: {producto.id}")
            
            # Asignar categorías secundarias
            # Eliminado: if categorias_secundarias_ids:
            # Eliminado:     producto.categorias_secundarias.set(categorias_secundarias_ids)
            
            # Generar thumbnail
            try:
                self._generate_thumbnail(producto)
            except Exception as thumb_error:
                print(f"⚠️ SERIALIZER CREATE - Error generando thumbnail: {str(thumb_error)}")
                # No fallar por error de thumbnail
            
            return producto
            
        except Exception as e:
            print(f"❌ SERIALIZER CREATE - Error: {str(e)}")
            print(f"❌ SERIALIZER CREATE - Tipo de error: {type(e).__name__}")
            raise

    def update(self, instance, validated_data):
        print("=== SERIALIZER UPDATE DEBUG ===")
        print("Instance:", instance)
        print("Validated data:", validated_data)
        
        # Extraer IDs de categorías secundarias
        # Eliminado: categorias_secundarias_ids = validated_data.pop('categorias_secundarias_ids', None)
        
        print("Categorías secundarias IDs:", None) # Eliminado: categorias_secundarias_ids)
        
        # Actualizar slug si cambia el nombre
        if 'nombre' in validated_data:
            base_slug = slugify(validated_data['nombre'])
            if instance.slug != base_slug:
                validated_data['slug'] = self._generate_unique_slug(base_slug, instance.pk)
        
        # Actualizar fecha de modificación
        validated_data['fecha_actualizacion'] = timezone.now()
        
        # Actualizar fecha de publicación si se publica
        if validated_data.get('estado') == 'publicado' and instance.estado != 'publicado':
            validated_data['fecha_publicacion'] = timezone.now()
        
        # Procesar imagen principal si existe
        if 'imagen_principal' in validated_data:
            if validated_data['imagen_principal'] is None:
                # Eliminar imagen existente si se envía null
                if instance.imagen_principal:
                    instance.imagen_principal.delete()
                    if hasattr(instance, 'imagen_thumbnail') and instance.imagen_thumbnail:
                        instance.imagen_thumbnail.delete()
            elif validated_data['imagen_principal']:
                validated_data['imagen_principal'] = self._process_image(validated_data['imagen_principal'])
        
        print("Final validated data:", validated_data)
        
        # Actualizar producto
        producto = super().update(instance, validated_data)
        
        # Actualizar categorías secundarias si se proporcionaron
        # Eliminado: if categorias_secundarias_ids is not None:
        # Eliminado:     producto.categorias_secundarias.set(categorias_secundarias_ids)
        
        # Regenerar thumbnail si cambió la imagen
        if 'imagen_principal' in validated_data:
            self._generate_thumbnail(producto)
        
        print("Product updated successfully:", producto)
        return producto



    def _generate_unique_slug(self, base_slug, exclude_id=None):
        """Genera un slug único agregando números si es necesario"""
        slug = base_slug
        counter = 1
        
        # Obtener el usuario del contexto de la request
        request = self.context.get('request')
        
        while True:
            if request and hasattr(request, 'user'):
                # Filtrar por usuario para evitar conflictos entre diferentes usuarios
                queryset = Producto.objects.filter(slug=slug, usuario=request.user)  # type: ignore
            else:
                queryset = Producto.objects.filter(slug=slug)  # type: ignore
                
            if exclude_id:
                queryset = queryset.exclude(pk=exclude_id)
            
            if not queryset.exists():
                return slug
            
            slug = f"{base_slug}-{counter}"
            counter += 1
            
            # Evitar bucles infinitos
            if counter > 1000:
                slug = f"{base_slug}-{uuid.uuid4().hex[:8]}"
                break
                
        return slug

    def _process_image(self, image_file):
        """Procesa la imagen antes de guardarla con manejo robusto de errores"""
        try:
            # Asegurarse de que el archivo esté en el inicio
            if hasattr(image_file, 'seekable') and image_file.seekable():
                image_file.seek(0)
            
            # Leer la imagen directamente desde el archivo subido
            img_bytes = image_file.read()
            
            # Verificar que no esté vacío
            if not img_bytes or len(img_bytes) == 0:
                raise serializers.ValidationError(_("El archivo de imagen está vacío o no se pudo leer"))
            
            # Crear un BytesIO con los bytes leídos
            img_io = BytesIO(img_bytes)
            
            # Verificar que sea una imagen válida
            try:
                img = Image.open(img_io)
                img.verify()  # Verifica la integridad del archivo
                img_io.seek(0)  # Volver al inicio después de verify
                img = Image.open(img_io)  # Necesario volver a abrir después de verify
            except Exception as e:
                raise serializers.ValidationError(_("El archivo no es una imagen válida o está corrupto"))
            
            # Corregir orientación EXIF
            try:
                img = ImageOps.exif_transpose(img)
            except Exception:
                pass  # Si falla la corrección EXIF, continuar con la imagen original
            
            # Convertir a formato adecuado
            if img.format in ['JPEG', 'JFIF', 'WEBP']:  # type: ignore
                img = img.convert('RGB')  # type: ignore
            elif img.format == 'PNG' and img.mode == 'P':  # type: ignore
                img = img.convert('RGBA')  # type: ignore
            
            # Optimizar tamaño (máximo 2000px en el lado más largo)
            max_size = 2000
            if max(img.size) > max_size:  # type: ignore
                img.thumbnail((max_size, max_size), Image.LANCZOS)  # type: ignore
            
            # Guardar en buffer
            output = BytesIO()
            
            # Determinar formato de salida
            if img.format in ['JPEG', 'JFIF']:  # type: ignore
                img.save(output, format='JPEG', quality=85, optimize=True)  # type: ignore
                ext = '.jpg'
            elif img.format == 'PNG':  # type: ignore
                img.save(output, format='PNG', optimize=True)  # type: ignore
                ext = '.png'
            elif img.format == 'WEBP':  # type: ignore
                img.save(output, format='WEBP', quality=85)  # type: ignore
                ext = '.webp'
            else:
                # Por defecto guardar como JPEG
                img.save(output, format='JPEG', quality=85, optimize=True)  # type: ignore
                ext = '.jpg'
            
            # Crear nuevo ContentFile con nombre único
            new_name = f"producto_{uuid.uuid4().hex}{ext}"
            return ContentFile(output.getvalue(), name=new_name)
            
        except serializers.ValidationError:
            raise  # Re-lanzar errores de validación
        except Exception as e:
            raise serializers.ValidationError(
                _("Error procesando la imagen: %(error)s") % {'error': str(e)}
            )

    def _generate_thumbnail(self, producto):
        """Genera un thumbnail de 300x300px para la imagen principal"""
        if not producto.imagen_principal:
            return
            
        try:
            # Abrir imagen original
            with Image.open(producto.imagen_principal) as img:
                # Corregir orientación EXIF
                try:
                    img = ImageOps.exif_transpose(img)
                except Exception:
                    pass  # Si falla la corrección EXIF, continuar
                
                # Convertir a RGB si es necesario
                if img.mode in ('RGBA', 'LA', 'P'):  # type: ignore
                    background = Image.new('RGB', img.size, (255, 255, 255))  # type: ignore
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)  # type: ignore
                    img = background
                
                # Crear thumbnail manteniendo relación de aspecto
                img.thumbnail((300, 300), Image.LANCZOS)  # type: ignore
                
                # Crear fondo blanco para imágenes no cuadradas
                if img.size[0] != 300 or img.size[1] != 300:  # type: ignore
                    background = Image.new('RGB', (300, 300), (255, 255, 255))
                    offset = (
                        (300 - img.size[0]) // 2,  # type: ignore
                        (300 - img.size[1]) // 2  # type: ignore
                    )
                    background.paste(img, offset)  # type: ignore
                    img = background
                
                # Guardar thumbnail
                thumb_io = BytesIO()
                img.save(thumb_io, format='JPEG', quality=85)  # type: ignore
                
                # Si el modelo tiene campo para thumbnail
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
            print(f"Error al generar thumbnail: {str(e)}")