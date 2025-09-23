from django.db import models
from django.conf import settings
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.contrib.auth import get_user_model
import re
import json

User = get_user_model()


def validate_domain_format(value):
    """
    Validador personalizado para formato de dominios.
    Acepta dominios con o sin protocolo, con o sin puerto.
    """
    # Patrones válidos para dominios
    domain_patterns = [
        r'^https?://[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*(\:[0-9]{1,5})?(/.*)?$',  # Con protocolo
        r'^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*(\:[0-9]{1,5})?$',  # Sin protocolo
        r'^localhost(\:[0-9]{1,5})?$',  # localhost
        r'^127\.0\.0\.1(\:[0-9]{1,5})?$',  # IP local
        r'^0\.0\.0\.0(\:[0-9]{1,5})?$',  # IP cualquiera
        r'^\*$',  # Wildcard para desarrollo
    ]
    
    if not any(re.match(pattern, value) for pattern in domain_patterns):
        raise ValidationError(
            f'"{value}" no es un formato de dominio válido. '
            'Ejemplos válidos: https://example.com, localhost:3000, *.example.com'
        )


class CORSDomain(models.Model):
    """
    Modelo para gestionar dominios permitidos en CORS.
    Incluye auditoría completa y validaciones de seguridad.
    """
    
    STATUS_CHOICES = [
        ('active', 'Activo'),
        ('inactive', 'Inactivo'),
        ('pending', 'Pendiente de aprobación'),
    ]
    
    ENVIRONMENT_CHOICES = [
        ('development', 'Desarrollo'),
        ('staging', 'Staging'),
        ('production', 'Producción'),
        ('all', 'Todos los entornos'),
    ]
    
    # Información del dominio
    domain = models.CharField(
        max_length=255,
        unique=True,
        validators=[validate_domain_format],
        help_text="Dominio permitido para CORS (ej: https://example.com, localhost:3000)"
    )
    
    description = models.TextField(
        blank=True,
        help_text="Descripción del propósito de este dominio"
    )
    
    # Estado y configuración
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text="Estado actual del dominio"
    )
    
    environment = models.CharField(
        max_length=20,
        choices=ENVIRONMENT_CHOICES,
        default='development',
        help_text="Entorno donde se aplicará este dominio"
    )
    
    # Configuraciones específicas de CORS
    allow_credentials = models.BooleanField(
        default=False,
        help_text="Permitir envío de credenciales (cookies, headers de autorización)"
    )
    
    allowed_methods = models.CharField(
        max_length=200,
        default='GET,POST,PUT,DELETE,OPTIONS',
        help_text="Métodos HTTP permitidos (separados por comas)"
    )
    
    allowed_headers = models.TextField(
        default='Accept,Authorization,Content-Type,X-Requested-With',
        help_text="Headers permitidos (separados por comas)"
    )
    
    # Auditoría
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='cors_domains_created',
        help_text="Usuario que creó este dominio"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha y hora de creación"
    )
    
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='cors_domains_updated',
        help_text="Usuario que realizó la última modificación"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Fecha y hora de última modificación"
    )
    
    # Campos adicionales de seguridad
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cors_domains_approved',
        help_text="Usuario que aprobó este dominio"
    )
    
    approved_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha y hora de aprobación"
    )
    
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha de expiración del dominio (opcional)"
    )
    
    # Metadatos
    usage_count = models.PositiveIntegerField(
        default=0,
        help_text="Número de veces que se ha usado este dominio"
    )
    
    last_used_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Última vez que se usó este dominio"
    )
    
    class Meta:
        db_table = 'cors_domains'
        verbose_name = 'Dominio CORS'
        verbose_name_plural = 'Dominios CORS'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['domain']),
            models.Index(fields=['status']),
            models.Index(fields=['environment']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.domain} ({self.get_status_display()})"
    
    def clean(self):
        """Validaciones adicionales del modelo"""
        super().clean()
        
        # Validar que el dominio no sea malicioso
        if self.domain:
            self.domain = self.domain.strip().lower()
            
            # Lista de dominios peligrosos (ejemplo básico)
            dangerous_patterns = [
                r'.*\.exe$',
                r'.*javascript:.*',
                r'.*data:.*',
                r'.*file:.*',
            ]
            
            for pattern in dangerous_patterns:
                if re.match(pattern, self.domain, re.IGNORECASE):
                    raise ValidationError(f'El dominio "{self.domain}" no está permitido por razones de seguridad.')
    
    def save(self, *args, **kwargs):
        """Override del save para auditoría automática"""
        self.full_clean()
        
        # Si es una actualización, registrar el usuario que modifica
        if self.pk and hasattr(self, '_current_user'):
            self.updated_by = self._current_user
        
        # Si se está activando, registrar aprobación
        if self.status == 'active' and hasattr(self, '_current_user'):
            if not self.approved_by:
                self.approved_by = self._current_user
                self.approved_at = models.timezone.now()
        
        super().save(*args, **kwargs)
    
    def is_active(self):
        """Verifica si el dominio está activo y no ha expirado"""
        if self.status != 'active':
            return False
        
        if self.expires_at and self.expires_at < models.timezone.now():
            return False
        
        return True
    
    def get_normalized_domain(self):
        """Retorna el dominio normalizado para comparaciones"""
        domain = self.domain.lower().strip()
        
        # Si no tiene protocolo, agregarlo para parsing
        if not domain.startswith(('http://', 'https://')):
            if domain in ['localhost', '127.0.0.1'] or domain.startswith('localhost:') or domain.startswith('127.0.0.1:'):
                domain = f'http://{domain}'
            else:
                domain = f'https://{domain}'
        
        try:
            parsed = urlparse(domain)
            return f"{parsed.scheme}://{parsed.netloc}"
        except:
            return self.domain
    
    def increment_usage(self):
        """Incrementa el contador de uso"""
        self.usage_count += 1
        self.last_used_at = models.timezone.now()
        self.save(update_fields=['usage_count', 'last_used_at'])


