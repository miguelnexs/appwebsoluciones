"""
Configuración de producción con medidas de seguridad avanzadas
"""

import os
from pathlib import Path
from .settings import *
from datetime import timedelta
import psycopg2.extensions

# Configuración de seguridad para producción
DEBUG = False

# Configuración de hosts permitidos (más restrictiva)
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '72.60.7.133',  # IP del servidor VPS
    'www.72.60.7.133',
    # Agregar aquí tu dominio real cuando lo tengas
]

# Configuración CORS más restrictiva
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Solo para desarrollo local
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # Vite por defecto
    "http://127.0.0.1:5173",
    "http://localhost:5174",  # Vite puerto alternativo
    "http://127.0.0.1:5174",
    "http://72.60.7.133",  # IP del servidor VPS
    "https://72.60.7.133",  # IP del servidor VPS con HTTPS
    "http://www.72.60.7.133",
    "https://www.72.60.7.133",
    "http://softwarebycg.shop",  # URL de producción
    "https://softwarebycg.shop",  # URL de producción con HTTPS
    "http://www.softwarebycg.shop",
    "https://www.softwarebycg.shop",
]

# Headers CORS más restrictivos
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'origin',
    'user-agent',
    'x-requested-with',
]

# Métodos HTTP permitidos (más restrictivos)
CORS_ALLOW_METHODS = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
]

# Configuración REST Framework más segura
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        # Deshabilitar BrowsableAPIRenderer en producción
        # 'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',  # 100 requests por hora para usuarios anónimos
        'user': '1000/hour',  # 1000 requests por hora para usuarios autenticados
    },
    # Configuración para excepciones de autenticación
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',
    'NON_FIELD_ERRORS_KEY': 'error',
}

# Configuraciones de seguridad habilitadas para producción
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000  # 1 año
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
X_FRAME_OPTIONS = 'DENY'  # Prevenir clickjacking
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'

# Configuración de cookies seguras
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'

# Configuración de SSL/HTTPS
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Configuración de logging para producción
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.security': {
            'handlers': ['console', 'file'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
}

# Crear directorio de logs si no existe
LOGS_DIR = BASE_DIR / 'logs'
LOGS_DIR.mkdir(exist_ok=True)

# Configuración JWT más segura para producción
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),  # Tokens más cortos
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),     # Refresh tokens más cortos
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',
    'JTI_CLAIM': 'jti',
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}

# Configuración de archivos más restrictiva
FILE_UPLOAD_PERMISSIONS = 0o600  # Más restrictivo
FILE_UPLOAD_MAX_MEMORY_SIZE = 50 * 1024 * 1024  # 50MB máximo
DATA_UPLOAD_MAX_MEMORY_SIZE = 50 * 1024 * 1024  # 50MB máximo

# Configuración de caché para producción (usar Redis en producción real)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
        'TIMEOUT': 300,  # 5 minutos
        'OPTIONS': {
            'MAX_ENTRIES': 1000,
        }
    }
}

# Configuración de sesiones más segura
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
SESSION_COOKIE_AGE = 3600  # 1 hora
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_SAVE_EVERY_REQUEST = True

# Configuración de middleware de seguridad adicional
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # Middleware personalizado para logging de seguridad
    'Backend.middleware.SecurityLoggingMiddleware',
]

# Configuración de base de datos más segura
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'tiendadb'),
        'USER': os.environ.get('DB_USER', 'productos'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'migel1457'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
        'OPTIONS': {
            'client_encoding': 'UTF8',
            'isolation_level': psycopg2.extensions.ISOLATION_LEVEL_READ_COMMITTED,
            'sslmode': 'require',  # Requerir SSL para conexiones DB
        },
        'CONN_MAX_AGE': 600,  # 10 minutos
        'CONN_HEALTH_CHECKS': True,
    }
}

# Configuración de archivos estáticos para producción
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
WHITENOISE_MAX_AGE = 31536000  # 1 año

# Configuración de validación de contraseñas habilitada
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Configuración de rate limiting personalizada
RATE_LIMIT_ENABLED = True
RATE_LIMIT_CACHE_PREFIX = 'rate_limit'
RATE_LIMIT_CACHE_TIMEOUT = 3600  # 1 hora

# Configuración de auditoría
AUDIT_LOG_ENABLED = True
AUDIT_LOG_MODELS = [
    'pedidos.Pedido',
    'ventas.Venta',
    'productos.Producto',
    'usuarios.Usuario',
]

# Configuración de backup automático
BACKUP_ENABLED = True
BACKUP_SCHEDULE = '0 2 * * *'  # Diario a las 2 AM
BACKUP_RETENTION_DAYS = 30

# Configuración de monitoreo
MONITORING_ENABLED = True
HEALTH_CHECK_ENABLED = True

# Configuración de API versioning
API_VERSION = 'v1'
API_VERSION_HEADER = 'X-API-Version'

# Configuración de documentación de API
API_DOCS_ENABLED = False  # Deshabilitar en producción por seguridad

# Configuración de debugging remoto (solo para emergencias)
DEBUG_TOOLBAR_CONFIG = {
    'SHOW_TOOLBAR_CALLBACK': lambda request: False,  # Deshabilitar en producción
}

# Configuración de manejo de errores
ADMINS = [
    ('Admin', 'admin@tudominio.com'),  # Cambiar por tu email
]

# Configuración de email para notificaciones de seguridad
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@tudominio.com')

# Configuración de notificaciones de seguridad
SECURITY_NOTIFICATIONS = {
    'failed_login_attempts': True,
    'suspicious_activity': True,
    'api_rate_limit_exceeded': True,
    'database_errors': True,
}

# Configuración de IPs bloqueadas
BLOCKED_IPS = [
    # Agregar aquí IPs maliciosas conocidas
]

# Configuración de User-Agent bloqueados
BLOCKED_USER_AGENTS = [
    'bot',
    'crawler',
    'spider',
    'scraper',
]

# Configuración de headers de seguridad adicionales
SECURE_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
}

print("✅ Configuración de producción cargada con medidas de seguridad avanzadas")
