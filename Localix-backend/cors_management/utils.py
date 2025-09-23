"""
Utilidades para la gestión de CORS.
Incluye funciones de auditoría, logging y helpers.
"""

from django.utils import timezone
from .models import CORSDomainAuditLog


def get_client_ip(request):
    """Obtiene la IP real del cliente"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_user_agent(request):
    """Obtiene el user agent del cliente"""
    return request.META.get('HTTP_USER_AGENT', '')


def log_cors_action(cors_domain, action, user, ip_address=None, user_agent=None, changes=None, notes=None):
    """
    Registra una acción en el log de auditoría.
    """
    CORSDomainAuditLog.objects.create(
        cors_domain=cors_domain,
        domain_name=cors_domain.domain if cors_domain else 'Unknown',
        action=action,
        user=user,
        ip_address=ip_address,
        user_agent=user_agent,
        changes=changes or {},
        notes=notes or ''
    )