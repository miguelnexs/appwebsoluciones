from django.core.management.base import BaseCommand
from usuarios.models import LimitCategory, PlanTemplate, PlanTemplateLimits


class Command(BaseCommand):
    help = 'Inicializa las plantillas de planes predeterminadas con sus límites'

    def handle(self, *args, **options):
        # Definir las plantillas de planes
        plan_templates = {
            'Plan Gratuito': {
                'description': 'Plan básico gratuito con funcionalidades limitadas',
                'limits': {
                    'max_products': {'type': 'number', 'value': '50', 'unlimited': False},
                    'max_categories': {'type': 'number', 'value': '10', 'unlimited': False},
                    'max_monthly_sales': {'type': 'number', 'value': '100', 'unlimited': False},
                    'max_users': {'type': 'number', 'value': '1', 'unlimited': False},
                    'advanced_reports': {'type': 'boolean', 'value': 'false', 'unlimited': False},
                    'api_access': {'type': 'boolean', 'value': 'false', 'unlimited': False},
                    'priority_support': {'type': 'boolean', 'value': 'false', 'unlimited': False},
                    'custom_branding': {'type': 'boolean', 'value': 'false', 'unlimited': False},
                    'multi_location': {'type': 'boolean', 'value': 'false', 'unlimited': False},
                    'data_export': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                    'inventory_alerts': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                    'barcode_scanner': {'type': 'boolean', 'value': 'false', 'unlimited': False},
                    'max_storage_mb': {'type': 'number', 'value': '100', 'unlimited': False},
                    'max_api_calls_daily': {'type': 'number', 'value': '0', 'unlimited': False},
                    'email_support': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                }
            },
            'Plan Básico': {
                'description': 'Plan básico para pequeños negocios',
                'limits': {
                    'max_products': {'type': 'number', 'value': '500', 'unlimited': False},
                    'max_categories': {'type': 'number', 'value': '50', 'unlimited': False},
                    'max_monthly_sales': {'type': 'number', 'value': '1000', 'unlimited': False},
                    'max_users': {'type': 'number', 'value': '3', 'unlimited': False},
                    'advanced_reports': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                    'api_access': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                    'priority_support': {'type': 'boolean', 'value': 'false', 'unlimited': False},
                    'custom_branding': {'type': 'boolean', 'value': 'false', 'unlimited': False},
                    'multi_location': {'type': 'boolean', 'value': 'false', 'unlimited': False},
                    'data_export': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                    'inventory_alerts': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                    'barcode_scanner': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                    'max_storage_mb': {'type': 'number', 'value': '1000', 'unlimited': False},
                    'max_api_calls_daily': {'type': 'number', 'value': '1000', 'unlimited': False},
                    'email_support': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                }
            },
            'Plan Premium': {
                'description': 'Plan avanzado para medianos negocios',
                'limits': {
                    'max_products': {'type': 'number', 'value': '5000', 'unlimited': False},
                    'max_categories': {'type': 'number', 'value': '200', 'unlimited': False},
                    'max_monthly_sales': {'type': 'number', 'value': '10000', 'unlimited': False},
                    'max_users': {'type': 'number', 'value': '10', 'unlimited': False},
                    'advanced_reports': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                    'api_access': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                    'priority_support': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                    'custom_branding': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                    'multi_location': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                    'data_export': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                    'inventory_alerts': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                    'barcode_scanner': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                    'max_storage_mb': {'type': 'number', 'value': '10000', 'unlimited': False},
                    'max_api_calls_daily': {'type': 'number', 'value': '10000', 'unlimited': False},
                    'email_support': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                }
            },
            'Plan Empresarial': {
                'description': 'Plan completo para grandes empresas',
                'limits': {
                    'max_products': {'type': 'unlimited', 'value': '0', 'unlimited': True},
                    'max_categories': {'type': 'unlimited', 'value': '0', 'unlimited': True},
                    'max_monthly_sales': {'type': 'unlimited', 'value': '0', 'unlimited': True},
                    'max_users': {'type': 'number', 'value': '50', 'unlimited': False},
                    'advanced_reports': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                    'api_access': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                    'priority_support': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                    'custom_branding': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                    'multi_location': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                    'data_export': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                    'inventory_alerts': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                    'barcode_scanner': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                    'max_storage_mb': {'type': 'unlimited', 'value': '0', 'unlimited': True},
                    'max_api_calls_daily': {'type': 'unlimited', 'value': '0', 'unlimited': True},
                    'email_support': {'type': 'boolean', 'value': 'true', 'unlimited': False},
                }
            }
        }

        created_templates = 0
        updated_templates = 0
        created_limits = 0
        updated_limits = 0

        for template_name, template_data in plan_templates.items():
            # Crear o actualizar la plantilla
            template, created = PlanTemplate.objects.get_or_create(
                name=template_name,
                defaults={
                    'description': template_data['description'],
                    'is_active': True
                }
            )
            
            if created:
                created_templates += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Plantilla creada: {template_name}')
                )
            else:
                template.description = template_data['description']
                template.save()
                updated_templates += 1
                self.stdout.write(
                    self.style.WARNING(f'↻ Plantilla actualizada: {template_name}')
                )

            # Procesar los límites de la plantilla
            for limit_name, limit_data in template_data['limits'].items():
                try:
                    category = LimitCategory.objects.get(name=limit_name)
                    
                    # Crear o actualizar el límite
                    template_limit, limit_created = PlanTemplateLimits.objects.get_or_create(
                        template=template,
                        category=category,
                        defaults={
                            'limit_type': limit_data['type'],
                            'limit_value': limit_data['value'],
                            'is_unlimited': limit_data['unlimited']
                        }
                    )
                    
                    if limit_created:
                        created_limits += 1
                        self.stdout.write(f'  ✓ Límite creado: {category.display_name}')
                    else:
                        # Actualizar el límite existente
                        template_limit.limit_type = limit_data['type']
                        template_limit.limit_value = limit_data['value']
                        template_limit.is_unlimited = limit_data['unlimited']
                        template_limit.save()
                        updated_limits += 1
                        self.stdout.write(f'  ↻ Límite actualizado: {category.display_name}')
                        
                except LimitCategory.DoesNotExist:
                    self.stdout.write(
                        self.style.ERROR(f'  ✗ Categoría no encontrada: {limit_name}')
                    )
                    self.stdout.write(
                        self.style.WARNING('  Ejecuta primero: python manage.py setup_plan_categories')
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Proceso completado:\n'
                f'   Plantillas:\n'
                f'     - {created_templates} creadas\n'
                f'     - {updated_templates} actualizadas\n'
                f'   Límites:\n'
                f'     - {created_limits} creados\n'
                f'     - {updated_limits} actualizados\n'
                f'   Total: {created_templates + updated_templates} plantillas procesadas'
            )
        )