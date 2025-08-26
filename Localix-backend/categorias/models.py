from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify

class CategoriaBase(models.Model):
    """
    Modelo base abstracto para categorías genéricas
    """
    nombre = models.CharField(
        max_length=100,
        verbose_name=_("Nombre"),
        help_text=_("Nombre de la categoría")
    )
    
    slug = models.SlugField(
        max_length=110,
        verbose_name=_("Slug"),
        help_text=_("Identificador único para URLs")
    )
    
    descripcion = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Descripción"),
        help_text=_("Información adicional sobre la categoría")
    )
    
    activa = models.BooleanField(
        default=True,
        verbose_name=_("Activa"),
        help_text=_("Indica si la categoría está disponible")
    )
    
    orden = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Orden de visualización")
    )
    
    imagen = models.ImageField(
        upload_to='categorias/',
        blank=True,
        null=True,
        verbose_name=_("Imagen representativa")
    )

    class Meta:
        abstract = True
        ordering = ['orden', 'nombre']
        indexes = [
            models.Index(fields=['nombre']),
            models.Index(fields=['slug']),
        ]

    def __str__(self):
        return self.nombre

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nombre)
        super().save(*args, **kwargs)


class CategoriaProducto(CategoriaBase):
    """
    Modelo específico para categorías de productos
    """
    # Campo para multi-tenancy
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name=_("Usuario propietario"),
        help_text=_("Usuario que posee esta categoría")
    )
    
    # Campos de fecha para auditoría
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Fecha de creación"),
        help_text=_("Fecha y hora de creación del registro")
    )
    
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Fecha de actualización"),
        help_text=_("Fecha y hora de la última actualización")
    )
    
    class Meta:
        verbose_name = _("Categoría de producto")
        verbose_name_plural = _("Categorías de productos")
        indexes = [
            models.Index(fields=['usuario', 'nombre']),
            models.Index(fields=['usuario', 'slug']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['usuario', 'slug'],
                name='unique_categoria_usuario_slug'
            ),
        ]

    @property
    def cantidad_productos(self):
        from productos.models import Producto
        return Producto.objects.filter(categoria=self).count()

    @property
    def productos_vinculados(self):
        from productos.models import Producto
        return Producto.objects.filter(categoria=self)