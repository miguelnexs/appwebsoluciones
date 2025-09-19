from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
from django.core.validators import MinValueValidator
from colorfield.fields import ColorField
from categorias.models import CategoriaProducto  # Importamos desde la nueva app

class Producto(models.Model):
    """
    Modelo principal para productos del catálogo
    """
    TIPO_CHOICES = [
        ('fisico', _('Físico')),
        ('digital', _('Digital')),
        ('servicio', _('Servicio')),
    ]

    ESTADO_CHOICES = [
        ('borrador', _('Borrador')),
        ('publicado', _('Publicado')),
        ('agotado', _('Agotado')),
        ('descontinuado', _('Descontinuado')),
    ]

    # Campo para multi-tenancy
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name=_("Usuario propietario"),
        help_text=_("Usuario que posee este producto")
    )

    # Identificación básica
    sku = models.CharField(
        max_length=50,
        verbose_name=_("SKU"),
        help_text=_("Código único de identificación del producto")
    )
    
    nombre = models.CharField(
        max_length=200,
        verbose_name=_("Nombre del producto"),
        help_text=_("Nombre descriptivo para mostrar a clientes")
    )
    
    slug = models.SlugField(
        max_length=220,
        verbose_name=_("Slug para URL")
    )
    
    # Imagen principal
    imagen_principal = models.ImageField(
        upload_to='productos/',
        blank=True,
        null=True,
        verbose_name=_("Imagen principal"),
        help_text=_("Imagen destacada del producto")
    )

    
    
    # Descripciones
    descripcion_corta = models.TextField(
        max_length=160,
        verbose_name=_("Descripción corta"),
        help_text=_("Breve descripción para listados y SEO")
    )
    
    descripcion_larga = models.TextField(
        verbose_name=_("Descripción detallada"),
        help_text=_("Descripción completa con características")
    )
    
    # Clasificación
    tipo = models.CharField(
        max_length=10,
        choices=TIPO_CHOICES,
        default='fisico',
        verbose_name=_("Tipo de producto")
    )
    
    estado = models.CharField(
        max_length=13,
        choices=ESTADO_CHOICES,
        default='borrador',
        verbose_name=_("Estado del producto")
    )
    
    categoria = models.ForeignKey(
        CategoriaProducto,  # Ahora usa el modelo de la app categorias
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='productos',
        verbose_name=_("Categoría principal")
    )
    
    # Precios (en centavos para evitar decimales)
    precio = models.IntegerField(
        validators=[MinValueValidator(0)],
        verbose_name=_("Precio de venta"),
        help_text=_("Precio actual de venta al público (en centavos)")
    )
    
    precio_comparacion = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name=_("Precio original"),
        help_text=_("Precio tachado para mostrar descuentos (en centavos, opcional)")
    )
    
    costo = models.IntegerField(
        validators=[MinValueValidator(0)],
        verbose_name=_("Costo"),
        help_text=_("Costo para cálculo de márgenes (en centavos)")
    )
    
    # Inventario
    gestion_stock = models.BooleanField(
        default=True,
        verbose_name=_("Gestionar inventario"),
        help_text=_("¿Este producto lleva control de stock?")
    )
    
    stock = models.IntegerField(
        default=0,
        verbose_name=_("Stock total"),
        help_text=_("Cantidad disponible del producto")
    )
    
    stock_minimo = models.IntegerField(
        default=5,
        verbose_name=_("Stock mínimo"),
        help_text=_("Alerta cuando el stock total llegue a esta cantidad")
    )
    
    vendidos = models.IntegerField(
        default=0,
        editable=False,
        verbose_name=_("Unidades vendidas")
    )
    
    # Envío
    peso = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name=_("Peso (gramos)"),
        help_text=_("Peso en gramos para cálculo de envío")
    )
    
    dimensiones = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_("Dimensiones"),
        help_text=_("Ancho x Alto x Profundidad en cm (opcional)")
    )
    
    # SEO
    meta_titulo = models.CharField(
        max_length=70,
        blank=True,
        verbose_name=_("Meta título"),
        help_text=_("Título para SEO (máx 70 caracteres)")
    )
    
    meta_descripcion = models.TextField(
        max_length=160,
        blank=True,
        verbose_name=_("Meta descripción"),
        help_text=_("Descripción para SEO (máx 160 caracteres)")
    )
    
    # Fechas
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Fecha de creación")
    )
    
    fecha_publicacion = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Fecha de publicación"),
        help_text=_("Cuándo será visible públicamente (opcional)")
    )
    
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Última actualización")
    )

    @property
    def margen_ganancia(self):
        """Calcula el margen de ganancia como porcentaje"""
        # Verificar que precio y costo no sean None
        if self.precio is None or self.costo is None:
            return 0
        if self.costo == 0:
            return 0
        return ((self.precio - self.costo) / self.costo) * 100

    def disponible_para_venta(self):
        """Determina si el producto está disponible para venta"""
        return (
            self.estado == 'publicado' and 
            (not self.gestion_stock or self.stock > 0)
        )

    def actualizar_stock_total(self):
        """✅ Actualiza el stock total sumando todas las variantes y colores"""
        try:
            # Verificar si el producto tiene colores configurados
            colores_activos = self.colores.filter(activo=True)
            variantes = self.variantes.all()
            
            if colores_activos.exists() or variantes.exists():
                # Si tiene colores o variantes, calcular stock total sumando
                stock_variantes = sum(variante.stock for variante in variantes)
                stock_colores = sum(color.stock for color in colores_activos)
                nuevo_stock = stock_variantes + stock_colores
                
                # Solo actualizar si el stock cambió
                if self.stock != nuevo_stock:
                    self.stock = nuevo_stock
                    self.save(update_fields=['stock'])
                    print(f"🔄 Stock actualizado para {self.nombre}:")
                    print(f"   - Stock variantes: {stock_variantes}")
                    print(f"   - Stock colores: {stock_colores}")
                    print(f"   - Stock total: {self.stock}")
                else:
                    print(f"ℹ️ Stock de {self.nombre} ya está actualizado: {self.stock}")
            else:
                # Si no tiene colores ni variantes, mantener el stock actual del producto
                print(f"ℹ️ Producto {self.nombre} no tiene colores ni variantes configurados, manteniendo stock actual: {self.stock}")
                
        except Exception as e:
            print(f"❌ Error actualizando stock para {self.nombre}: {str(e)}")
            # En caso de error, intentar una actualización básica
            try:
                stock_total = sum(color.stock for color in self.colores.filter(activo=True))
                stock_total += sum(variante.stock for variante in self.variantes.all())
                self.stock = stock_total
                self.save(update_fields=['stock'])
                print(f"✅ Stock actualizado con método de respaldo: {self.stock}")
            except Exception as e2:
                print(f"❌ Error crítico actualizando stock: {str(e2)}")

    class Meta:
        verbose_name = _("Producto")
        verbose_name_plural = _("Productos")
        ordering = ['-fecha_creacion']
        indexes = [
            models.Index(fields=['usuario', 'sku']),
            models.Index(fields=['usuario', 'nombre']),
            models.Index(fields=['usuario', 'precio']),
            models.Index(fields=['usuario', 'categoria']),
            models.Index(fields=['usuario', 'estado']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(precio__gte=models.F('costo')),
                name="precio_mayor_igual_costo"
            ),
            models.CheckConstraint(
                check=models.Q(precio_comparacion__isnull=True) | 
                models.Q(precio_comparacion__gt=models.F('precio')),
                name="precio_comparacion_mayor"
            ),
            models.UniqueConstraint(
                fields=['usuario', 'sku'],
                name='unique_producto_usuario_sku'
            ),
            models.UniqueConstraint(
                fields=['usuario', 'slug'],
                name='unique_producto_usuario_slug'
            ),
        ]

    def __str__(self):
        return f"{self.nombre} ({self.sku})"


