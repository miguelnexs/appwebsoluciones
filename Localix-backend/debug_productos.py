#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')
django.setup()

from productos.models import Producto
from django.contrib.auth.models import User

# Obtener todos los productos
productos = Producto.objects.all()
print(f"Total de productos: {productos.count()}")

for producto in productos:
    print(f"ID: {producto.id}")
    print(f"Nombre: {producto.nombre}")
    print(f"Slug: {producto.slug}")
    print(f"Usuario: {producto.usuario.username}")
    print("---")

# Verificar si hay productos del usuario 'cafe'
try:
    user_cafe = User.objects.get(username='cafe')
    productos_cafe = Producto.objects.filter(usuario=user_cafe)
    print(f"\nProductos del usuario 'cafe': {productos_cafe.count()}")
    
    for producto in productos_cafe:
        print(f"ID: {producto.id}, Nombre: {producto.nombre}, Slug: {producto.slug}")
except User.DoesNotExist:
    print("Usuario 'cafe' no encontrado")