class CORSDomainAuditLog(models.Model):
    """
    Registro de auditoría para cambios en dominios CORS.
    Mantiene un historial completo de todas las modificaciones.
    """
    
    ACTION_CHOICES = [
        ('create', 'Creado'),
        ('update', 'Actualizado'),
        ('delete', 'Eliminado'),
        ('activate', 'Activado'),
        ('deactivate', 'Desactivado'),
        ('approve', 'Aprobado'),
        ('reject', 'Rechazado'),
    ]
    
    cors_domain = models.ForeignKey(
        CORSDomain,
        on_delete=models.CASCADE,
        related_name='audit_logs',
        null=True,  # Puede ser null si el dominio fue eliminado
        help_text="Dominio CORS relacionado"
    )
    
    domain_name = models.CharField(
        max_length=255,
        help_text="Nombre del dominio (guardado para referencia)"
    )
    
    action = models.CharField(
        max_length=20,
        choices=ACTION_CHOICES,
        help_text="Acción realizada"
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        help_text="Usuario que realizó la acción"
    )
    
    timestamp = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha y hora de la acción"
    )
    
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="Dirección IP desde donde se realizó la acción"
    )
    
    user_agent = models.TextField(
        blank=True,
        help_text="User agent del navegador"
    )
    
    changes = models.JSONField(
        default=dict,
        help_text="Detalles de los cambios realizados"
    )
    
    notes = models.TextField(
        blank=True,
        help_text="Notas adicionales sobre la acción"
    )
    
    class Meta:
        db_table = 'cors_domain_audit_logs'
        verbose_name = 'Log de Auditoría CORS'
        verbose_name_plural = 'Logs de Auditoría CORS'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['domain_name']),
            models.Index(fields=['action']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['user']),
        ]
    
    def __str__(self):
        return f"{self.domain_name} - {self.get_action_display()} por {self.user} ({self.timestamp})"