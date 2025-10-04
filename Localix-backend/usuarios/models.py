from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
import secrets
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

class Usuario(AbstractUser):
    ROLES = [
        ('admin', 'Administrador'),
        ('vendedor', 'Vendedor'),
        ('inventario', 'Inventario'),
        ('viewer', 'Solo Lectura'),
    ]
    
    email = models.EmailField(_('email address'), unique=True)
    nombre_completo = models.CharField(_('nombre completo'), max_length=255, blank=True)
    rol = models.CharField(_('rol'), max_length=20, choices=ROLES, default='vendedor')
    telefono = models.CharField(_('teléfono'), max_length=20, blank=True)
    direccion = models.TextField(_('dirección'), blank=True)
    fecha_nacimiento = models.DateField(_('fecha de nacimiento'), null=True, blank=True)
    foto_perfil = models.ImageField(_('foto de perfil'), upload_to='usuarios/fotos/', null=True, blank=True)
    es_activo = models.BooleanField(_('activo'), default=True)
    ultimo_acceso = models.DateTimeField(_('último acceso'), null=True, blank=True)
    fecha_creacion = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(_('fecha de actualización'), auto_now=True)
    
    # Campos para API pública
    api_key = models.CharField(
        _('API Key'), 
        max_length=64, 
        blank=True, 
        null=True,
        unique=True,
        help_text=_('Clave API para acceso público a productos y categorías')
    )
    allow_public_access = models.BooleanField(
        _('Permitir acceso público'),
        default=False,
        help_text=_('Permite que los productos y categorías sean accesibles públicamente con API key')
    )
    public_access_created_at = models.DateTimeField(
        _('Fecha de creación de acceso público'),
        null=True,
        blank=True,
        help_text=_('Fecha cuando se habilitó el acceso público')
    )
    
    # Campos requeridos para el login
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'nombre_completo']
    
    class Meta:
        verbose_name = _('usuario')
        verbose_name_plural = _('usuarios')
        db_table = 'usuarios_usuario'
    
    def __str__(self):
        return f"{self.nombre_completo} ({self.username})"
    
    def get_full_name(self):
        return self.nombre_completo or f"{self.first_name} {self.last_name}".strip()
    
    def get_short_name(self):
        return self.first_name or self.username
    
    def generate_api_key(self):
        """Genera una nueva API key para el usuario"""
        self.api_key = secrets.token_urlsafe(48)
        self.allow_public_access = True
        self.public_access_created_at = timezone.now()
        self.save()
        return self.api_key
    
    def revoke_api_access(self):
        """Revoca el acceso público del usuario"""
        self.api_key = None
        self.allow_public_access = False
        self.public_access_created_at = None
        self.save()

