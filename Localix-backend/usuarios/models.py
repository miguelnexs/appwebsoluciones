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
