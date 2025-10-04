from django.urls import path
from . import views

app_name = 'usuarios'

urlpatterns = [
    # Autenticación
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('refresh/', views.RefreshTokenView.as_view(), name='refresh'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    
    # Gestión de usuarios (solo admin)
    path('usuarios/', views.UsuarioListView.as_view(), name='usuario_list'),
    path('usuarios/create/', views.UsuarioCreateView.as_view(), name='usuario_create'),
    path('usuarios/<int:pk>/', views.UsuarioDetailView.as_view(), name='usuario_detail'),
    path('usuarios/<int:user_id>/toggle-status/', views.toggle_user_status, name='toggle_user_status'),
    
    # URLs para gestión de uso
    path('usage/expired/', views.usage_expired, name='usage_expired'),
    path('usage/status/', views.UsageStatusView.as_view(), name='usage_status'),
    path('usage/dashboard/', views.usage_dashboard, name='usage_dashboard'),
    
    # Plan Management URLs
    
    # Limit Categories
    path('limit-categories/', views.LimitCategoryListCreateView.as_view(), name='limit-category-list-create'),
    path('limit-categories/<int:pk>/', views.LimitCategoryDetailView.as_view(), name='limit-category-detail'),
    
    # Plan Templates
    path('plan-templates/', views.PlanTemplateListCreateView.as_view(), name='plan-template-list-create'),
    path('plan-templates/<int:pk>/', views.PlanTemplateDetailView.as_view(), name='plan-template-detail'),
    path('plan-templates/<int:template_id>/limits/', views.PlanTemplateLimitsView.as_view(), name='plan-template-limits'),
    
    # User Plan Limits
    path('user-plan-limits/', views.UserPlanLimitsListView.as_view(), name='user-plan-limits-list'),
    path('user-plan-limits/<int:pk>/', views.UserPlanLimitsDetailView.as_view(), name='user-plan-limits-detail'),
    
    # User Plan Assignments
    path('user-plan-assignments/', views.UserPlanAssignmentListCreateView.as_view(), name='user-plan-assignment-list-create'),
    path('user-plan-assignments/<int:pk>/', views.UserPlanAssignmentDetailView.as_view(), name='user-plan-assignment-detail'),
    
    # Plan Summary and Operations
    path('plan-summary/', views.UserPlanSummaryView.as_view(), name='user-plan-summary'),
    path('plan-summary/<int:user_id>/', views.UserPlanSummaryView.as_view(), name='user-plan-summary-admin'),
    
    # Limit Operations
    path('check-limit/', views.LimitCheckView.as_view(), name='check-limit'),
    path('check-limit/<int:user_id>/', views.LimitCheckView.as_view(), name='check-limit-admin'),
    path('update-usage/', views.LimitUsageUpdateView.as_view(), name='update-usage'),
    path('update-usage/<int:user_id>/', views.LimitUsageUpdateView.as_view(), name='update-usage-admin'),
    
    # Bulk Operations
    path('bulk-assign-limits/', views.BulkLimitAssignmentView.as_view(), name='bulk-assign-limits'),
    path('reset-limits/<int:user_id>/', views.ResetUserLimitsView.as_view(), name='reset-user-limits'),
    
    # Analytics
    path('plan-analytics/', views.PlanAnalyticsView.as_view(), name='plan-analytics'),
]
