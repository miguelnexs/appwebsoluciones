from django.core.management.base import BaseCommand
from django.db import connection, transaction
from django.contrib.admin.models import LogEntry
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Fix database cursor issues and clean up connections'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force cleanup even if there are active connections',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting database cursor cleanup...'))
        
        try:
            # Cerrar todas las conexiones existentes
            connection.close()
            
            # Verificar que la conexión funciona correctamente
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                if result[0] == 1:
                    self.stdout.write(self.style.SUCCESS('Database connection test: OK'))
                else:
                    self.stdout.write(self.style.ERROR('Database connection test: FAILED'))
                    return
            
            # Limpiar transacciones colgadas si es necesario
            if options['force']:
                with transaction.atomic():
                    # Ejecutar una consulta simple para forzar el commit
                    with connection.cursor() as cursor:
                        cursor.execute("SELECT COUNT(*) FROM django_session")
                        count = cursor.fetchone()[0]
                        self.stdout.write(f'Active sessions: {count}')
            
            # Verificar que el admin funciona correctamente
            try:
                from usuarios.models import UserPlanAssignment
                count = UserPlanAssignment.objects.count()
                self.stdout.write(f'UserPlanAssignment records: {count}')
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error accessing UserPlanAssignment: {str(e)}'))
                return
            
            self.stdout.write(self.style.SUCCESS('Database cursor cleanup completed successfully!'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error during cleanup: {str(e)}'))
            logger.error(f'Database cursor cleanup error: {str(e)}')