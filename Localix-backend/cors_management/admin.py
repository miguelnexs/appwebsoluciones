from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import CORSDomain, CORSDomainAuditLog


@admin.register(CORSDomain)
class CORSDomainAdmin(admin.ModelAdmin):
    list_display = [
        'domain', 
        'status', 
        'environment',
        'created_by',
        'created_at',
        'updated_at',
        'status_display'
    ]
    list_filter = [
        'status', 
        'environment', 
        'created_at', 
        'updated_at'
    ]
    search_fields = ['domain', 'description', 'created_by__username']
    readonly_fields = ['created_at', 'updated_at', 'created_by']
    fieldsets = (
        ('Información del Dominio', {
            'fields': ('domain', 'description', 'environment')
        }),
        ('Estado', {
            'fields': ('status', 'approved_by')
        }),
        ('Configuración CORS', {
            'fields': ('allow_credentials', 'allowed_methods', 'allowed_headers'),
            'classes': ('collapse',)
        }),
        ('Metadatos', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def status_display(self, obj):
        """Muestra el estado del dominio con colores"""
        if obj.status == 'active':
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Activo</span>'
            )
        elif obj.status == 'pending':
            return format_html(
                '<span style="color: orange; font-weight: bold;">⏳ Pendiente</span>'
            )
        else:
            return format_html(
                '<span style="color: red; font-weight: bold;">✗ Inactivo</span>'
            )
    status_display.short_description = 'Estado'
    
    def save_model(self, request, obj, form, change):
        """Guarda el modelo y registra quién lo creó/modificó"""
        if not change:  # Si es un nuevo objeto
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
    
    def get_queryset(self, request):
        """Optimiza las consultas incluyendo relaciones"""
        return super().get_queryset(request).select_related(
            'created_by', 'updated_by', 'approved_by'
        )


@admin.register(CORSDomainAuditLog)
class CORSDomainAuditLogAdmin(admin.ModelAdmin):
    list_display = [
        'domain_name',
        'action',
        'user',
        'timestamp',
        'changes_summary'
    ]
    list_filter = [
        'action',
        'timestamp',
        'user'
    ]
    search_fields = [
        'domain_name',
        'user__username',
        'changes'
    ]
    readonly_fields = [
        'cors_domain',
        'domain_name',
        'action', 
        'user',
        'timestamp',
        'changes',
        'ip_address'
    ]
    
    def changes_summary(self, obj):
        """Muestra un resumen de los cambios realizados"""
        if obj.changes:
            try:
                import json
                changes = json.loads(obj.changes)
                summary = []
                for field, values in changes.items():
                    if isinstance(values, dict) and 'old' in values and 'new' in values:
                        summary.append(f"{field}: {values['old']} → {values['new']}")
                    else:
                        summary.append(f"{field}: {values}")
                return mark_safe('<br>'.join(summary[:3]))  # Mostrar máximo 3 cambios
            except:
                return obj.changes[:100] + '...' if len(obj.changes) > 100 else obj.changes
        return '-'
    changes_summary.short_description = 'Resumen de Cambios'
    
    def has_add_permission(self, request):
        """Los logs de auditoría no se pueden crear manualmente"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Los logs de auditoría no se pueden modificar"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Los logs de auditoría no se pueden eliminar"""
        return False


# Configuración adicional del admin
admin.site.site_header = "Administración CORS - Localix"
admin.site.site_title = "Admin CORS"
admin.site.index_title = "Panel de Administración CORS"