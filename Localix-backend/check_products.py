#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')
django.setup()

from productos.models import Producto

print('Productos existentes en la base de datos:')
productos = Producto.objects.all()
if productos.exists():
    for p in productos:
        print(f'ID: {p.id}, Nombre: "{p.nombre}", SKU: "{p.sku}"')
else:
    print('No hay productos en la base de datos')

print(f'\nTotal de productos: {productos.count()}')