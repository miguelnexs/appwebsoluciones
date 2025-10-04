from django.shortcuts import redirect
from django.contrib import messages
from django.urls import reverse, resolve
from django.utils import timezone
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth import get_user_model
from django.conf import settings
import json
import logging

from .models import UserUsagePlan, UserPlanLimits, LimitCategory

logger = logging.getLogger(__name__)
User = get_user_model()

class UserUsageMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Rutas que no requieren verificación de plan
        exempt_urls = [
            '/admin/',
            '/api/auth/',
            '/api/usuarios/login/',
            '/api/usuarios/logout/',
            '/api/usuarios/refresh/',
            '/api/usuarios/usage/status/',
            '/static/',
            '/media/',
            '/favicon.ico',
            '/usage/expired/',
        ]
        
        # Verificar si la ruta actual está exenta
        current_path = request.path
        is_exempt = any(current_path.startswith(url) for url in exempt_urls)
        
        if is_exempt:
            return self.get_response(request)
        
        # Solo verificar si el usuario está autenticado
        if not request.user.is_authenticated:
            return self.get_response(request)
        
        # Si el usuario es superusuario, permitir acceso sin restricciones
        if request.user.is_superuser:
            return self.get_response(request)
        
        # Solo verificar si el plan está expirado, no bloquear por otros motivos
        try:
            usage_plan = UserUsagePlan.objects.get(user=request.user)
            
            # Solo bloquear si el plan está realmente expirado
            if usage_plan.is_expired:
                # Redirigir a la página de plan expirado
                return redirect('usuarios:usage_expired')
                
        except UserUsagePlan.DoesNotExist:
            # Si no hay plan, crear uno por defecto
            if request.user.is_superuser:
                UserUsagePlan.objects.create(
                    user=request.user,
                    plan_type='premium',
                    days_allowed=3650,
                    start_date=timezone.now(),
                    end_date=timezone.now() + timezone.timedelta(days=3650),
                    is_active=True
                )
            else:
                UserUsagePlan.objects.create(
                    user=request.user,
                    plan_type='trial',
                    days_allowed=15,
                    start_date=timezone.now(),
                    end_date=timezone.now() + timezone.timedelta(days=15),
                    is_active=True
                )
        
        return self.get_response(request)


class PlanLimitMiddleware(MiddlewareMixin):
    """
    Middleware to enforce plan limits across the application.
    Checks user limits before allowing certain actions.
    """
    
    # Define which URL patterns should be checked for limits
    LIMIT_CHECKS = {
        # Inventory limits
        'inventario:producto_create': 'max_products',
        'inventario:producto_list': None,  # No limit for viewing
        'inventario:categoria_create': 'max_categories',
        'inventario:categoria_list': None,
        
        # Sales limits
        'ventas:venta_create': 'monthly_sales',
        'ventas:venta_list': None,
        
        # Reports limits
        'reportes:reporte_avanzado': 'advanced_reports',
        'reportes:exportar_datos': 'data_export',
        
        # API limits
        'api:': 'api_access',  # Any API endpoint
        
        # Support limits
        'soporte:ticket_create': 'email_support',
        'soporte:priority_support': 'priority_support',
        
        # User management limits
        'usuarios:usuario_create': 'max_users',
    }
    
    # HTTP methods that should trigger limit checks
    LIMIT_METHODS = ['POST', 'PUT', 'PATCH']
    
    # Paths that should be excluded from limit checks
    EXCLUDED_PATHS = [
        '/admin/',
        '/api/usuarios/login/',
        '/api/usuarios/logout/',
        '/api/usuarios/refresh/',
        '/api/usuarios/profile/',
        '/api/usuarios/plan-summary/',
        '/api/usuarios/check-limit/',
        '/static/',
        '/media/',
    ]

    def process_request(self, request):
        """
        Process incoming requests and check limits if necessary.
        """
        # Skip limit checks for excluded paths
        if any(request.path.startswith(path) for path in self.EXCLUDED_PATHS):
            return None
            
        # Skip if user is not authenticated
        if not request.user.is_authenticated:
            return None
            
        # Skip if user is superuser
        if request.user.is_superuser:
            return None
            
        # Only check limits for specific HTTP methods
        if request.method not in self.LIMIT_METHODS:
            return None
            
        try:
            # Resolve the URL to get the view name
            resolved = resolve(request.path)
            view_name = f"{resolved.namespace}:{resolved.url_name}" if resolved.namespace else resolved.url_name
            
            # Check if this view requires limit checking
            limit_category = self.get_limit_category_for_view(view_name)
            if not limit_category:
                return None
                
            # Check the user's limit for this category
            limit_check_result = self.check_user_limit(request.user, limit_category)
            
            if not limit_check_result['allowed']:
                return JsonResponse({
                    'error': 'Límite de plan excedido',
                    'message': limit_check_result['message'],
                    'limit_category': limit_category,
                    'current_usage': limit_check_result['current_usage'],
                    'limit_value': limit_check_result['limit_value'],
                    'upgrade_required': True
                }, status=403)
                
        except Exception as e:
            logger.error(f"Error in PlanLimitMiddleware: {str(e)}")
            # Don't block the request if there's an error in the middleware
            return None
            
        return None

    def get_limit_category_for_view(self, view_name):
        """
        Get the limit category that should be checked for a given view.
        """
        # Direct match
        if view_name in self.LIMIT_CHECKS:
            return self.LIMIT_CHECKS[view_name]
            
        # Pattern match (e.g., 'api:' matches any API endpoint)
        for pattern, category in self.LIMIT_CHECKS.items():
            if pattern.endswith(':') and view_name.startswith(pattern):
                return category
                
        return None

    def check_user_limit(self, user, limit_category_name):
        """
        Check if a user can perform an action based on their limits.
        """
        try:
            # Get the limit category
            limit_category = LimitCategory.objects.get(name=limit_category_name)
            
            # Get the user's limit for this category
            user_limit = UserPlanLimits.objects.filter(
                user=user,
                limit_category=limit_category,
                is_active=True
            ).first()
            
            if not user_limit:
                # If no specific limit is set, allow the action
                return {
                    'allowed': True,
                    'message': 'No hay límite establecido para esta acción',
                    'current_usage': 0,
                    'limit_value': None
                }
            
            # Check if the limit is exceeded
            if user_limit.limit_value == -1:  # Unlimited
                return {
                    'allowed': True,
                    'message': 'Acceso ilimitado',
                    'current_usage': user_limit.current_usage,
                    'limit_value': -1
                }
            
            if user_limit.current_usage >= user_limit.limit_value:
                return {
                    'allowed': False,
                    'message': f'Has alcanzado el límite de {user_limit.limit_value} para {limit_category.display_name}',
                    'current_usage': user_limit.current_usage,
                    'limit_value': user_limit.limit_value
                }
            
            return {
                'allowed': True,
                'message': f'Límite OK: {user_limit.current_usage}/{user_limit.limit_value}',
                'current_usage': user_limit.current_usage,
                'limit_value': user_limit.limit_value
            }
            
        except LimitCategory.DoesNotExist:
            logger.warning(f"Limit category '{limit_category_name}' does not exist")
            return {
                'allowed': True,
                'message': 'Categoría de límite no encontrada',
                'current_usage': 0,
                'limit_value': None
            }
        except Exception as e:
            logger.error(f"Error checking user limit: {str(e)}")
            return {
                'allowed': True,
                'message': 'Error al verificar límite',
                'current_usage': 0,
                'limit_value': None
            }


