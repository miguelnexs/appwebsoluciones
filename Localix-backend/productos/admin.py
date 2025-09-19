from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from nested_admin import NestedModelAdmin, NestedTabularInline
from productos.models import Producto, VarianteProducto, ColorProducto, ImagenProducto, CaracteristicaProducto
from categorias.models import CategoriaProducto

class ImagenProductoInline(NestedTabularInline):
    model = ImagenProducto
    extra = 1
    fields = ('imagen', 'orden', 'es_principal', 'imagen_preview')
    readonly_fields = ('imagen_preview',)
    
    def imagen_preview(self, obj):
        if obj.imagen:
            return format_html('<img src="{}" style="max-height: 80px; max-width: 80px;" />', obj.imagen.url)
        return _("Sin imagen")
    imagen_preview.short_description = _("Vista previa")

class ColorProductoInline(NestedTabularInline):
    model = ColorProducto
    extra = 1
    fields = ('nombre', 'hex_code', 'orden', 'activo', 'color_preview', 'cantidad_imagenes_display')
    readonly_fields = ('color_preview', 'cantidad_imagenes_display')
    inlines = [ImagenProductoInline]
    
    def color_preview(self, obj):
        return format_html(
            '<div style="width: 30px; height: 30px; background-color: {}; border: 1px solid #ccc; border-radius: 50%;"></div>',
            obj.hex_code
        )
    color_preview.short_description = _("Color")
    
    def cantidad_imagenes_display(self, obj):
        return f"{obj.cantidad_imagenes}/4"
    cantidad_imagenes_display.short_description = _("Imágenes")

class VarianteProductoInline(NestedTabularInline):
    model = VarianteProducto
    extra = 1
    fields = ('nombre', 'valor', 'sku', 'precio_extra', 'stock', 'orden')

@admin.register(Producto)
class ProductoAdmin(NestedModelAdmin):
    list_display = ('nombre', 'sku', 'categoria', 'precio', 'stock', 'estado', 'usuario', 'imagen_preview', 'colores_count')
    list_filter = ('estado', 'categoria', 'tipo', 'usuario')
    search_fields = ('nombre', 'sku', 'descripcion_corta')
    prepopulated_fields = {'slug': ('nombre',)}
    readonly_fields = ('stock', 'vendidos', 'imagen_preview', 'margen_ganancia_display', 'fecha_creacion', 'fecha_actualizacion', 'colores_count')
    inlines = [ColorProductoInline, VarianteProductoInline]
    
    fieldsets = (
        (_('Información Básica'), {
            'fields': ('nombre', 'slug', 'sku', 'categoria', 'tipo', 'estado', 'usuario')
        }),
        (_('Descripciones'), {
            'fields': ('descripcion_corta', 'descripcion_larga')
        }),
        (_('Precios'), {
            'fields': ('precio', 'precio_comparacion', 'costo', 'margen_ganancia_display')
        }),
        (_('Inventario'), {
            'fields': ('gestion_stock', 'stock', 'stock_minimo', 'vendidos')
        }),
        (_('Imágenes'), {
            'fields': ('imagen_principal', 'imagen_preview')
        }),
        (_('Envío y Dimensiones'), {
            'fields': ('peso', 'dimensiones')
        }),
        (_('SEO'), {
            'classes': ('collapse',),
            'fields': ('meta_titulo', 'meta_descripcion')
        }),
        (_('Fechas'), {
            'classes': ('collapse',),
            'fields': ('fecha_creacion', 'fecha_actualizacion', 'fecha_publicacion')
        }),
    )
    
    def imagen_preview(self, obj):
        if obj.imagen_principal:
            return format_html('<img src="{}" style="max-height: 100px;" />', obj.imagen_principal.url)
        return _("Sin imagen principal")
    imagen_preview.short_description = _("Vista previa")
    
    def margen_ganancia_display(self, obj):
        return f"{obj.margen_ganancia:.2f}%"
    margen_ganancia_display.short_description = _("Margen de ganancia")
    
    def colores_count(self, obj):
        return obj.colores.count()
    colores_count.short_description = _("Colores")
    
    def save_model(self, request, obj, form, change):
        """Asignar automáticamente el usuario actual al crear un producto"""
        if not change:  # Solo al crear, no al editar
            obj.usuario = request.user
        super().save_model(request, obj, form, change)
        obj.actualizar_stock_total()
    
    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        form.instance.actualizar_stock_total()

