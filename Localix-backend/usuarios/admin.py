from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import Usuario, UserUsagePlan, LimitCategory, PlanTemplate, PlanTemplateLimits, UserPlanLimits, UserPlanAssignment

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


@admin.register(LimitCategory)
class LimitCategoryAdmin(admin.ModelAdmin):
    list_display = ('display_name', 'name', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'display_name', 'description')
    ordering = ('display_name',)
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'display_name', 'description', 'is_active')
        }),
        ('Información del Sistema', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at',)


class PlanTemplateLimitsInline(admin.TabularInline):
    model = PlanTemplateLimits
    extra = 1
    fields = ('category', 'limit_type', 'limit_value', 'is_unlimited')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('category')


@admin.register(PlanTemplate)
class PlanTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'is_active', 'limits_count', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('name',)
    inlines = [PlanTemplateLimitsInline]
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'description', 'is_active')
        }),
        ('Información del Sistema', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def limits_count(self, obj):
        """Muestra el número de límites configurados"""
        count = obj.limits.count()
        return format_html('<span style="font-weight: bold;">{} límites</span>', count)
    
    limits_count.short_description = 'Límites Configurados'


@admin.register(UserPlanLimits)
class UserPlanLimitsAdmin(admin.ModelAdmin):
    list_display = ('user', 'category', 'limit_display', 'usage_display', 'usage_percentage_display', 'reset_period', 'last_reset')
    list_filter = ('limit_type', 'is_unlimited', 'reset_period', 'category', 'created_at')
    search_fields = ('user__username', 'user__email', 'user__nombre_completo', 'category__display_name')
    ordering = ('user__username', 'category__display_name')
    
    fieldsets = (
        ('Usuario y Categoría', {
            'fields': ('user', 'category')
        }),
        ('Configuración del Límite', {
            'fields': ('limit_type', 'limit_value', 'is_unlimited')
        }),
        ('Uso y Reinicio', {
            'fields': ('current_usage', 'reset_period', 'last_reset')
        }),
        ('Información del Sistema', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def limit_display(self, obj):
        """Muestra el límite de forma legible"""
        if obj.is_unlimited:
            return format_html('<span style="color: green; font-weight: bold;">ILIMITADO</span>')
        elif obj.limit_type == 'boolean':
            value = obj.get_limit_as_bool()
            color = 'green' if value else 'red'
            text = 'SÍ' if value else 'NO'
            return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, text)
        else:
            return obj.limit_value
    
    limit_display.short_description = 'Límite'
    
    def usage_display(self, obj):
        """Muestra el uso actual"""
        if obj.limit_type == 'number' and not obj.is_unlimited:
            limit = obj.get_limit_as_int()
            if obj.current_usage >= limit:
                return format_html('<span style="color: red; font-weight: bold;">{}/{}</span>', obj.current_usage, limit)
            elif obj.current_usage >= limit * 0.8:
                return format_html('<span style="color: orange; font-weight: bold;">{}/{}</span>', obj.current_usage, limit)
            else:
                return format_html('<span style="color: green;">{}/{}</span>', obj.current_usage, limit)
        return '-'
    
    usage_display.short_description = 'Uso Actual'
    
    def usage_percentage_display(self, obj):
        """Muestra el porcentaje de uso con colores"""
        if obj.limit_type == 'number' and not obj.is_unlimited:
            percentage = obj.usage_percentage
            if percentage >= 100:
                return format_html('<span style="color: red; font-weight: bold;">{}%</span>', int(percentage))
            elif percentage >= 80:
                return format_html('<span style="color: orange; font-weight: bold;">{}%</span>', int(percentage))
            else:
                return format_html('<span style="color: green;">{}%</span>', int(percentage))
        return '-'
    
    usage_percentage_display.short_description = 'Porcentaje de Uso'
    
    actions = ['reset_usage', 'set_unlimited', 'check_and_reset_usage']
    
    def reset_usage(self, request, queryset):
        """Reiniciar el uso de los límites seleccionados"""
        count = 0
        for limit in queryset:
            limit.reset_usage()
            count += 1
        self.message_user(request, f'{count} límite(s) reiniciado(s).')
    
    reset_usage.short_description = "Reiniciar uso"
    
    def set_unlimited(self, request, queryset):
        """Establecer como ilimitado"""
        count = queryset.update(is_unlimited=True)
        self.message_user(request, f'{count} límite(s) establecido(s) como ilimitado.')
    
    set_unlimited.short_description = "Establecer como ilimitado"
    
    def check_and_reset_usage(self, request, queryset):
        """Verificar y reiniciar uso si es necesario"""
        count = 0
        for limit in queryset:
            if limit.should_reset_usage():
                limit.reset_usage()
                count += 1
        self.message_user(request, f'{count} límite(s) reiniciado(s) automáticamente.')
    
    check_and_reset_usage.short_description = "Verificar y reiniciar uso automáticamente"


@admin.register(UserPlanAssignment)
class UserPlanAssignmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'template', 'assigned_by', 'assigned_at', 'limits_applied')
    list_filter = ('template', 'assigned_at', 'assigned_by')
    search_fields = ('user__username', 'user__email', 'user__nombre_completo', 'template__name')
    ordering = ('-assigned_at',)
    list_per_page = 25  # Limitar resultados por página
    
    fieldsets = (
        ('Asignación', {
            'fields': ('user', 'template', 'assigned_by')
        }),
        ('Información Adicional', {
            'fields': ('notes',)
        }),
        ('Información del Sistema', {
            'fields': ('assigned_at',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('assigned_at',)
    
    def get_queryset(self, request):
        """Optimizar consultas para evitar problemas de cursor"""
        return super().get_queryset(request).select_related(
            'user', 'template', 'assigned_by'
        ).prefetch_related('template__limits')
    
    def limits_applied(self, obj):
        """Muestra si los límites han sido aplicados"""
        if obj.template:
            try:
                user_limits_count = UserPlanLimits.objects.filter(user=obj.user).count()
                template_limits_count = obj.template.limits.count()
                if user_limits_count == template_limits_count and template_limits_count > 0:
                    return format_html('<span style="color: green; font-weight: bold;">✓ APLICADOS</span>')
                else:
                    return format_html('<span style="color: orange; font-weight: bold;">⚠ PENDIENTES</span>')
            except Exception:
                return format_html('<span style="color: red; font-weight: bold;">ERROR</span>')
        return '-'
    
    limits_applied.short_description = 'Estado de Límites'
    
    actions = ['apply_template_limits']
    
    def apply_template_limits(self, request, queryset):
        """Aplicar límites de plantilla a usuarios seleccionados"""
        count = 0
        try:
            for assignment in queryset.select_related('template', 'user'):
                if assignment.template:
                    assignment.apply_template_limits()
                    count += 1
            self.message_user(request, f'Límites aplicados a {count} usuario(s).')
        except Exception as e:
            self.message_user(request, f'Error al aplicar límites: {str(e)}', level='ERROR')
    
    apply_template_limits.short_description = "Aplicar límites de plantilla"
    
    def save_model(self, request, obj, form, change):
        """Personalizar el guardado del modelo"""
        if not obj.assigned_by:
            obj.assigned_by = request.user
        super().save_model(request, obj, form, change)
