"""
URLs para la gestión de dominios CORS.
"""

from django.urls import path
from . import views

app_name = 'cors_management'

urlpatterns = [
    # Dashboard principal
    path('', views.cors_dashboard, name='dashboard'),
    
    # Gestión de dominios
    path('domains/', views.domain_list, name='domain_list'),
    path('domains/create/', views.domain_create, name='domain_create'),
    path('domains/<int:domain_id>/edit/', views.domain_edit, name='domain_edit'),
    path('domains/<int:domain_id>/delete/', views.domain_delete, name='domain_delete'),
    path('domains/<int:domain_id>/toggle/', views.domain_toggle_status, name='domain_toggle_status'),
    
    # Auditoría
    path('audit/', views.audit_log, name='audit_log'),
    
    # Estadísticas
    path('stats/', views.domain_stats, name='domain_stats'),
    
    # APIs para validación en tiempo real
    path('api/validate-domain/', views.validate_domain_api, name='validate_domain_api'),
    path('api/validate-methods/', views.validate_methods_api, name='validate_methods_api'),
    path('api/validate-headers/', views.validate_headers_api, name='validate_headers_api'),
    path('api/active-domains/', views.get_active_domains_api, name='active_domains_api'),
]