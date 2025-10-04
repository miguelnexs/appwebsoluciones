#!/bin/bash

# Construir el preload de Electron
echo "Construyendo preload..."
npm run build:preload

# Esperar a que el backend esté disponible
echo "Esperando a que el backend esté disponible..."
while ! nc -z backend 8000; do
  sleep 1
done
echo "Backend disponible!"

# Iniciar la aplicación en modo desarrollo
echo "Iniciando aplicación Electron..."
npm run dev