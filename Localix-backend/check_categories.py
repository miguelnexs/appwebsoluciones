#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')
django.setup()

from categorias.models import CategoriaProducto

print("=== Verificación de Categorías ===")
print(f"Total de categorías en la base de datos: {CategoriaProducto.objects.count()}")
print("\nCategorías encontradas:")

for categoria in CategoriaProducto.objects.all():
    print(f"- ID: {categoria.id}")
    print(f"  Nombre: {categoria.nombre}")
    print(f"  Slug: {categoria.slug}")
    print(f"  Descripción: {categoria.descripcion or 'Sin descripción'}")
    print(f"  Usuario: {categoria.usuario}")
    print(f"  Fecha creación: {categoria.fecha_creacion}")
    print("---")

if CategoriaProducto.objects.count() == 0:
    print("No hay categorías en la base de datos.")
    print("Esto explica por qué la API devuelve una lista vacía.")