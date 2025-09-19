#!/usr/bin/env python
"""
Script para configurar el usuario 'apsoluciones' con acceso público a la API
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

def setup_apsoluciones_user():
    """
    Configura el usuario apsoluciones con API key para acceso público
    """
    try:
        with transaction.atomic():
            # Buscar o crear el usuario apsoluciones
            user, created = User.objects.get_or_create(
                username='apsoluciones',
                defaults={
                    'email': 'apsoluciones@example.com',
                    'nombre_completo': 'Apsoluciones',
                    'rol': 'admin',
                    'es_activo': True,
                }
            )
            
            if created:
                print(f"✅ Usuario 'apsoluciones' creado exitosamente")
                # Establecer una contraseña por defecto (cambiar en producción)
                user.set_password('apsoluciones2024')
                user.save()
                print(f"🔑 Contraseña establecida: apsoluciones2024")
            else:
                print(f"ℹ️  Usuario 'apsoluciones' ya existe")
            
            # Generar API key si no tiene una
            if not user.api_key:
                api_key = user.generate_api_key()
                print(f"🔐 API Key generada: {api_key}")
            else:
                print(f"🔐 API Key existente: {user.api_key}")
            
            # Verificar configuración
            print(f"\n📊 Configuración del usuario:")
            print(f"   - Username: {user.username}")
            print(f"   - Email: {user.email}")
            print(f"   - Nombre completo: {user.nombre_completo}")
            print(f"   - Rol: {user.rol}")
            print(f"   - Activo: {user.es_activo}")
            print(f"   - Acceso público: {user.allow_public_access}")
            print(f"   - API Key: {user.api_key}")
            print(f"   - Fecha acceso público: {user.public_access_created_at}")
            
            return user.api_key
            
    except Exception as e:
        print(f"❌ Error configurando usuario apsoluciones: {e}")
        return None

def show_api_usage():
    """
    Muestra ejemplos de uso de la API
    """
    user = User.objects.get(username='apsoluciones')
    api_key = user.api_key
    
    print(f"\n🚀 Ejemplos de uso de la API:")
    print(f"   Base URL: http://localhost:8000/api/public/")
    print(f"   Header: Authorization: ApiKey {api_key}")
    print(f"\n📋 Endpoints disponibles:")
    print(f"   GET /api/public/user/           - Información del usuario")
    print(f"   GET /api/public/stats/          - Estadísticas del catálogo")
    print(f"   GET /api/public/categorias/     - Lista de categorías")
    print(f"   GET /api/public/productos/      - Lista de productos")
    print(f"   GET /api/public/productos/<slug>/ - Detalle de producto")
    
    print(f"\n🌐 Ejemplo con curl:")
    print(f'   curl -H "Authorization: ApiKey {api_key}" http://localhost:8000/api/public/productos/')
    
    print(f"\n📝 Ejemplo con JavaScript:")
    print(f"""   fetch('http://localhost:8000/api/public/productos/', {{
       headers: {{
           'Authorization': 'ApiKey {api_key}'
       }}
   }})
   .then(response => response.json())
   .then(data => console.log(data));""")

if __name__ == '__main__':
    print("🔧 Configurando usuario apsoluciones...")
    api_key = setup_apsoluciones_user()
    
    if api_key:
        show_api_usage()
        print(f"\n✅ Configuración completada exitosamente!")
    else:
        print(f"\n❌ Error en la configuración")
        sys.exit(1)