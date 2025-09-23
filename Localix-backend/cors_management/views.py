"""
Vistas para el panel de administración de dominios CORS.
Incluye CRUD completo, auditoría y validaciones en tiempo real.
"""

import json
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.http import JsonResponse, HttpResponseForbidden
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from django.db.models import Q
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.models import User

from .models import CORSDomain, CORSDomainAuditLog
from .validators import get_domain_validator, validate_cors_methods, validate_cors_headers
from .utils import get_client_ip, get_user_agent, log_cors_action


def is_cors_admin(user):
    """Verifica si el usuario puede administrar CORS"""
    return user.is_superuser or user.groups.filter(name='cors_admin').exists()


@login_required
@user_passes_test(is_cors_admin)
def cors_dashboard(request):
    """Dashboard principal de gestión CORS"""
    # Estadísticas
    total_domains = CORSDomain.objects.count()
    active_domains = CORSDomain.objects.filter(status='active').count()
    pending_domains = CORSDomain.objects.filter(status='pending').count()
    
    # Dominios recientes
    recent_domains = CORSDomain.objects.order_by('-created_at')[:5]
    
    # Logs de auditoría recientes
    recent_logs = CORSDomainAuditLog.objects.order_by('-timestamp')[:10]
    
    context = {
        'total_domains': total_domains,
        'active_domains': active_domains,
        'pending_domains': pending_domains,
        'recent_domains': recent_domains,
        'recent_logs': recent_logs,
        'current_environment': getattr(settings, 'ENVIRONMENT', 'development'),
    }
    
    return render(request, 'cors_management/dashboard.html', context)


@login_required
@user_passes_test(is_cors_admin)
def domain_list(request):
    """Lista de dominios CORS con filtros y paginación"""
    domains = CORSDomain.objects.all()
    
    # Filtros
    status_filter = request.GET.get('status')
    environment_filter = request.GET.get('environment')
    search_query = request.GET.get('search')
    
    if status_filter:
        domains = domains.filter(status=status_filter)
    
    if environment_filter:
        domains = domains.filter(environment=environment_filter)
    
    if search_query:
        domains = domains.filter(
            Q(domain__icontains=search_query) |
            Q(description__icontains=search_query)
        )
    
    # Paginación
    paginator = Paginator(domains, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'status_choices': CORSDomain.STATUS_CHOICES,
        'environment_choices': CORSDomain.ENVIRONMENT_CHOICES,
        'current_filters': {
            'status': status_filter,
            'environment': environment_filter,
            'search': search_query,
        }
    }
    
    return render(request, 'cors_management/domain_list.html', context)


@login_required
@user_passes_test(is_cors_admin)
def domain_create(request):
    """Crear nuevo dominio CORS"""
    if request.method == 'POST':
        try:
            # Obtener datos del formulario
            domain = request.POST.get('domain', '').strip()
            description = request.POST.get('description', '').strip()
            environment = request.POST.get('environment', 'development')
            allow_credentials = request.POST.get('allow_credentials') == 'on'
            allowed_methods = request.POST.get('allowed_methods', 'GET,POST,PUT,DELETE,OPTIONS')
            allowed_headers = request.POST.get('allowed_headers', 'Accept,Authorization,Content-Type,X-Requested-With')
            
            # Validar dominio
            validator = get_domain_validator(environment)
            validator(domain)
            
            # Validar métodos y headers
            allowed_methods = validate_cors_methods(allowed_methods)
            allowed_headers = validate_cors_headers(allowed_headers)
            
            # Crear dominio
            cors_domain = CORSDomain.objects.create(
                domain=domain,
                description=description,
                environment=environment,
                allow_credentials=allow_credentials,
                allowed_methods=allowed_methods,
                allowed_headers=allowed_headers,
                created_by=request.user,
                status='pending' if environment == 'production' else 'active'
            )
            
            # Registrar en auditoría
            log_cors_action(
                cors_domain=cors_domain,
                action='create',
                user=request.user,
                ip_address=get_client_ip(request),
                user_agent=get_user_agent(request),
                changes={
                    'domain': domain,
                    'environment': environment,
                    'status': cors_domain.status
                }
            )
            
            messages.success(request, f'Dominio "{domain}" creado exitosamente.')
            return redirect('cors_management:domain_list')
            
        except Exception as e:
            messages.error(request, f'Error al crear dominio: {str(e)}')
    
    context = {
        'environment_choices': CORSDomain.ENVIRONMENT_CHOICES,
        'default_methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'default_headers': 'Accept,Authorization,Content-Type,X-Requested-With',
    }
    
    return render(request, 'cors_management/domain_form.html', context)


