"""
Middleware personalizado para CORS dinámico.
Se integra con la base de datos para aplicar configuraciones en tiempo real.
"""

import re
import time
from urllib.parse import urlparse
from django.http import HttpResponse
from django.utils.cache import get_cache_key
from django.core.cache import cache
from django.conf import settings
from django.utils import timezone
from django.db import connection

from .models import CORSDomain


class DynamicCORSMiddleware:
    """
    Middleware que aplica configuraciones CORS dinámicas basadas en la base de datos.
    Incluye caché para optimizar rendimiento y logging de uso.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.cache_timeout = getattr(settings, 'CORS_CACHE_TIMEOUT', 300)  # 5 minutos
        self.cache_key_prefix = 'cors_domains'
        self.debug = getattr(settings, 'DEBUG', False)
        
        # Configuraciones por defecto
        self.default_allow_credentials = False
        self.default_allowed_methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
        self.default_allowed_headers = [
            'Accept', 'Authorization', 'Content-Type', 'X-Requested-With'
        ]
        
        # Precargar dominios en caché al inicializar
        self._preload_domains()
    
    def __call__(self, request):
        # Procesar request CORS
        if self._is_cors_request(request):
            cors_response = self._handle_cors_request(request)
            if cors_response:
                return cors_response
        
        # Continuar con el request normal
        response = self.get_response(request)
        
        # Aplicar headers CORS a la respuesta
        if self._is_cors_request(request):
            response = self._add_cors_headers(request, response)
        
        return response
    
    def _is_cors_request(self, request):
        """Determina si es un request CORS"""
        return (
            'HTTP_ORIGIN' in request.META or
            request.method == 'OPTIONS' or
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' in request.META
        )
    
    def _handle_cors_request(self, request):
        """Maneja requests CORS preflight (OPTIONS)"""
        if request.method == 'OPTIONS':
            origin = request.META.get('HTTP_ORIGIN')
            if origin and self._is_origin_allowed(origin, request):
                response = HttpResponse()
                response = self._add_cors_headers(request, response)
                return response
            else:
                # Origen no permitido
                return HttpResponse(status=403)
        
        return None
    
    def _add_cors_headers(self, request, response):
        """Agrega headers CORS a la respuesta"""
        origin = request.META.get('HTTP_ORIGIN')
        
        if not origin:
            return response
        
        # Verificar si el origen está permitido
        cors_config = self._get_cors_config_for_origin(origin, request)
        
        if not cors_config:
            return response
        
        # Aplicar headers CORS
        response['Access-Control-Allow-Origin'] = origin
        
        if cors_config.get('allow_credentials', self.default_allow_credentials):
            response['Access-Control-Allow-Credentials'] = 'true'
        
        # Métodos permitidos
        allowed_methods = cors_config.get('allowed_methods', self.default_allowed_methods)
        if isinstance(allowed_methods, str):
            allowed_methods = [method.strip() for method in allowed_methods.split(',')]
        response['Access-Control-Allow-Methods'] = ', '.join(allowed_methods)
        
        # Headers permitidos
        allowed_headers = cors_config.get('allowed_headers', self.default_allowed_headers)
        if isinstance(allowed_headers, str):
            allowed_headers = [header.strip() for header in allowed_headers.split(',')]
        response['Access-Control-Allow-Headers'] = ', '.join(allowed_headers)
        
        # Headers expuestos (opcional)
        response['Access-Control-Expose-Headers'] = 'Content-Length, X-JSON'
        
        # Max age para preflight cache
        response['Access-Control-Max-Age'] = '86400'  # 24 horas
        
        # Registrar uso del dominio (async para no bloquear)
        self._log_domain_usage(cors_config.get('domain_id'), origin)
        
        return response
    
    def _is_origin_allowed(self, origin, request):
        """Verifica si un origen está permitido"""
        return self._get_cors_config_for_origin(origin, request) is not None
    
    def _get_cors_config_for_origin(self, origin, request):
        """Obtiene la configuración CORS para un origen específico"""
        # Intentar obtener desde caché primero
        cache_key = f"{self.cache_key_prefix}:config:{origin}"
        cached_config = cache.get(cache_key)
        
        if cached_config is not None:
            return cached_config
        
        # Obtener dominios activos desde caché o DB
        active_domains = self._get_active_domains()
        
        # Buscar coincidencia
        for domain_config in active_domains:
            if self._origin_matches_domain(origin, domain_config['domain']):
                # Cachear la configuración específica
                config = {
                    'domain_id': domain_config.get('id'),
                    'allow_credentials': domain_config.get('allow_credentials', False),
                    'allowed_methods': domain_config.get('allowed_methods', self.default_allowed_methods),
                    'allowed_headers': domain_config.get('allowed_headers', self.default_allowed_headers),
                }
                cache.set(cache_key, config, self.cache_timeout)
                return config
        
        # No encontrado - cachear resultado negativo por menos tiempo
        cache.set(cache_key, False, 60)  # 1 minuto
        return None
    
    def _get_active_domains(self):
        """Obtiene dominios activos desde caché o base de datos"""
        cache_key = f"{self.cache_key_prefix}:active"
        cached_domains = cache.get(cache_key)
        
        if cached_domains is not None:
            return cached_domains
        
        # Obtener desde base de datos
        try:
            domains = list(CORSDomain.objects.filter(
                status='active'
            ).values(
                'id', 'domain', 'allow_credentials', 
                'allowed_methods', 'allowed_headers'
            ))
            
            # Cachear resultado
            cache.set(cache_key, domains, self.cache_timeout)
            return domains
            
        except Exception as e:
            if self.debug:
                print(f"Error obteniendo dominios CORS: {e}")
            return []
    
    def _origin_matches_domain(self, origin, domain_pattern):
        """Verifica si un origen coincide con un patrón de dominio"""
        try:
            # Normalizar origen
            origin_parsed = urlparse(origin.lower())
            origin_host = origin_parsed.netloc or origin_parsed.path
            
            # Normalizar patrón de dominio
            domain_pattern = domain_pattern.lower().strip()
            
            # Casos especiales
            if domain_pattern == '*':
                return True
            
            # Si el patrón incluye protocolo
            if domain_pattern.startswith(('http://', 'https://')):
                domain_parsed = urlparse(domain_pattern)
                domain_host = domain_parsed.netloc or domain_parsed.path
                
                # Verificar protocolo si está especificado
                if domain_parsed.scheme and domain_parsed.scheme != origin_parsed.scheme:
                    return False
            else:
                domain_host = domain_pattern
            
            # Wildcard subdominios (*.example.com)
            if domain_host.startswith('*.'):
                domain_base = domain_host[2:]  # Remover *.
                return (
                    origin_host == domain_base or  # Coincidencia exacta
                    origin_host.endswith('.' + domain_base)  # Subdominio
                )
            
            # Coincidencia exacta
            return origin_host == domain_host
            
        except Exception as e:
            if self.debug:
                print(f"Error comparando origen {origin} con dominio {domain_pattern}: {e}")
            return False
    
    def _log_domain_usage(self, domain_id, origin):
        """Registra el uso de un dominio (async)"""
        if not domain_id:
            return
        
        try:
            # Usar caché para evitar múltiples updates por segundo
            usage_cache_key = f"cors_usage:{domain_id}:{int(time.time() // 60)}"  # Por minuto
            
            if not cache.get(usage_cache_key):
                # Marcar como usado en este minuto
                cache.set(usage_cache_key, True, 60)
                
                # Actualizar contador en base de datos (async si es posible)
                from django.db import transaction
                try:
                    with transaction.atomic():
                        CORSDomain.objects.filter(id=domain_id).update(
                            usage_count=models.F('usage_count') + 1,
                            last_used_at=timezone.now()
                        )
                except Exception as e:
                    if self.debug:
                        print(f"Error actualizando uso de dominio {domain_id}: {e}")
        
        except Exception as e:
            if self.debug:
                print(f"Error registrando uso de dominio: {e}")
    
    def _preload_domains(self):
        """Precarga dominios en caché al inicializar"""
        try:
            self._get_active_domains()
        except Exception as e:
            if self.debug:
                print(f"Error precargando dominios CORS: {e}")


class CORSCacheInvalidationMiddleware:
    """
    Middleware para invalidar caché CORS cuando se modifican dominios.
    Se debe colocar después del DynamicCORSMiddleware.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.cache_key_prefix = 'cors_domains'
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Invalidar caché si se modificaron dominios CORS
        if (request.path.startswith('/admin/cors_management/') or 
            request.path.startswith('/cors/') and 
            request.method in ['POST', 'PUT', 'DELETE']):
            
            self._invalidate_cors_cache()
        
        return response
    
    def _invalidate_cors_cache(self):
        """Invalida todo el caché relacionado con CORS"""
        try:
            # Invalidar caché de dominios activos
            cache.delete(f"{self.cache_key_prefix}:active")
            
            # Invalidar configuraciones específicas (más complejo, requiere patrón)
            # Por simplicidad, usar versioning del caché
            cache_version = cache.get(f"{self.cache_key_prefix}:version", 0)
            cache.set(f"{self.cache_key_prefix}:version", cache_version + 1, None)
            
        except Exception as e:
            print(f"Error invalidando caché CORS: {e}")


# Middleware de compatibilidad con django-cors-headers
class CORSCompatibilityMiddleware:
    """
    Middleware de compatibilidad que permite usar tanto django-cors-headers
    como el sistema dinámico, dando prioridad al dinámico.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.dynamic_cors = DynamicCORSMiddleware(get_response)
    
    def __call__(self, request):
        # Intentar con CORS dinámico primero
        if hasattr(self.dynamic_cors, '_is_cors_request') and self.dynamic_cors._is_cors_request(request):
            origin = request.META.get('HTTP_ORIGIN')
            if origin and self.dynamic_cors._is_origin_allowed(origin, request):
                # Usar CORS dinámico
                return self.dynamic_cors(request)
        
        # Fallback al comportamiento normal (django-cors-headers si está instalado)
        return self.get_response(request)