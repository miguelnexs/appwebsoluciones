"""
Validadores personalizados para dominios CORS.
Incluye validaciones de formato, seguridad y compatibilidad.
"""

import re
import socket
from urllib.parse import urlparse
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from django.utils.translation import gettext_lazy as _


class CORSDomainValidator:
    """
    Validador completo para dominios CORS.
    Verifica formato, seguridad y accesibilidad.
    """
    
    # Patrones de dominios peligrosos
    DANGEROUS_PATTERNS = [
        r'.*\.exe$',
        r'.*\.bat$',
        r'.*\.cmd$',
        r'.*javascript:.*',
        r'.*data:.*',
        r'.*file:.*',
        r'.*ftp:.*',
        r'.*\.onion$',  # Tor domains
    ]
    
    # Dominios de desarrollo permitidos
    DEVELOPMENT_DOMAINS = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '::1',
    ]
    
    # Puertos comunes para desarrollo
    COMMON_DEV_PORTS = [3000, 3001, 4200, 5000, 5173, 8000, 8080, 8081, 9000]
    
    def __init__(self, allow_wildcards=True, allow_development=True, check_accessibility=False):
        self.allow_wildcards = allow_wildcards
        self.allow_development = allow_development
        self.check_accessibility = check_accessibility
    
    def __call__(self, value):
        """Ejecuta todas las validaciones"""
        if not value:
            raise ValidationError(_('El dominio no puede estar vacío.'))
        
        value = value.strip().lower()
        
        # Validaciones básicas
        self._validate_format(value)
        self._validate_security(value)
        
        # Validaciones opcionales
        if not self.allow_wildcards:
            self._validate_no_wildcards(value)
        
        if not self.allow_development:
            self._validate_no_development(value)
        
        if self.check_accessibility:
            self._validate_accessibility(value)
        
        return value
    
    def _validate_format(self, value):
        """Valida el formato básico del dominio"""
        # Patrones válidos
        patterns = [
            # Con protocolo completo
            r'^https?://[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*(\:[0-9]{1,5})?(/.*)?$',
            # Dominio sin protocolo
            r'^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*(\:[0-9]{1,5})?$',
            # Localhost y variantes
            r'^localhost(\:[0-9]{1,5})?$',
            r'^127\.0\.0\.1(\:[0-9]{1,5})?$',
            r'^0\.0\.0\.0(\:[0-9]{1,5})?$',
            r'^::1(\:[0-9]{1,5})?$',
            # Wildcards
            r'^\*$',
            r'^\*\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$',
        ]
        
        if not any(re.match(pattern, value) for pattern in patterns):
            raise ValidationError(
                _('Formato de dominio inválido. Ejemplos válidos: '
                  'https://example.com, localhost:3000, *.example.com')
            )
    
    def _validate_security(self, value):
        """Valida que el dominio no sea peligroso"""
        for pattern in self.DANGEROUS_PATTERNS:
            if re.match(pattern, value, re.IGNORECASE):
                raise ValidationError(
                    _('El dominio "%(domain)s" no está permitido por razones de seguridad.'),
                    params={'domain': value}
                )
        
        # Verificar longitud máxima
        if len(value) > 253:  # RFC 1035
            raise ValidationError(_('El dominio es demasiado largo (máximo 253 caracteres).'))
        
        # Verificar caracteres especiales peligrosos
        dangerous_chars = ['<', '>', '"', "'", '&', '\n', '\r', '\t']
        if any(char in value for char in dangerous_chars):
            raise ValidationError(_('El dominio contiene caracteres no permitidos.'))
    
    def _validate_no_wildcards(self, value):
        """Valida que no se usen wildcards si no están permitidos"""
        if '*' in value:
            raise ValidationError(_('Los wildcards no están permitidos en este contexto.'))
    
    def _validate_no_development(self, value):
        """Valida que no se usen dominios de desarrollo si no están permitidos"""
        # Extraer el host del dominio
        host = self._extract_host(value)
        
        if host in self.DEVELOPMENT_DOMAINS:
            raise ValidationError(_('Los dominios de desarrollo no están permitidos en producción.'))
        
        # Verificar IPs privadas
        if self._is_private_ip(host):
            raise ValidationError(_('Las IPs privadas no están permitidas en producción.'))
    
    def _validate_accessibility(self, value):
        """Valida que el dominio sea accesible (opcional)"""
        if value.startswith('*') or value == '*':
            return  # Skip para wildcards
        
        host = self._extract_host(value)
        port = self._extract_port(value)
        
        try:
            # Intentar resolver DNS
            socket.gethostbyname(host)
            
            # Intentar conectar al puerto si se especifica
            if port:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(5)  # 5 segundos timeout
                result = sock.connect_ex((host, port))
                sock.close()
                
                if result != 0:
                    raise ValidationError(
                        _('No se puede conectar a %(host)s:%(port)s'),
                        params={'host': host, 'port': port}
                    )
        
        except socket.gaierror:
            raise ValidationError(
                _('No se puede resolver el dominio "%(domain)s"'),
                params={'domain': host}
            )
        except Exception as e:
            raise ValidationError(
                _('Error al verificar accesibilidad: %(error)s'),
                params={'error': str(e)}
            )
    
    def _extract_host(self, value):
        """Extrae el host del dominio"""
        if value.startswith(('http://', 'https://')):
            parsed = urlparse(value)
            return parsed.hostname or parsed.netloc.split(':')[0]
        else:
            return value.split(':')[0]
    
    def _extract_port(self, value):
        """Extrae el puerto del dominio"""
        if value.startswith(('http://', 'https://')):
            parsed = urlparse(value)
            return parsed.port
        else:
            if ':' in value:
                try:
                    return int(value.split(':')[1])
                except (ValueError, IndexError):
                    return None
        return None
    
    def _is_private_ip(self, ip):
        """Verifica si es una IP privada"""
        try:
            import ipaddress
            ip_obj = ipaddress.ip_address(ip)
            return ip_obj.is_private
        except ValueError:
            return False