@login_required
@user_passes_test(is_cors_admin)
def domain_edit(request, domain_id):
    """Editar dominio CORS existente"""
    cors_domain = get_object_or_404(CORSDomain, id=domain_id)
    
    if request.method == 'POST':
        try:
            # Guardar valores originales para auditoría
            original_values = {
                'domain': cors_domain.domain,
                'description': cors_domain.description,
                'status': cors_domain.status,
                'environment': cors_domain.environment,
                'allow_credentials': cors_domain.allow_credentials,
                'allowed_methods': cors_domain.allowed_methods,
                'allowed_headers': cors_domain.allowed_headers,
            }
            
            # Obtener nuevos valores
            domain = request.POST.get('domain', '').strip()
            description = request.POST.get('description', '').strip()
            status = request.POST.get('status', cors_domain.status)
            environment = request.POST.get('environment', cors_domain.environment)
            allow_credentials = request.POST.get('allow_credentials') == 'on'
            allowed_methods = request.POST.get('allowed_methods', cors_domain.allowed_methods)
            allowed_headers = request.POST.get('allowed_headers', cors_domain.allowed_headers)
            
            # Validaciones
            validator = get_domain_validator(environment)
            validator(domain)
            allowed_methods = validate_cors_methods(allowed_methods)
            allowed_headers = validate_cors_headers(allowed_headers)
            
            # Actualizar dominio
            cors_domain.domain = domain
            cors_domain.description = description
            cors_domain.status = status
            cors_domain.environment = environment
            cors_domain.allow_credentials = allow_credentials
            cors_domain.allowed_methods = allowed_methods
            cors_domain.allowed_headers = allowed_headers
            cors_domain.updated_by = request.user
            cors_domain._current_user = request.user  # Para auditoría automática
            cors_domain.save()
            
            # Calcular cambios para auditoría
            changes = {}
            for key, original_value in original_values.items():
                new_value = getattr(cors_domain, key)
                if original_value != new_value:
                    changes[key] = {
                        'from': original_value,
                        'to': new_value
                    }
            
            # Registrar en auditoría
            log_cors_action(
                cors_domain=cors_domain,
                action='update',
                user=request.user,
                ip_address=get_client_ip(request),
                user_agent=get_user_agent(request),
                changes=changes
            )
            
            messages.success(request, f'Dominio "{domain}" actualizado exitosamente.')
            return redirect('cors_management:domain_list')
            
        except Exception as e:
            messages.error(request, f'Error al actualizar dominio: {str(e)}')
    
    context = {
        'cors_domain': cors_domain,
        'status_choices': CORSDomain.STATUS_CHOICES,
        'environment_choices': CORSDomain.ENVIRONMENT_CHOICES,
        'is_edit': True,
    }
    
    return render(request, 'cors_management/domain_form.html', context)


@login_required
@user_passes_test(is_cors_admin)
def domain_delete(request, domain_id):
    """Eliminar dominio CORS"""
    cors_domain = get_object_or_404(CORSDomain, id=domain_id)
    
    if request.method == 'POST':
        domain_name = cors_domain.domain
        
        # Registrar en auditoría antes de eliminar
        log_cors_action(
            cors_domain=cors_domain,
            action='delete',
            user=request.user,
            ip_address=get_client_ip(request),
            user_agent=get_user_agent(request),
            changes={'domain': domain_name}
        )
        
        cors_domain.delete()
        messages.success(request, f'Dominio "{domain_name}" eliminado exitosamente.')
        return redirect('cors_management:domain_list')
    
    context = {'cors_domain': cors_domain}
    return render(request, 'cors_management/domain_confirm_delete.html', context)


@login_required
@user_passes_test(is_cors_admin)
def domain_toggle_status(request, domain_id):
    """Activar/desactivar dominio CORS"""
    if request.method != 'POST':
        return HttpResponseForbidden()
    
    cors_domain = get_object_or_404(CORSDomain, id=domain_id)
    old_status = cors_domain.status
    
    # Cambiar estado
    if cors_domain.status == 'active':
        cors_domain.status = 'inactive'
        action = 'deactivate'
        message = f'Dominio "{cors_domain.domain}" desactivado.'
    else:
        cors_domain.status = 'active'
        action = 'activate'
        message = f'Dominio "{cors_domain.domain}" activado.'
        
        # Si se activa, registrar aprobación
        if not cors_domain.approved_by:
            cors_domain.approved_by = request.user
            cors_domain.approved_at = timezone.now()
    
    cors_domain.updated_by = request.user
    cors_domain._current_user = request.user
    cors_domain.save()
    
    # Registrar en auditoría
    log_cors_action(
        cors_domain=cors_domain,
        action=action,
        user=request.user,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
        changes={
            'status': {
                'from': old_status,
                'to': cors_domain.status
            }
        }
    )
    
    messages.success(request, message)
    return redirect('cors_management:domain_list')


