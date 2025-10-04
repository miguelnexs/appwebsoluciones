from django.core.management.base import BaseCommand
from usuarios.models import LimitCategory


class Command(BaseCommand):
    help = 'Inicializa las categorías de límites predeterminadas para el sistema de planes'

    def handle(self, *args, **options):
        categories = [
            {
                'name': 'max_products',
                'display_name': 'Máximo de Productos',
                'description': 'Número máximo de productos que puede tener en inventario'
            },
            {
                'name': 'max_categories',
                'display_name': 'Máximo de Categorías',
                'description': 'Número máximo de categorías que puede crear'
            },
            {
                'name': 'max_monthly_sales',
                'display_name': 'Máximo de Ventas Mensuales',
                'description': 'Número máximo de ventas que puede registrar por mes'
            },
            {
                'name': 'max_users',
                'display_name': 'Máximo de Usuarios',
                'description': 'Número máximo de usuarios que puede tener en el sistema'
            },
            {
                'name': 'advanced_reports',
                'display_name': 'Reportes Avanzados',
                'description': 'Acceso a reportes avanzados y análisis detallados'
            },
            {
                'name': 'api_access',
                'display_name': 'Acceso a API',
                'description': 'Acceso a la API pública para integración con otros sistemas'
            },
            {
                'name': 'priority_support',
                'display_name': 'Soporte Prioritario',
                'description': 'Acceso a soporte técnico prioritario'
            },
            {
                'name': 'custom_branding',
                'display_name': 'Marca Personalizada',
                'description': 'Personalización de marca y logotipos'
            },
            {
                'name': 'multi_location',
                'display_name': 'Multi-ubicación',
                'description': 'Gestión de múltiples ubicaciones o tiendas'
            },
            {
                'name': 'data_export',
                'display_name': 'Exportación de Datos',
                'description': 'Capacidad de exportar datos en diferentes formatos'
            },
            {
                'name': 'inventory_alerts',
                'display_name': 'Alertas de Inventario',
                'description': 'Notificaciones automáticas de stock bajo'
            },
            {
                'name': 'barcode_scanner',
                'display_name': 'Escáner de Códigos de Barras',
                'description': 'Funcionalidad de escáner de códigos de barras'
            },
            {
                'name': 'max_storage_mb',
                'display_name': 'Almacenamiento Máximo (MB)',
                'description': 'Espacio máximo de almacenamiento para imágenes y archivos'
            },
            {
                'name': 'max_api_calls_daily',
                'display_name': 'Llamadas API Diarias',
                'description': 'Número máximo de llamadas a la API por día'
            },
            {
                'name': 'email_support',
                'display_name': 'Soporte por Email',
                'description': 'Acceso a soporte técnico por correo electrónico'
            }
        ]

        created_count = 0
        updated_count = 0

        for category_data in categories:
            category, created = LimitCategory.objects.get_or_create(
                name=category_data['name'],
                defaults={
                    'display_name': category_data['display_name'],
                    'description': category_data['description'],
                    'is_active': True
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Categoría creada: {category.display_name}')
                )
            else:
                # Actualizar información si ya existe
                category.display_name = category_data['display_name']
                category.description = category_data['description']
                category.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'↻ Categoría actualizada: {category.display_name}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Proceso completado:\n'
                f'   - {created_count} categorías creadas\n'
                f'   - {updated_count} categorías actualizadas\n'
                f'   - Total: {created_count + updated_count} categorías procesadas'
            )
        )