class VarianteProducto(models.Model):
    """
    Modelo para variantes de productos (tallas, capacidades, etc.)
    """
    producto = models.ForeignKey(
        Producto,
        on_delete=models.CASCADE,
        related_name='variantes',
        verbose_name=_("Producto asociado")
    )
    
    nombre = models.CharField(
        max_length=100,
        verbose_name=_("Nombre de la variante"),
        help_text=_("Ej: Talla, Capacidad, etc.")
    )
    
    valor = models.CharField(
        max_length=100,
        verbose_name=_("Valor de la variante"),
        help_text=_("Ej: S, M, L, XL / 128GB, 256GB, etc.")
    )
    
    sku = models.CharField(
        max_length=50,
        unique=True,
        verbose_name=_("SKU específico"),
        help_text=_("Código único para esta combinación")
    )
    
    precio_extra = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name=_("Precio adicional"),
        help_text=_("Se suma al precio base del producto (en centavos)")
    )
    
    stock = models.IntegerField(
        default=0,
        verbose_name=_("Stock específico"),
        help_text=_("Cantidad disponible para esta variante")
    )
    
    # ✅ Stock reservado para esta variante (por separaciones)
    stock_reservado = models.IntegerField(
        default=0,
        verbose_name=_("Stock reservado (variante)"),
        help_text=_("Unidades reservadas pendientes de completar")
    )
    
    orden = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Orden de visualización")
    )

    class Meta:
        verbose_name = _("Variante de producto")
        verbose_name_plural = _("Variantes de productos")
        ordering = ['orden', 'id']
        unique_together = ['producto', 'nombre', 'valor']

    def precio_final(self):
        return self.producto.precio + self.precio_extra

    def __str__(self):
        return f"{self.producto.nombre} - {self.nombre}: {self.valor}"


