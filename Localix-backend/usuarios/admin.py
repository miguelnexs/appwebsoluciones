from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import Usuario, UserUsagePlan

@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ('username', 'email', 'nombre_completo', 'rol', 'es_activo', 'ultimo_acceso', 'fecha_creacion')
    list_filter = ('rol', 'es_activo', 'is_staff', 'is_superuser', 'fecha_creacion')
    search_fields = ('username', 'email', 'nombre_completo', 'first_name', 'last_name')
    ordering = ('-fecha_creacion',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Información Personal'), {
            'fields': ('nombre_completo', 'first_name', 'last_name', 'email', 'foto_perfil')
        }),
        (_('Información de Contacto'), {
            'fields': ('telefono', 'direccion', 'fecha_nacimiento')
        }),
        (_('Permisos'), {
            'fields': ('rol', 'es_activo', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Fechas importantes'), {
            'fields': ('last_login', 'ultimo_acceso', 'fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'nombre_completo', 'password1', 'password2', 'rol'),
        }),
    )
    
    readonly_fields = ('fecha_creacion', 'fecha_actualizacion', 'ultimo_acceso')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()
    
    def has_module_permission(self, request):
        """Solo permite acceso al módulo de usuarios a superusuarios"""
        return request.user.is_superuser
    
    def has_add_permission(self, request):
        """Solo permite crear usuarios a superusuarios"""
        return request.user.is_superuser
    
    def has_change_permission(self, request, obj=None):
        """Solo permite editar usuarios a superusuarios"""
        return request.user.is_superuser
    
    def has_delete_permission(self, request, obj=None):
        """Solo permite eliminar usuarios a superusuarios"""
        return request.user.is_superuser
    
    def has_view_permission(self, request, obj=None):
        """Solo permite ver usuarios a superusuarios"""
        return request.user.is_superuser

@admin.register(UserUsagePlan)
class UserUsagePlanAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan_type', 'days_allowed', 'days_remaining_display', 'status_display', 'end_date', 'is_active')
    list_filter = ('plan_type', 'is_active', 'start_date', 'end_date')
    search_fields = ('user__username', 'user__email', 'user__nombre_completo')
    ordering = ('-created_at',)
    readonly_fields = ('start_date', 'days_remaining', 'usage_percentage', 'is_expired', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Información del Usuario', {
            'fields': ('user', 'plan_type')
        }),
        ('Configuración de Días', {
            'fields': ('days_allowed', 'end_date')
        }),
        ('Estado del Plan', {
            'fields': ('is_active', 'is_expired', 'days_remaining', 'usage_percentage')
        }),
        ('Información del Sistema', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def has_module_permission(self, request):
        """Solo permite acceso al módulo de planes de uso a superusuarios"""
        return request.user.is_superuser
    
    def has_add_permission(self, request):
        """Solo permite crear planes de uso a superusuarios"""
        return request.user.is_superuser
    
    def has_change_permission(self, request, obj=None):
        """Solo permite editar planes de uso a superusuarios"""
        return request.user.is_superuser
    
    def has_delete_permission(self, request, obj=None):
        """Solo permite eliminar planes de uso a superusuarios"""
        return request.user.is_superuser
    
    def has_view_permission(self, request, obj=None):
        """Solo permite ver planes de uso a superusuarios"""
        return request.user.is_superuser
    
    def days_remaining_display(self, obj):
        """Muestra los días restantes con colores"""
        days = obj.days_remaining
        if days == 0:
            return format_html('<span style="color: red; font-weight: bold;">EXPIRADO</span>')
        elif days <= 3:
            return format_html('<span style="color: orange; font-weight: bold;">{} días</span>', days)
        elif days <= 7:
            return format_html('<span style="color: #FFA500; font-weight: bold;">{} días</span>', days)
        else:
            return format_html('<span style="color: green;">{} días</span>', days)
    
    days_remaining_display.short_description = 'Días Restantes'
    
    def status_display(self, obj):
        """Muestra el estado del plan"""
        if not obj.is_active:
            return format_html('<span style="color: red; font-weight: bold;">INACTIVO</span>')
        elif obj.is_expired:
            return format_html('<span style="color: red; font-weight: bold;">EXPIRADO</span>')
        else:
            return format_html('<span style="color: green; font-weight: bold;">ACTIVO</span>')
    
    status_display.short_description = 'Estado'
    
    def save_model(self, request, obj, form, change):
        """Personalizar el guardado del modelo"""
        if not change:  # Si es un nuevo objeto
            # Si no se especifica fecha de inicio, usar ahora
            if not obj.start_date:
                obj.start_date = timezone.now()
        
        super().save_model(request, obj, form, change)
    
    actions = ['extend_plan_7_days', 'extend_plan_15_days', 'extend_plan_30_days', 'reset_plan', 'deactivate_plan', 'activate_plan']
    
    def extend_plan_7_days(self, request, queryset):
        """Extender plan por 7 días"""
        count = 0
        for plan in queryset:
            plan.extend_plan(7)
            count += 1
        self.message_user(request, f'{count} plan(es) extendido(s) por 7 días.')
    
    extend_plan_7_days.short_description = "Extender plan por 7 días"
    
    def extend_plan_15_days(self, request, queryset):
        """Extender plan por 15 días"""
        count = 0
        for plan in queryset:
            plan.extend_plan(15)
            count += 1
        self.message_user(request, f'{count} plan(es) extendido(s) por 15 días.')
    
    extend_plan_15_days.short_description = "Extender plan por 15 días"
    
    def extend_plan_30_days(self, request, queryset):
        """Extender plan por 30 días"""
        count = 0
        for plan in queryset:
            plan.extend_plan(30)
            count += 1
        self.message_user(request, f'{count} plan(es) extendido(s) por 30 días.')
    
    extend_plan_30_days.short_description = "Extender plan por 30 días"
    
    def reset_plan(self, request, queryset):
        """Reiniciar plan con 15 días"""
        count = 0
        for plan in queryset:
            plan.reset_plan(15)
            count += 1
        self.message_user(request, f'{count} plan(es) reiniciado(s) con 15 días.')
    
    reset_plan.short_description = "Reiniciar plan con 15 días"
    
    def deactivate_plan(self, request, queryset):
        """Desactivar plan"""
        count = queryset.update(is_active=False)
        self.message_user(request, f'{count} plan(es) desactivado(s).')
    
    deactivate_plan.short_description = "Desactivar plan"
    
    def activate_plan(self, request, queryset):
        """Activar plan"""
        count = queryset.update(is_active=True)
        self.message_user(request, f'{count} plan(es) activado(s).')
    
    activate_plan.short_description = "Activar plan"
