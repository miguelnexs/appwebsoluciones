from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import TiendaVirtual, ConfiguracionTienda

@receiver(post_save, sender=TiendaVirtual)
def crear_configuracion_tienda(sender, instance, created, **kwargs):
    """
    Crear configuración por defecto cuando se crea una nueva tienda
    """
    if created:
        ConfiguracionTienda.objects.get_or_create(
            tienda=instance,
            defaults={
                'productos_por_pagina': 12,
                'mostrar_productos_relacionados': True,
                'mostrar_productos_recientes': True,
                'mostrar_productos_populares': True,
                'permitir_comentarios': False,
                'permitir_wishlist': True,
                'permitir_comparacion': True,
                'notificar_nuevos_pedidos': True,
                'notificar_stock_bajo': True,
                'captcha_habilitado': False,
                'ssl_forzado': True,
            }
        )