class ColorProducto(models.Model):
    """
    Modelo para colores de productos
    """
    producto = models.ForeignKey(
        Producto,
        on_delete=models.CASCADE,
        related_name='colores',
        verbose_name=_("Producto asociado")
    )
    
    nombre = models.CharField(
        max_length=100,
        verbose_name=_("Nombre del color"),
        help_text=_("Ej: Rojo, Azul, Verde, etc.")
    )
    
    hex_code = models.CharField(
        max_length=7,
        verbose_name=_("Código hexadecimal"),
        help_text=_("Código de color en formato #RRGGBB")
    )
    
    # ✅ Nuevo campo de stock por color
    stock = models.IntegerField(
        default=0,
        verbose_name=_("Stock del color"),
        help_text=_("Cantidad disponible para este color específico")
    )
    
    # ✅ Stock reservado para este color (por separaciones)
    stock_reservado = models.IntegerField(
        default=0,
        verbose_name=_("Stock reservado (color)"),
        help_text=_("Unidades reservadas pendientes de completar")
    )
    
    orden = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Orden de visualización")
    )
    
    activo = models.BooleanField(
        default=True,
        verbose_name=_("Color activo"),
        help_text=_("Indica si el color está disponible")
    )
    
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Fecha de creación")
    )
    
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Última actualización")
    )

    class Meta:
        verbose_name = _("Color de producto")
        verbose_name_plural = _("Colores de productos")
        ordering = ['orden', 'nombre']
        unique_together = ['producto', 'nombre']
        indexes = [
            models.Index(fields=['producto']),
            models.Index(fields=['nombre']),
            models.Index(fields=['activo']),
            models.Index(fields=['stock']),  # ✅ Nuevo índice para stock
        ]

    def __str__(self):
        return f"{self.producto.nombre} - {self.nombre}"

    def save(self, *args, **kwargs):
        """✅ Sobrescribir save para actualizar stock total del producto"""
        print(f"🔄 Guardando color: {self.nombre} (stock: {self.stock})")
        
        # Guardar el color
        super().save(*args, **kwargs)
        
        # Actualizar el stock total del producto
        print(f"🔄 Llamando actualizar_stock_total para producto: {self.producto.nombre}")
        self.producto.actualizar_stock_total()

    def delete(self, *args, **kwargs):
        """✅ Sobrescribir delete para actualizar stock total del producto"""
        print(f"🗑️ Eliminando color: {self.nombre}")
        
        # Obtener referencia al producto antes de eliminar
        producto = self.producto
        
        # Eliminar el color
        super().delete(*args, **kwargs)
        
        # Actualizar el stock total del producto
        print(f"🔄 Llamando actualizar_stock_total para producto: {producto.nombre}")
        producto.actualizar_stock_total()

    @property
    def cantidad_imagenes(self):
        """Retorna la cantidad de imágenes asociadas al color"""
        return self.imagenes.count()

    def tiene_imagenes_suficientes(self):
        """Verifica si el color tiene al menos 1 imagen"""
        return self.imagenes.count() >= 1

    def puede_tener_mas_imagenes(self):
        """Verifica si el color puede tener más imágenes (máximo 4)"""
        return self.imagenes.count() < 4

    @property
    def disponible_para_venta(self):
        """✅ Verifica si el color está disponible para venta"""
        return self.activo and self.stock > 0

    def reducir_stock(self, cantidad=1):
        """✅ Reduce el stock del color y actualiza el producto"""
        if self.stock >= cantidad:
            self.stock -= cantidad
            self.save()
            return True
        return False

    def aumentar_stock(self, cantidad=1):
        """✅ Aumenta el stock del color y actualiza el producto"""
        self.stock += cantidad
        self.save()
        return True