class UsageTrackingMiddleware(MiddlewareMixin):
    """
    Middleware to automatically track usage when certain actions are performed.
    This runs after the request is processed successfully.
    """
    
    # Define which actions should increment usage counters
    USAGE_TRACKING = {
        'inventario:producto_create': 'max_products',
        'inventario:categoria_create': 'max_categories',
        'ventas:venta_create': 'monthly_sales',
        'reportes:reporte_avanzado': 'advanced_reports',
        'reportes:exportar_datos': 'data_export',
        'usuarios:usuario_create': 'max_users',
        'soporte:ticket_create': 'email_support',
    }

    def process_response(self, request, response):
        """
        Process the response and update usage counters if necessary.
        """
        # Only track usage for successful requests
        if response.status_code not in [200, 201]:
            return response
            
        # Skip if user is not authenticated
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return response
            
        # Skip if user is superuser
        if request.user.is_superuser:
            return response
            
        # Only track usage for specific HTTP methods
        if request.method not in ['POST', 'PUT', 'PATCH']:
            return response
            
        try:
            # Resolve the URL to get the view name
            resolved = resolve(request.path)
            view_name = f"{resolved.namespace}:{resolved.url_name}" if resolved.namespace else resolved.url_name
            
            # Check if this view should track usage
            limit_category = self.get_usage_category_for_view(view_name)
            if limit_category:
                self.increment_usage(request.user, limit_category)
                
        except Exception as e:
            logger.error(f"Error in UsageTrackingMiddleware: {str(e)}")
            
        return response

    def get_usage_category_for_view(self, view_name):
        """
        Get the usage category that should be incremented for a given view.
        """
        return self.USAGE_TRACKING.get(view_name)

    def increment_usage(self, user, limit_category_name):
        """
        Increment the usage counter for a user and category.
        """
        try:
            # Get the limit category
            limit_category = LimitCategory.objects.get(name=limit_category_name)
            
            # Get or create the user's limit for this category
            user_limit, created = UserPlanLimits.objects.get_or_create(
                user=user,
                limit_category=limit_category,
                defaults={
                    'limit_value': 0,  # Will be set by plan assignment
                    'current_usage': 0,
                    'is_active': True
                }
            )
            
            # Increment the usage
            user_limit.increment_usage()
            
            logger.info(f"Incremented usage for user {user.id}, category {limit_category_name}: {user_limit.current_usage}")
            
        except LimitCategory.DoesNotExist:
            logger.warning(f"Limit category '{limit_category_name}' does not exist")
        except Exception as e:
            logger.error(f"Error incrementing usage: {str(e)}")
