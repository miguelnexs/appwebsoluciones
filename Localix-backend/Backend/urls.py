from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import api_info, health_check

urlpatterns = [
    # Ruta principal - Información de la API
    path('', api_info, name='api-info'),
    
    # Health check
    path('health/', health_check, name='health-check'),
    
    path('admin/', admin.site.urls),
    
    # API URLs
    path('api/auth/', include([
        path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    ])),
    
    path('api/', include('categorias.urls')),
    path('api/', include('productos.urls')),
    path('api/ventas/', include('ventas.urls')),
    path('api/pedidos/', include('pedidos.urls')),
    path('api/usuarios/', include('usuarios.urls')),
    
    # API Pública
    path('api/public/', include('api.urls')),
    
]

# Servir archivos estáticos y de medios en desarrollo
if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Debug URLs (Swagger y Redoc)
if settings.DEBUG:
    # Comentado temporalmente para evitar errores de dependencias
    # from drf_yasg.views import get_schema_view
    # from drf_yasg import openapi
    # from rest_framework import permissions
    
    # schema_view = get_schema_view(
    #     openapi.Info(
    #         title="API Documentation",
    #         default_version='v1',
    #         description="API documentation for E-commerce",
    #         contact=openapi.Contact(email="contact@example.com"),
    #         license=openapi.License(name="BSD License"),
    #     ),
    #     public=True,
    #     permission_classes=(permissions.AllowAny,),
    # )
    
    # urlpatterns += [
    #     path('api/swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    #     path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    # ]
    
    # Debug Toolbar (opcional)
    urlpatterns += [
        path('__debug__/', include('debug_toolbar.urls')),
    ]