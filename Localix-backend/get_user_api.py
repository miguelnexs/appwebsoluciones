#!/usr/bin/env python
"""
Script para obtener información de API de un usuario específico
Uso: python get_user_api.py <username>
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')
django.setup()

from usuarios.models import Usuario

def get_user_api_info(username):
    """
    Obtiene la información de API para un usuario específico
    """
    try:
        # Buscar el usuario por username
        user = Usuario.objects.get(username=username)
        
        # Verificar si el usuario tiene acceso público
        if not user.allow_public_access:
            print(f"❌ El usuario '{username}' no tiene acceso público habilitado.")
            return False
            
        # Verificar si el usuario está activo
        if not user.es_activo:
            print(f"❌ El usuario '{username}' no está activo.")
            return False
            
        # Mostrar información de la API
        print("=" * 60)
        print(f"🔑 INFORMACIÓN DE API PARA: {user.username}")
        print("=" * 60)
        print(f"📧 Email: {user.email}")
        print(f"🔐 API Key: {user.api_key}")
        print(f"✅ Acceso Público: {'Sí' if user.allow_public_access else 'No'}")
        print(f"🟢 Estado: {'Activo' if user.es_activo else 'Inactivo'}")
        print(f"📅 Fecha de creación: {user.date_joined.strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Información de la API
        print("🌐 CONFIGURACIÓN DE API:")
        print("-" * 40)
        print("Base URL: http://127.0.0.1:8000/api/")
        print()
        print("Headers requeridos:")
        print(f"  Authorization: Bearer {user.api_key}")
        print("  Content-Type: application/json")
        print()
        
        # Endpoints disponibles
        print("📋 ENDPOINTS DISPONIBLES:")
        print("-" * 40)
        print("• GET /api/user/          - Información del usuario")
        print("• GET /api/productos/     - Lista de productos")
        print("• GET /api/categorias/    - Lista de categorías")
        print("• GET /api/pedidos/       - Lista de pedidos")
        print()
        
        # Ejemplos de uso
        print("💡 EJEMPLOS DE USO:")
        print("-" * 40)
        print("# Curl - Obtener información del usuario:")
        print(f'curl -H "Authorization: Bearer {user.api_key}" \\')
        print('     -H "Content-Type: application/json" \\')
        print('     http://127.0.0.1:8000/api/user/')
        print()
        
        print("# Curl - Obtener productos:")
        print(f'curl -H "Authorization: Bearer {user.api_key}" \\')
        print('     -H "Content-Type: application/json" \\')
        print('     http://127.0.0.1:8000/api/productos/')
        print()
        
        print("# JavaScript - Fetch API:")
        print("const response = await fetch('http://127.0.0.1:8000/api/user/', {")
        print("  method: 'GET',")
        print("  headers: {")
        print(f"    'Authorization': 'Bearer {user.api_key}',")
        print("    'Content-Type': 'application/json'")
        print("  }")
        print("});")
        print("const data = await response.json();")
        print()
        
        print("# Python - Requests:")
        print("import requests")
        print()
        print("headers = {")
        print(f"    'Authorization': 'Bearer {user.api_key}',")
        print("    'Content-Type': 'application/json'")
        print("}")
        print()
        print("response = requests.get('http://127.0.0.1:8000/api/user/', headers=headers)")
        print("data = response.json()")
        print()
        
        print("=" * 60)
        return True
        
    except Usuario.DoesNotExist:
        print(f"❌ Usuario '{username}' no encontrado.")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    """
    Función principal del script
    """
    if len(sys.argv) != 2:
        print("❌ Uso incorrecto.")
        print("📖 Uso: python get_user_api.py <username>")
        print()
        print("Ejemplos:")
        print("  python get_user_api.py valencia")
        print("  python get_user_api.py admin")
        sys.exit(1)
    
    username = sys.argv[1]
    success = get_user_api_info(username)
    
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()