from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify
from django.core.validators import RegexValidator
import json

class TiendaVirtual(models.Model):
    """
    Modelo para configurar tiendas virtuales personalizadas por usuario
    """
    ESTADO_CHOICES = [
        ('activa', _('Activa')),
        ('inactiva', _('Inactiva')),
        ('mantenimiento', _('En Mantenimiento')),
        ('suspendida', _('Suspendida')),
    ]
    
    PLAN_CHOICES = [
        ('basico', _('Plan Básico')),
        ('profesional', _('Plan Profesional')),
        ('premium', _('Plan Premium')),
        ('enterprise', _('Plan Enterprise')),
    ]
    
    # Relación con usuario
    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tienda_virtual',
        verbose_name=_("Usuario propietario")
    )
    
    # Información básica de la tienda
    nombre_tienda = models.CharField(
        max_length=200,
        verbose_name=_("Nombre de la tienda"),
        help_text=_("Nombre que aparecerá en la tienda virtual")
    )
    
    slug = models.SlugField(
        max_length=220,
        unique=True,
        verbose_name=_("Slug para URL"),
        help_text=_("Identificador único para la URL de la tienda")
    )
    
    descripcion = models.TextField(
        blank=True,
        verbose_name=_("Descripción de la tienda"),
        help_text=_("Descripción que aparecerá en la página principal")
    )
    
    # Configuración visual
    logo = models.ImageField(
        upload_to='tiendas/logos/',
        blank=True,
        null=True,
        verbose_name=_("Logo de la tienda")
    )
    
    favicon = models.ImageField(
        upload_to='tiendas/favicons/',
        blank=True,
        null=True,
        verbose_name=_("Favicon")
    )
    
    imagen_banner = models.ImageField(
        upload_to='tiendas/banners/',
        blank=True,
        null=True,
        verbose_name=_("Imagen de banner principal")
    )
    
    # Configuración de colores (JSON)
    colores_tema = models.JSONField(
        default=dict,
        verbose_name=_("Colores del tema"),
        help_text=_("Configuración de colores personalizados")
    )
    
    # Información de contacto
    email_contacto = models.EmailField(
        blank=True,
        verbose_name=_("Email de contacto")
    )
    
    telefono = models.CharField(
        max_length=20,
        blank=True,
        verbose_name=_("Teléfono de contacto")
    )
    
    direccion = models.TextField(
        blank=True,
        verbose_name=_("Dirección física")
    )
    
    # Redes sociales
    facebook_url = models.URLField(
        blank=True,
        verbose_name=_("URL de Facebook")
    )
    
    instagram_url = models.URLField(
        blank=True,
        verbose_name=_("URL de Instagram")
    )
    
    twitter_url = models.URLField(
        blank=True,
        verbose_name=_("URL de Twitter")
    )
    
    whatsapp = models.CharField(
        max_length=20,
        blank=True,
        verbose_name=_("Número de WhatsApp"),
        help_text=_("Número con código de país, ej: +573147435305")
    )
    
    # Configuración de pagos
    configuracion_pagos = models.JSONField(
        default=dict,
        verbose_name=_("Configuración de pagos"),
        help_text=_("Credenciales y configuración de métodos de pago")
    )
    
    # Configuración de envíos
    configuracion_envios = models.JSONField(
        default=dict,
        verbose_name=_("Configuración de envíos"),
        help_text=_("Configuración de métodos y costos de envío")
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
    
    # Estado y plan
    estado = models.CharField(
        max_length=15,
        choices=ESTADO_CHOICES,
        default='activa',
        verbose_name=_("Estado de la tienda")
    )
    
    plan = models.CharField(
        max_length=15,
        choices=PLAN_CHOICES,
        default='basico',
        verbose_name=_("Plan de la tienda")
    )
    
    # Configuraciones adicionales
    mostrar_precios = models.BooleanField(
        default=True,
        verbose_name=_("Mostrar precios"),
        help_text=_("Si se muestran los precios en la tienda")
    )
    
    permitir_compras = models.BooleanField(
        default=True,
        verbose_name=_("Permitir compras"),
        help_text=_("Si se permite realizar compras en la tienda")
    )
    
    mostrar_stock = models.BooleanField(
        default=True,
        verbose_name=_("Mostrar stock"),
        help_text=_("Si se muestra la disponibilidad de productos")
    )
    
    # Configuración de dominio personalizado
    dominio_personalizado = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_("Dominio personalizado"),
        help_text=_("Dominio propio para la tienda (opcional)")
    )
    
    # Fechas
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Fecha de creación")
    )
    
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Última actualización")
    )
    
    fecha_ultima_actividad = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Última actividad")
    )
    
    class Meta:
        verbose_name = _("Tienda Virtual")
        verbose_name_plural = _("Tiendas Virtuales")
        ordering = ['-fecha_creacion']
        indexes = [
            models.Index(fields=['usuario']),
            models.Index(fields=['slug']),
            models.Index(fields=['estado']),
            models.Index(fields=['plan']),
        ]
    
    def __str__(self):
        return f"{self.nombre_tienda} ({self.usuario.username})"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nombre_tienda)
        
        # Asegurar que el slug sea único
        if TiendaVirtual.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
            counter = 1
            original_slug = self.slug
            while TiendaVirtual.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        
        # Configurar colores por defecto si no existen
        if not self.colores_tema:
            self.colores_tema = {
                'primario': '#3B82F6',
                'secundario': '#10B981',
                'acento': '#F59E0B',
                'fondo': '#FFFFFF',
                'texto': '#1F2937',
                'texto_secundario': '#6B7280'
            }
        
        super().save(*args, **kwargs)
    
    @property
    def url_tienda(self):
        """Retorna la URL de la tienda"""
        if self.dominio_personalizado:
            return f"https://{self.dominio_personalizado}"
        return f"https://tienda.localix.com/{self.slug}"
    
    @property
    def productos_activos(self):
        """Retorna los productos activos de la tienda"""
        from productos.models import Producto
        return Producto.objects.filter(
            usuario=self.usuario,
            estado='publicado'
        )
    
    @property
    def categorias_activas(self):
        """Retorna las categorías activas de la tienda"""
        from categorias.models import CategoriaProducto
        return CategoriaProducto.objects.filter(
            usuario=self.usuario,
            activa=True
        )
    
    @property
    def total_productos(self):
        """Retorna el total de productos de la tienda"""
        return self.productos_activos.count()
    
    @property
    def total_categorias(self):
        """Retorna el total de categorías de la tienda"""
        return self.categorias_activas.count()
    
    def get_configuracion_pagos(self):
        """Retorna la configuración de pagos parseada"""
        try:
            return self.configuracion_pagos if isinstance(self.configuracion_pagos, dict) else {}
        except:
            return {}
    
    def get_configuracion_envios(self):
        """Retorna la configuración de envíos parseada"""
        try:
            return self.configuracion_envios if isinstance(self.configuracion_envios, dict) else {}
        except:
            return {}
    
    def get_colores_tema(self):
        """Retorna los colores del tema parseados"""
        try:
            return self.colores_tema if isinstance(self.colores_tema, dict) else {}
        except:
            return {
                'primario': '#3B82F6',
                'secundario': '#10B981',
                'acento': '#F59E0B',
                'fondo': '#FFFFFF',
                'texto': '#1F2937',
                'texto_secundario': '#6B7280'
            }

