#!/usr/bin/env python
"""
Script para configurar usuarios con acceso público a la API
Uso: python setup_new_user.py <username> <email> <nombre_completo> [password]
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db import transaction
import secrets
import string

User = get_user_model()

def generate_secure_password(length=12):
    """Genera una contraseña segura aleatoria"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(secrets.choice(alphabet) for i in range(length))
    return password

def setup_user(username, email, nombre_completo, password=None):
    """
    Configura un usuario con API key para acceso público
    """
    try:
        with transaction.atomic():
            # Generar contraseña si no se proporciona
            if not password:
                password = generate_secure_password()
            
            # Buscar o crear el usuario
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'nombre_completo': nombre_completo,
                    'rol': 'admin',  # Puedes cambiar esto según necesites
                    'es_activo': True,
                }
            )
            
            if created:
                print(f"✅ Usuario '{username}' creado exitosamente")
                user.set_password(password)
                user.save()
                print(f"🔑 Contraseña establecida: {password}")
            else:
                print(f"ℹ️  Usuario '{username}' ya existe")
                # Actualizar datos si es necesario
                user.email = email
                user.nombre_completo = nombre_completo
                user.save()
                print(f"📝 Datos actualizados")
            
            # Generar API key si no tiene una
            if not user.api_key:
                api_key = user.generate_api_key()
                print(f"🔐 API Key generada: {api_key}")
            else:
                print(f"🔐 API Key existente: {user.api_key}")
            
            # Habilitar acceso público
            user.allow_public_access = True
            user.save()
            print(f"🌐 Acceso público habilitado")
            
            return user.api_key
            
    except Exception as e:
        print(f"❌ Error al configurar usuario: {str(e)}")
        return None

def show_api_usage(username, api_key):
    """
    Muestra ejemplos de uso de la API
    """
    print(f"\n📋 Información de la API para {username}:")
    print(f"🔗 URL Base: http://localhost:8000/api/public/")
    print(f"🔑 API Key: {api_key}")
    print(f"📧 Headers requeridos:")
    print(f"   Authorization: Bearer {api_key}")
    print(f"   Content-Type: application/json")
    
    print(f"\n🎯 Endpoints disponibles:")
    print(f"   GET /api/public/user/          - Información del usuario")
    print(f"   GET /api/public/stats/         - Estadísticas")
    print(f"   GET /api/public/categorias/    - Lista de categorías")
    print(f"   GET /api/public/productos/     - Lista de productos")
    print(f"   GET /api/public/productos/{{id}}/ - Detalle de producto")
    
    print(f"\n💻 Ejemplo con curl:")
    print(f'curl -H "Authorization: Bearer {api_key}" \\')
    print(f'     -H "Content-Type: application/json" \\')
    print(f'     http://localhost:8000/api/public/user/')
    
    print(f"\n🌐 Ejemplo con JavaScript:")
    print(f"""
const apiKey = '{api_key}';
const baseURL = 'http://localhost:8000/api/public/';

// Función para hacer peticiones a la API
async function apiRequest(endpoint) {{
    const response = await fetch(baseURL + endpoint, {{
        headers: {{
            'Authorization': `Bearer ${{apiKey}}`,
            'Content-Type': 'application/json'
        }}
    }});
    return response.json();
}}

// Ejemplos de uso
apiRequest('user/').then(data => console.log('Usuario:', data));
apiRequest('productos/').then(data => console.log('Productos:', data));
apiRequest('categorias/').then(data => console.log('Categorías:', data));
""")

def main():
    if len(sys.argv) < 4:
        print("❌ Uso: python setup_new_user.py <username> <email> <nombre_completo> [password]")
        print("📝 Ejemplo: python setup_new_user.py mipagina info@mipagina.com 'Mi Página Web'")
        sys.exit(1)
    
    username = sys.argv[1]
    email = sys.argv[2]
    nombre_completo = sys.argv[3]
    password = sys.argv[4] if len(sys.argv) > 4 else None
    
    print(f"🔧 Configurando usuario {username}...")
    api_key = setup_user(username, email, nombre_completo, password)
    
    if api_key:
        show_api_usage(username, api_key)
        print(f"\n✅ Configuración completada exitosamente!")
        print(f"💾 Guarda esta información en un lugar seguro")
    else:
        print(f"\n❌ Error en la configuración")
        sys.exit(1)

if __name__ == '__main__':
    main()