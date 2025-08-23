from django.urls import path, include
from rest_framework.routers import DefaultRouter
from productos.views.productos import ProductoViewSet
from productos.views.variantes import VarianteProductoViewSet
from productos.views.colores import (
    ColorProductoListCreateView,
    ColorProductoDetailView,
    ImagenProductoListCreateView,
    ImagenProductoDetailView,
    reordenar_imagenes,
    establecer_imagen_principal,
    colores_producto_publico
)
from productos.views.caracteristicas import (
    CaracteristicaProductoListCreateView,
    CaracteristicaProductoDetailView,
    caracteristicas_producto_publico
)
from django.conf import settings
from django.conf.urls.static import static

# Main router
router = DefaultRouter()
router.register(r'productos', ProductoViewSet, basename='producto')
router.register(r'variantes', VarianteProductoViewSet, basename='variante')

urlpatterns = [
    # Custom image upload endpoints
    path('productos/<slug:slug>/upload_imagen_principal/', 
         ProductoViewSet.as_view({'post': 'upload_imagen_principal'}), 
         name='producto-upload-imagen-principal'),
    
    # Colores endpoints
    path('productos/<int:producto_id>/colores/', 
         ColorProductoListCreateView.as_view(), 
         name='producto-colores-list'),
    path('productos/<int:producto_id>/colores/<int:pk>/', 
         ColorProductoDetailView.as_view(), 
         name='producto-colores-detail'),
    
    # Imágenes endpoints
    path('colores/<int:color_id>/imagenes/', 
         ImagenProductoListCreateView.as_view(), 
         name='color-imagenes-list'),
    path('colores/<int:color_id>/imagenes/<int:pk>/', 
         ImagenProductoDetailView.as_view(), 
         name='color-imagenes-detail'),
    
    # Endpoints especiales para colores
    path('colores/<int:color_id>/reordenar-imagenes/', 
         reordenar_imagenes, 
         name='reordenar-imagenes'),
    path('colores/<int:color_id>/imagenes/<int:imagen_id>/establecer-principal/', 
         establecer_imagen_principal, 
         name='establecer-imagen-principal'),
    
    # Endpoints públicos para colores
    path('productos/<int:producto_id>/colores-publico/', 
         colores_producto_publico, 
         name='colores-producto-publico'),
    
    # Características endpoints
    path('productos/<int:producto_id>/caracteristicas/', 
         CaracteristicaProductoListCreateView.as_view(), 
         name='producto-caracteristicas-list'),
    path('productos/<int:producto_id>/caracteristicas/<int:pk>/', 
         CaracteristicaProductoDetailView.as_view(), 
         name='producto-caracteristicas-detail'),
    
    # Endpoints públicos para características
    path('productos/<int:producto_id>/caracteristicas-publico/', 
         caracteristicas_producto_publico, 
         name='caracteristicas-producto-publico'),
    
    # Include routers
    path('', include(router.urls)),
]

# Serve media files in development only
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)