@login_required
@user_passes_test(is_cors_admin)
def audit_log(request):
    """Ver logs de auditoría"""
    logs = CORSDomainAuditLog.objects.all()
    
    # Filtros
    action_filter = request.GET.get('action')
    user_filter = request.GET.get('user')
    domain_filter = request.GET.get('domain')
    
    if action_filter:
        logs = logs.filter(action=action_filter)
    
    if user_filter:
        logs = logs.filter(user_id=user_filter)
    
    if domain_filter:
        logs = logs.filter(domain_name__icontains=domain_filter)
    
    # Paginación
    paginator = Paginator(logs, 50)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    # Usuarios para filtro
    users = User.objects.filter(
        id__in=CORSDomainAuditLog.objects.values_list('user_id', flat=True).distinct()
    ).exclude(id__isnull=True)
    
    context = {
        'page_obj': page_obj,
        'action_choices': CORSDomainAuditLog.ACTION_CHOICES,
        'users': users,
        'current_filters': {
            'action': action_filter,
            'user': user_filter,
            'domain': domain_filter,
        }
    }
    
    return render(request, 'cors_management/audit_log.html', context)


# API Views para validación en tiempo real

@require_http_methods(["POST"])
@csrf_exempt
@login_required
def validate_domain_api(request):
    """API para validar dominio en tiempo real"""
    if not is_cors_admin(request.user):
        return JsonResponse({'error': 'No autorizado'}, status=403)
    
    try:
        data = json.loads(request.body)
        domain = data.get('domain', '').strip()
        environment = data.get('environment', 'development')
        
        if not domain:
            return JsonResponse({'valid': False, 'error': 'Dominio requerido'})
        
        # Validar formato
        validator = get_domain_validator(environment)
        validator(domain)
        
        # Verificar si ya existe
        if CORSDomain.objects.filter(domain=domain).exists():
            return JsonResponse({'valid': False, 'error': 'El dominio ya existe'})
        
        return JsonResponse({'valid': True, 'message': 'Dominio válido'})
        
    except Exception as e:
        return JsonResponse({'valid': False, 'error': str(e)})


@require_http_methods(["POST"])
@csrf_exempt
@login_required
def validate_methods_api(request):
    """API para validar métodos HTTP"""
    if not is_cors_admin(request.user):
        return JsonResponse({'error': 'No autorizado'}, status=403)
    
    try:
        data = json.loads(request.body)
        methods = data.get('methods', '')
        
        validated_methods = validate_cors_methods(methods)
        return JsonResponse({'valid': True, 'methods': validated_methods})
        
    except Exception as e:
        return JsonResponse({'valid': False, 'error': str(e)})


@require_http_methods(["POST"])
@csrf_exempt
@login_required
def validate_headers_api(request):
    """API para validar headers"""
    if not is_cors_admin(request.user):
        return JsonResponse({'error': 'No autorizado'}, status=403)
    
    try:
        data = json.loads(request.body)
        headers = data.get('headers', '')
        
        validated_headers = validate_cors_headers(headers)
        return JsonResponse({'valid': True, 'headers': validated_headers})
        
    except Exception as e:
        return JsonResponse({'valid': False, 'error': str(e)})


@login_required
@user_passes_test(is_cors_admin)
def get_active_domains_api(request):
    """API para obtener dominios activos (para el middleware)"""
    active_domains = CORSDomain.objects.filter(
        status='active'
    ).values('domain', 'allow_credentials', 'allowed_methods', 'allowed_headers')
    
    return JsonResponse({
        'domains': list(active_domains),
        'timestamp': timezone.now().isoformat()
    })


@login_required
@user_passes_test(is_cors_admin)
def domain_stats(request):
    """Estadísticas de uso de dominios"""
    from django.db.models import Count, Avg
    
    # Estadísticas por estado
    status_stats = CORSDomain.objects.values('status').annotate(
        count=Count('id')
    ).order_by('status')
    
    # Estadísticas por entorno
    env_stats = CORSDomain.objects.values('environment').annotate(
        count=Count('id')
    ).order_by('environment')
    
    # Dominios más usados
    most_used = CORSDomain.objects.filter(
        usage_count__gt=0
    ).order_by('-usage_count')[:10]
    
    # Actividad reciente
    recent_activity = CORSDomainAuditLog.objects.values('action').annotate(
        count=Count('id')
    ).order_by('-count')
    
    context = {
        'status_stats': status_stats,
        'env_stats': env_stats,
        'most_used': most_used,
        'recent_activity': recent_activity,
    }
    
    return render(request, 'cors_management/stats.html', context)