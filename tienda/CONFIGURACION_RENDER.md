# Configuración de Render para sobrio-estilo-tienda-main

## Resumen de Cambios

Se ha centralizado la configuración de la API para asegurar que todos los endpoints apunten correctamente al backend desplegado en Render.

## Archivos Modificados

### 1. Nueva Configuración Centralizada
- **`src/config/api.ts`**: Archivo de configuración centralizada que contiene:
  - URL base del backend: `http://72.60.7.133:8001`
  - Función helper para construir URLs completas
  - Función helper para manejar URLs de imágenes

### 2. Archivos Actualizados

#### Servicios
- **`src/services/ventaService.ts`**: Actualizado para usar la configuración centralizada

#### Hooks
- **`src/hooks/useProductos.ts`**: 
  - Importa la configuración centralizada
  - Usa `API_CONFIG.API_URL` para las llamadas a la API
  - Usa la función `getImageUrl` centralizada

- **`src/hooks/useCategorias.ts`**:
  - Importa la configuración centralizada
  - Usa `API_CONFIG.API_URL` para las llamadas a la API

#### Páginas
- **`src/pages/ProductoDetalle.tsx`**:
  - Importa la configuración centralizada
  - Usa `API_CONFIG.API_URL` para las llamadas a la API
  - Usa la función `getImageUrl` centralizada

- **`src/pages/CategoriaPage.tsx`**:
  - Importa la configuración centralizada
  - Usa `API_CONFIG.API_URL` para las llamadas a la API

## URLs Configuradas

### Backend en VPS
- **URL Base**: `http://72.60.7.133:8001`
- **API Endpoint**: `http://72.60.7.133:8001/api`

### Endpoints Principales
- Productos: `/api/productos/productos/`
- Categorías: `/api/categorias/`
- Ventas: `/api/ventas/`
- Pedidos: `/api/pedidos/`

## Funciones Helper

### `buildApiUrl(endpoint: string)`
Construye URLs completas para endpoints de la API.

### `getImageUrl(url: string)`
Maneja URLs de imágenes, asegurando que:
- URLs del VPS se mantengan tal cual
- URLs de localhost se conviertan al VPS
- URLs relativas se completen con el dominio del VPS

## Beneficios de la Centralización

1. **Mantenibilidad**: Un solo lugar para cambiar la URL del backend
2. **Consistencia**: Todas las llamadas usan la misma configuración
3. **Flexibilidad**: Fácil cambio entre desarrollo y producción
4. **Manejo de errores**: Funciones helper centralizadas para URLs

## Verificación

Para verificar que todo funciona correctamente:

1. Ejecutar el proyecto: `npm run dev`
2. Verificar que las imágenes se cargan correctamente
3. Verificar que las llamadas a la API funcionan
4. Revisar la consola del navegador para errores de red

## Notas Importantes

- Todas las URLs ahora apuntan al backend desplegado en el VPS
- Las imágenes se sirven desde el servidor VPS
- El manejo de URLs es robusto y maneja diferentes formatos
- La configuración es fácil de mantener y actualizar