class ConfiguracionTienda(models.Model):
    """
    Configuraciones adicionales para la tienda virtual
    """
    tienda = models.OneToOneField(
        TiendaVirtual,
        on_delete=models.CASCADE,
        related_name='configuracion',
        verbose_name=_("Tienda")
    )
    
    # Configuraciones de visualización
    productos_por_pagina = models.PositiveIntegerField(
        default=12,
        verbose_name=_("Productos por página")
    )
    
    mostrar_productos_relacionados = models.BooleanField(
        default=True,
        verbose_name=_("Mostrar productos relacionados")
    )
    
    mostrar_productos_recientes = models.BooleanField(
        default=True,
        verbose_name=_("Mostrar productos recientes")
    )
    
    mostrar_productos_populares = models.BooleanField(
        default=True,
        verbose_name=_("Mostrar productos populares")
    )
    
    # Configuraciones de funcionalidad
    permitir_comentarios = models.BooleanField(
        default=False,
        verbose_name=_("Permitir comentarios en productos")
    )
    
    permitir_wishlist = models.BooleanField(
        default=True,
        verbose_name=_("Permitir lista de deseos")
    )
    
    permitir_comparacion = models.BooleanField(
        default=True,
        verbose_name=_("Permitir comparación de productos")
    )
    
    # Configuraciones de notificaciones
    notificar_nuevos_pedidos = models.BooleanField(
        default=True,
        verbose_name=_("Notificar nuevos pedidos")
    )
    
    notificar_stock_bajo = models.BooleanField(
        default=True,
        verbose_name=_("Notificar stock bajo")
    )
    
    # Configuraciones de SEO
    google_analytics_id = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_("ID de Google Analytics")
    )
    
    facebook_pixel_id = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_("ID de Facebook Pixel")
    )
    
    # Configuraciones de seguridad
    captcha_habilitado = models.BooleanField(
        default=False,
        verbose_name=_("CAPTCHA habilitado")
    )
    
    ssl_forzado = models.BooleanField(
        default=True,
        verbose_name=_("Forzar SSL")
    )
    
    class Meta:
        verbose_name = _("Configuración de Tienda")
        verbose_name_plural = _("Configuraciones de Tiendas")
    
    def __str__(self):
        return f"Configuración de {self.tienda.nombre_tienda}"