class UserUsagePlan(models.Model):
    PLAN_TYPES = [
        ('trial', 'Prueba Gratuita'),
        ('basic', 'Plan Básico'),
        ('premium', 'Plan Premium'),
        ('custom', 'Plan Personalizado'),
    ]
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='usage_plan')
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES, default='trial')
    days_allowed = models.IntegerField(default=15, help_text="Número de días permitidos de uso")
    start_date = models.DateTimeField(auto_now_add=True, help_text="Fecha de inicio del plan")
    end_date = models.DateTimeField(null=True, blank=True, help_text="Fecha de expiración del plan")
    is_active = models.BooleanField(default=True, help_text="Si el plan está activo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Plan de Uso de Usuario"
        verbose_name_plural = "Planes de Uso de Usuarios"
    
    def save(self, *args, **kwargs):
        # Calcular automáticamente la fecha de expiración
        if not self.end_date:
            if not self.start_date:
                self.start_date = timezone.now()
            self.end_date = self.start_date + timedelta(days=self.days_allowed)
        super().save(*args, **kwargs)
    
    @property
    def is_expired(self):
        """Verifica si el plan ha expirado"""
        if not self.end_date:
            return False
        return timezone.now() > self.end_date
    
    @property
    def days_remaining(self):
        """Calcula los días restantes"""
        if not self.end_date:
            return self.days_allowed
        if self.is_expired:
            return 0
        remaining = self.end_date - timezone.now()
        return max(0, remaining.days)
    
    @property
    def usage_percentage(self):
        """Calcula el porcentaje de uso consumido"""
        if not self.end_date or not self.start_date:
            return 0
        total_days = (self.end_date - self.start_date).days
        if total_days <= 0:
            return 0
        used_days = total_days - self.days_remaining
        return min(100, (used_days / total_days) * 100)
    
    def extend_plan(self, additional_days):
        """Extiende el plan con días adicionales"""
        self.days_allowed += additional_days
        self.end_date += timedelta(days=additional_days)
        self.save()
    
    def reset_plan(self, new_days):
        """Reinicia el plan con nuevos días"""
        self.days_allowed = new_days
        self.start_date = timezone.now()
        self.end_date = self.start_date + timedelta(days=new_days)
        self.is_active = True
        self.save()
    
    def __str__(self):
        return f"{self.user.username} - {self.plan_type} ({self.days_remaining} días restantes)"


class LimitCategory(models.Model):
    """Categorías de límites disponibles en el sistema"""
    name = models.CharField(max_length=50, unique=True, verbose_name="Nombre")
    display_name = models.CharField(max_length=100, verbose_name="Nombre para mostrar")
    description = models.TextField(blank=True, verbose_name="Descripción")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Categoría de Límite"
        verbose_name_plural = "Categorías de Límites"
        ordering = ['display_name']
    
    def __str__(self):
        return self.display_name


class PlanTemplate(models.Model):
    """Plantillas de planes predefinidas para facilitar la asignación"""
    name = models.CharField(max_length=100, unique=True, verbose_name="Nombre del Plan")
    description = models.TextField(blank=True, verbose_name="Descripción")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Plantilla de Plan"
        verbose_name_plural = "Plantillas de Planes"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class PlanTemplateLimits(models.Model):
    """Límites definidos para cada plantilla de plan"""
    LIMIT_TYPES = [
        ('number', 'Número'),
        ('boolean', 'Sí/No'),
        ('text', 'Texto'),
        ('unlimited', 'Ilimitado'),
    ]
    
    template = models.ForeignKey(PlanTemplate, on_delete=models.CASCADE, related_name='limits')
    category = models.ForeignKey(LimitCategory, on_delete=models.CASCADE)
    limit_type = models.CharField(max_length=20, choices=LIMIT_TYPES, default='number')
    limit_value = models.CharField(max_length=255, verbose_name="Valor del Límite")
    is_unlimited = models.BooleanField(default=False, verbose_name="Ilimitado")
    
    class Meta:
        verbose_name = "Límite de Plantilla"
        verbose_name_plural = "Límites de Plantillas"
        unique_together = ['template', 'category']
    
    def __str__(self):
        if self.is_unlimited:
            return f"{self.template.name} - {self.category.display_name}: Ilimitado"
        return f"{self.template.name} - {self.category.display_name}: {self.limit_value}"


class UserPlanLimits(models.Model):
    """Límites específicos asignados a cada usuario"""
    LIMIT_TYPES = [
        ('number', 'Número'),
        ('boolean', 'Sí/No'),
        ('text', 'Texto'),
        ('unlimited', 'Ilimitado'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='plan_limits')
    category = models.ForeignKey(LimitCategory, on_delete=models.CASCADE)
    limit_type = models.CharField(max_length=20, choices=LIMIT_TYPES, default='number')
    limit_value = models.CharField(max_length=255, verbose_name="Valor del Límite")
    is_unlimited = models.BooleanField(default=False, verbose_name="Ilimitado")
    current_usage = models.IntegerField(default=0, verbose_name="Uso Actual")
    reset_period = models.CharField(
        max_length=20, 
        choices=[
            ('daily', 'Diario'),
            ('weekly', 'Semanal'),
            ('monthly', 'Mensual'),
            ('yearly', 'Anual'),
            ('never', 'Nunca'),
        ],
        default='monthly',
        verbose_name="Período de Reinicio"
    )
    last_reset = models.DateTimeField(null=True, blank=True, verbose_name="Último Reinicio")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Límite de Usuario"
        verbose_name_plural = "Límites de Usuarios"
        unique_together = ['user', 'category']
    
    def __str__(self):
        if self.is_unlimited:
            return f"{self.user.username} - {self.category.display_name}: Ilimitado"
        return f"{self.user.username} - {self.category.display_name}: {self.current_usage}/{self.limit_value}"
    
    def get_limit_as_int(self):
        """Convierte el límite a entero si es posible"""
        if self.is_unlimited:
            return float('inf')
        try:
            return int(self.limit_value)
        except (ValueError, TypeError):
            return 0
    
    def get_limit_as_bool(self):
        """Convierte el límite a booleano"""
        if self.limit_type == 'boolean':
            return self.limit_value.lower() in ['true', '1', 'yes', 'sí', 'si']
        return False
    
    def is_limit_exceeded(self):
        """Verifica si el límite ha sido excedido"""
        if self.is_unlimited:
            return False
        if self.limit_type == 'number':
            return self.current_usage >= self.get_limit_as_int()
        elif self.limit_type == 'boolean':
            return not self.get_limit_as_bool()
        return False
    
    def increment_usage(self, amount=1):
        """Incrementa el uso actual"""
        if not self.is_unlimited and self.limit_type == 'number':
            self.current_usage += amount
            self.save()
    
    def reset_usage(self):
        """Reinicia el contador de uso"""
        self.current_usage = 0
        self.last_reset = timezone.now()
        self.save()
    
    def should_reset_usage(self):
        """Verifica si el uso debe reiniciarse según el período"""
        if not self.last_reset or self.reset_period == 'never':
            return False
        
        now = timezone.now()
        if self.reset_period == 'daily':
            return (now - self.last_reset).days >= 1
        elif self.reset_period == 'weekly':
            return (now - self.last_reset).days >= 7
        elif self.reset_period == 'monthly':
            return (now - self.last_reset).days >= 30
        elif self.reset_period == 'yearly':
            return (now - self.last_reset).days >= 365
        
        return False
    
    def check_and_reset_if_needed(self):
        """Verifica y reinicia el uso si es necesario"""
        if self.should_reset_usage():
            self.reset_usage()
    
    @property
    def usage_percentage(self):
        """Calcula el porcentaje de uso"""
        if self.is_unlimited or self.limit_type != 'number':
            return 0
        limit = self.get_limit_as_int()
        if limit <= 0:
            return 0
        return min(100, (self.current_usage / limit) * 100)


class UserPlanAssignment(models.Model):
    """Asignación de plantillas de plan a usuarios"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='plan_assignment')
    template = models.ForeignKey(PlanTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    assigned_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_plans')
    assigned_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, verbose_name="Notas")
    
    class Meta:
        verbose_name = "Asignación de Plan"
        verbose_name_plural = "Asignaciones de Planes"
    
    def __str__(self):
        template_name = self.template.name if self.template else "Sin plantilla"
        return f"{self.user.username} - {template_name}"
    
    def apply_template_limits(self):
        """Aplica los límites de la plantilla al usuario"""
        if not self.template:
            return
        
        # Eliminar límites existentes del usuario
        UserPlanLimits.objects.filter(user=self.user).delete()
        
        # Crear nuevos límites basados en la plantilla
        for template_limit in self.template.limits.all():
            UserPlanLimits.objects.create(
                user=self.user,
                category=template_limit.category,
                limit_type=template_limit.limit_type,
                limit_value=template_limit.limit_value,
                is_unlimited=template_limit.is_unlimited,
                current_usage=0,
                last_reset=timezone.now()
            )
