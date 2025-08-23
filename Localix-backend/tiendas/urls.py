from django.urls import path
from . import views

app_name = 'tiendas'

urlpatterns = [
    # URLs para gestión de tiendas (autenticadas)
    path('', views.TiendaVirtualListCreateView.as_view(), name='tienda-list-create'),
    path('<int:pk>/', views.TiendaVirtualDetailView.as_view(), name='tienda-detail'),
    path('mi-tienda/', views.mi_tienda, name='mi-tienda'),
    path('configuracion/', views.ConfiguracionTiendaView.as_view(), name='configuracion-tienda'),
    path('activar/', views.activar_tienda, name='activar-tienda'),
    path('estadisticas/', views.estadisticas_tienda, name='estadisticas-tienda'),
    
    # URLs públicas para tiendas
    path('publica/<slug:slug>/', views.TiendaVirtualPublicaView.as_view(), name='tienda-publica'),
    path('publica/<slug:slug>/completa/', views.TiendaVirtualConProductosView.as_view(), name='tienda-completa'),
    path('publica/<slug:slug>/productos/', views.productos_tienda_publica, name='productos-tienda-publica'),
    path('publica/<slug:slug>/categorias/', views.categorias_tienda_publica, name='categorias-tienda-publica'),
    path('publica/<slug:slug>/producto/<slug:producto_slug>/', views.producto_detalle_tienda, name='producto-detalle-tienda'),
    
    # Búsqueda de tiendas
    path('buscar/', views.buscar_tiendas, name='buscar-tiendas'),
]