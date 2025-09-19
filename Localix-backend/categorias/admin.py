from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import CategoriaProducto
from productos.models import Producto

@admin.register(CategoriaProducto)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descripcion', 'activa', 'orden', 'usuario', 'mostrar_productos', 'cantidad_productos')
    list_editable = ('activa', 'orden')
    search_fields = ('nombre',)
    prepopulated_fields = {'slug': ('nombre',)}
    readonly_fields = ('mostrar_productos', 'cantidad_productos')
    fieldsets = (
        (None, {
            'fields': ('nombre', 'slug', 'descripcion', 'activa', 'orden', 'imagen', 'usuario', 'mostrar_productos', 'cantidad_productos')
        }),
    )
    
    def save_model(self, request, obj, form, change):
        """Asignar automáticamente el usuario actual al crear una categoría"""
        if not change:  # Solo al crear, no al editar
            obj.usuario = request.user
        super().save_model(request, obj, form, change)

    def imagen_preview(self, obj):
        if obj.imagen:
            return format_html('<img src="{}" style="max-height: 100px;" />', obj.imagen.url)
        return _("Sin imagen")
    imagen_preview.short_description = _("Vista previa")

    def mostrar_productos(self, obj):
        productos = Producto.objects.filter(categoria=obj)
        if not productos.exists():
            return 'Sin productos vinculados'
        return '\n'.join([f"{p.nombre} (SKU: {p.sku})" for p in productos])
    mostrar_productos.short_description = 'Productos vinculados'

    def cantidad_productos(self, obj):
        return obj.cantidad_productos
    cantidad_productos.short_description = 'Cantidad de productos'
    