class CaracteristicaProducto(models.Model):
    """
    Modelo para características de productos
    """
    producto = models.ForeignKey(
        Producto,
        on_delete=models.CASCADE,
        related_name='caracteristicas',
        verbose_name=_("Producto asociado")
    )
    
    nombre = models.CharField(
        max_length=100,
        verbose_name=_("Nombre de la característica"),
        help_text=_("Ej: Material, Dimensiones, Peso, etc.")
    )
    
    valor = models.TextField(
        verbose_name=_("Valor de la característica"),
        help_text=_("Ej: Algodón 100%, 30x40cm, 2.5kg, etc.")
    )
    
    orden = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Orden de visualización")
    )
    
    activo = models.BooleanField(
        default=True,
        verbose_name=_("Característica activa"),
        help_text=_("Indica si la característica está visible")
    )
    
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Fecha de creación")
    )
    
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Última actualización")
    )

    class Meta:
        verbose_name = _("Característica de producto")
        verbose_name_plural = _("Características de productos")
        ordering = ['orden', 'nombre']
        unique_together = ['producto', 'nombre']
        indexes = [
            models.Index(fields=['producto']),
            models.Index(fields=['nombre']),
            models.Index(fields=['activo']),
        ]

    def __str__(self):
        return f"{self.producto.nombre} - {self.nombre}: {self.valor}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Actualizar el producto padre si es necesario
        if hasattr(self.producto, 'actualizar_stock_total'):
            self.producto.actualizar_stock_total()


class ImagenProducto(models.Model):
    """
    Modelo para imágenes de productos asociadas a colores
    """
    color = models.ForeignKey(
        ColorProducto,
        on_delete=models.CASCADE,
        related_name='imagenes',
        verbose_name=_("Color asociado")
    )
    
    imagen = models.ImageField(
        upload_to='productos/colores/',
        verbose_name=_("Imagen"),
        help_text=_("Imagen del producto en este color")
    )
    
    orden = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Orden de visualización")
    )
    
    es_principal = models.BooleanField(
        default=False,
        verbose_name=_("Imagen principal"),
        help_text=_("Indica si es la imagen principal del color")
    )
    
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Fecha de creación")
    )

    class Meta:
        verbose_name = _("Imagen de producto")
        verbose_name_plural = _("Imágenes de productos")
        ordering = ['color', 'orden', 'id']
        indexes = [
            models.Index(fields=['color']),
            models.Index(fields=['orden']),
            models.Index(fields=['es_principal']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(orden__gte=0),
                name="orden_imagen_positivo"
            ),
        ]

    def __str__(self):
        return f"{self.color.producto.nombre} - {self.color.nombre} - Imagen {self.orden}"

    def save(self, *args, **kwargs):
        # Si esta imagen se marca como principal, desmarcar las demás
        if self.es_principal:
            ImagenProducto.objects.filter(
                color=self.color,
                es_principal=True
            ).exclude(id=self.id).update(es_principal=False)
        super().save(*args, **kwargs)

    @property
    def url_imagen(self):
        """Retorna la URL de la imagen"""
        if self.imagen:
            return self.imagen.url
        return None