@admin.register(ColorProducto)
class ColorProductoAdmin(admin.ModelAdmin):
    list_display = ('producto', 'nombre', 'hex_code', 'color_preview', 'activo', 'cantidad_imagenes', 'fecha_creacion')
    list_filter = ('activo', 'producto', 'fecha_creacion')
    search_fields = ('nombre', 'producto__nombre')
    list_editable = ('activo',)
    readonly_fields = ('color_preview', 'cantidad_imagenes', 'fecha_creacion', 'fecha_actualizacion')
    
    fieldsets = (
        (_('Información Básica'), {
            'fields': ('producto', 'nombre', 'hex_code', 'color_preview')
        }),
        (_('Configuración'), {
            'fields': ('orden', 'activo')
        }),
        (_('Estadísticas'), {
            'fields': ('cantidad_imagenes',)
        }),
        (_('Fechas'), {
            'classes': ('collapse',),
            'fields': ('fecha_creacion', 'fecha_actualizacion')
        }),
    )
    
    def color_preview(self, obj):
        return format_html(
            '<div style="width: 50px; height: 50px; background-color: {}; border: 2px solid #ccc; border-radius: 50%;"></div>',
            obj.hex_code
        )
    color_preview.short_description = _("Color")
    
    def cantidad_imagenes(self, obj):
        return obj.cantidad_imagenes
    cantidad_imagenes.short_description = _("Imágenes")

@admin.register(CaracteristicaProducto)
class CaracteristicaProductoAdmin(admin.ModelAdmin):
    list_display = ('producto', 'nombre', 'valor', 'orden', 'activo', 'fecha_creacion')
    list_filter = ('activo', 'producto', 'fecha_creacion')
    search_fields = ('nombre', 'valor', 'producto__nombre')
    list_editable = ('orden', 'activo')
    readonly_fields = ('fecha_creacion', 'fecha_actualizacion')
    
    fieldsets = (
        (_('Información Básica'), {
            'fields': ('producto', 'nombre', 'valor')
        }),
        (_('Configuración'), {
            'fields': ('orden', 'activo')
        }),
        (_('Fechas'), {
            'classes': ('collapse',),
            'fields': ('fecha_creacion', 'fecha_actualizacion')
        }),
    )


@admin.register(ImagenProducto)
class ImagenProductoAdmin(admin.ModelAdmin):
    list_display = ('color', 'imagen', 'orden', 'es_principal', 'fecha_creacion')
    list_filter = ('es_principal', 'fecha_creacion')
    search_fields = ('color__nombre', 'color__producto__nombre')
    list_editable = ('orden', 'es_principal')
    readonly_fields = ('fecha_creacion',)
    
    fieldsets = (
        (_('Información Básica'), {
            'fields': ('color', 'imagen')
        }),
        (_('Configuración'), {
            'fields': ('orden', 'es_principal')
        }),
        (_('Fechas'), {
            'classes': ('collapse',),
            'fields': ('fecha_creacion',)
        }),
    )
    
    def imagen_preview(self, obj):
        if obj.imagen:
            return format_html('<img src="{}" style="max-height: 200px; max-width: 200px;" />', obj.imagen.url)
        return _("Sin imagen")
    imagen_preview.short_description = _("Vista previa")

@admin.register(VarianteProducto)
class VarianteProductoAdmin(admin.ModelAdmin):
    list_display = ('producto', 'nombre', 'valor', 'precio_extra', 'stock')
    list_filter = ('producto', 'nombre')
    search_fields = ('producto__nombre', 'valor', 'sku')
    list_editable = ('precio_extra', 'stock')