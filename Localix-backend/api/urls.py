from django.urls import path
from . import views

app_name = 'api'

urlpatterns = [
    # Información del usuario
    path('user/', views.public_user_info, name='user-info'),
    path('stats/', views.public_stats, name='stats'),
    
    # Categorías
    path('categorias/', views.PublicCategoriaListView.as_view(), name='categorias-list'),
    
    # Productos
    path('productos/', views.PublicProductoListView.as_view(), name='productos-list'),
    path('productos/<slug:slug>/', views.PublicProductoDetailView.as_view(), name='producto-detail'),
]