def validate_cors_domain_production(value):
    """Validador estricto para producción"""
    validator = CORSDomainValidator(
        allow_wildcards=False,
        allow_development=False,
        check_accessibility=True
    )
    return validator(value)


def validate_cors_domain_development(value):
    """Validador permisivo para desarrollo"""
    validator = CORSDomainValidator(
        allow_wildcards=True,
        allow_development=True,
        check_accessibility=False
    )
    return validator(value)


def validate_cors_methods(value):
    """Valida métodos HTTP para CORS"""
    if not value:
        raise ValidationError(_('Los métodos HTTP no pueden estar vacíos.'))
    
    valid_methods = [
        'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'
    ]
    
    methods = [method.strip().upper() for method in value.split(',')]
    
    for method in methods:
        if method not in valid_methods:
            raise ValidationError(
                _('Método HTTP inválido: "%(method)s". Métodos válidos: %(valid)s'),
                params={'method': method, 'valid': ', '.join(valid_methods)}
            )
    
    return ','.join(methods)


def validate_cors_headers(value):
    """Valida headers para CORS"""
    if not value:
        return value
    
    # Headers comunes y seguros
    safe_headers = [
        'Accept', 'Accept-Language', 'Content-Language', 'Content-Type',
        'Authorization', 'X-Requested-With', 'X-CSRFToken', 'Cache-Control'
    ]
    
    # Headers peligrosos que no deberían permitirse
    dangerous_headers = [
        'Cookie', 'Set-Cookie', 'X-Forwarded-For', 'X-Real-IP'
    ]
    
    headers = [header.strip() for header in value.split(',')]
    
    for header in headers:
        if header in dangerous_headers:
            raise ValidationError(
                _('Header peligroso no permitido: "%(header)s"'),
                params={'header': header}
            )
        
        # Validar formato del header
        if not re.match(r'^[a-zA-Z0-9\-_]+$', header):
            raise ValidationError(
                _('Formato de header inválido: "%(header)s"'),
                params={'header': header}
            )
    
    return ','.join(headers)


class DomainWhitelistValidator:
    """
    Validador que verifica contra una lista blanca de dominios permitidos.
    Útil para entornos de producción con control estricto.
    """
    
    def __init__(self, whitelist=None):
        self.whitelist = whitelist or []
    
    def __call__(self, value):
        if not self.whitelist:
            return value
        
        domain = value.lower().strip()
        
        # Verificar coincidencia exacta
        if domain in self.whitelist:
            return value
        
        # Verificar wildcards en la whitelist
        for allowed in self.whitelist:
            if allowed.startswith('*.'):
                pattern = allowed.replace('*.', r'.*\.')
                if re.match(f'^{pattern}$', domain):
                    return value
        
        raise ValidationError(
            _('El dominio "%(domain)s" no está en la lista de dominios permitidos.'),
            params={'domain': value}
        )


def get_domain_validator(environment='development'):
    """
    Factory function para obtener el validador apropiado según el entorno.
    """
    if environment == 'production':
        return validate_cors_domain_production
    else:
        return validate_cors_domain_development