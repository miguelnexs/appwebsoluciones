from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import TiendaVirtual, ConfiguracionTienda

@admin.register(TiendaVirtual)
class TiendaVirtualAdmin(admin.ModelAdmin):
    list_display = [
        'nombre_tienda', 'usuario', 'slug', 'estado', 'plan', 
        'total_productos', 'total_categorias', 'fecha_creacion', 'ver_tienda'
    ]
    list_filter = ['estado', 'plan', 'fecha_creacion', 'fecha_actualizacion']
    search_fields = ['nombre_tienda', 'usuario__username', 'usuario__email', 'slug']
    readonly_fields = [
        'slug', 'fecha_creacion', 'fecha_actualizacion', 'fecha_ultima_actividad',
        'total_productos', 'total_categorias', 'url_tienda', 'ver_logo', 'ver_banner'
    ]
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('usuario', 'nombre_tienda', 'slug', 'descripcion', 'estado', 'plan')
        }),
        ('Imágenes', {
            'fields': ('logo', 'ver_logo', 'favicon', 'imagen_banner', 'ver_banner'),
            'classes': ('collapse',)
        }),
        ('Configuración Visual', {
            'fields': ('colores_tema',),
            'classes': ('collapse',)
        }),
        ('Información de Contacto', {
            'fields': ('email_contacto', 'telefono', 'direccion'),
            'classes': ('collapse',)
        }),
        ('Redes Sociales', {
            'fields': ('facebook_url', 'instagram_url', 'twitter_url', 'whatsapp'),
            'classes': ('collapse',)
        }),
        ('Configuraciones', {
            'fields': ('mostrar_precios', 'permitir_compras', 'mostrar_stock'),
            'classes': ('collapse',)
        }),
        ('SEO', {
            'fields': ('meta_titulo', 'meta_descripcion'),
            'classes': ('collapse',)
        }),
        ('Configuraciones Avanzadas', {
            'fields': ('configuracion_pagos', 'configuracion_envios', 'dominio_personalizado'),
            'classes': ('collapse',)
        }),
        ('Información del Sistema', {
            'fields': ('fecha_creacion', 'fecha_actualizacion', 'fecha_ultima_actividad', 'url_tienda'),
            'classes': ('collapse',)
        }),
    )
    
    def ver_logo(self, obj):
        if obj.logo:
            return format_html(
                '<img src="{}" style="max-height: 100px; max-width: 200px;"/>',
                obj.logo.url
            )
        return "Sin logo"
    ver_logo.short_description = "Vista previa del logo"
    
    def ver_banner(self, obj):
        if obj.imagen_banner:
            return format_html(
                '<img src="{}" style="max-height: 100px; max-width: 200px;"/>',
                obj.imagen_banner.url
            )
        return "Sin banner"
    ver_banner.short_description = "Vista previa del banner"
    
    def ver_tienda(self, obj):
        if obj.estado == 'activa':
            return format_html(
                '<a href="{}" target="_blank" class="button">Ver Tienda</a>',
                obj.url_tienda
            )
        return "Tienda inactiva"
    ver_tienda.short_description = "Ver tienda"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('usuario')

@admin.register(ConfiguracionTienda)
class ConfiguracionTiendaAdmin(admin.ModelAdmin):
    list_display = [
        'tienda', 'productos_por_pagina', 'mostrar_productos_relacionados',
        'permitir_comentarios', 'notificar_nuevos_pedidos'
    ]
    list_filter = [
        'mostrar_productos_relacionados', 'mostrar_productos_recientes',
        'mostrar_productos_populares', 'permitir_comentarios', 'permitir_wishlist',
        'notificar_nuevos_pedidos', 'notificar_stock_bajo', 'captcha_habilitado', 'ssl_forzado'
    ]
    search_fields = ['tienda__nombre_tienda', 'tienda__usuario__username']
    
    fieldsets = (
        ('Configuración de Visualización', {
            'fields': (
                'productos_por_pagina', 'mostrar_productos_relacionados',
                'mostrar_productos_recientes', 'mostrar_productos_populares'
            )
        }),
        ('Configuración de Funcionalidad', {
            'fields': ('permitir_comentarios', 'permitir_wishlist', 'permitir_comparacion')
        }),
        ('Configuración de Notificaciones', {
            'fields': ('notificar_nuevos_pedidos', 'notificar_stock_bajo')
        }),
        ('Configuración de SEO', {
            'fields': ('google_analytics_id', 'facebook_pixel_id'),
            'classes': ('collapse',)
        }),
        ('Configuración de Seguridad', {
            'fields': ('captcha_habilitado', 'ssl_forzado'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('tienda', 'tienda__usuario')

# Personalización del admin
admin.site.site_header = "Localix - Administración de Tiendas Virtuales"
admin.site.site_title = "Localix Admin"
admin.site.index_title = "Panel de Administración"