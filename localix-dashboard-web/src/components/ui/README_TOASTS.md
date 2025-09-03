# Sistema de Toasts Mejorado

## Descripción

Se ha implementado un nuevo sistema de toasts moderno y atractivo con animaciones suaves y un diseño consistente. El sistema reemplaza el anterior `react-toastify` con un componente personalizado más integrado con el diseño de la aplicación.

## Características

### ✨ Diseño Moderno
- Bordes redondeados y sombras suaves
- Bordes de color según el tipo de notificación
- Iconos específicos para cada tipo
- Animaciones fluidas de entrada y salida

### 🎨 Tipos de Notificaciones
- **Success**: Verde con icono de check
- **Error**: Rojo con icono de X
- **Warning**: Amarillo con icono de triángulo
- **Info**: Azul con icono de información
- **Loading**: Azul con spinner animado

### ⚡ Funcionalidades
- Barra de progreso automática
- Posicionamiento automático (múltiples toasts)
- Cierre manual con botón X
- Auto-cierre configurable
- Efectos hover
- Diseño responsive

## Uso Básico

### 1. Importar el hook

```jsx
import { useToast } from '../../hooks/useToast';

const MyComponent = () => {
  const toast = useToast();
  
  // Usar los métodos del toast
};
```

### 2. Métodos Disponibles

```jsx
// Métodos básicos
toast.success(title, message, options);
toast.error(title, message, options);
toast.warning(title, message, options);
toast.info(title, message, options);
toast.loading(title, message, options);

// Métodos específicos de la aplicación
toast.showProductSaved(isNew);
toast.showProductError(error);
toast.showCategorySaved(isNew);
toast.showCategoryError(error);
toast.showDeleteSuccess(itemName);
toast.showVentaSuccess(ventaId);
toast.showClienteSaved(isNew);
toast.showNetworkError(error);
toast.showValidationError(field, message);
```

## Ejemplos de Uso

### Notificación Simple

```jsx
toast.success('¡Éxito!', 'Los datos se han guardado correctamente.');
```

### Notificación con Opciones

```jsx
toast.error('Error', 'No se pudo conectar con el servidor.', {
  duration: 8000, // 8 segundos
});
```

### Notificación de Carga

```jsx
const loadingId = toast.loading('Procesando...', 'Guardando cambios...');

// Cuando termine el proceso
toast.dismiss(loadingId);
toast.success('¡Completado!', 'Proceso finalizado exitosamente.');
```

### Métodos Específicos

```jsx
// Para productos
toast.showProductSaved(true); // Nuevo producto
toast.showProductSaved(false); // Producto actualizado
toast.showProductError('Error al guardar');

// Para categorías
toast.showCategorySaved(true); // Nueva categoría
toast.showCategorySaved(false); // Categoría actualizada
toast.showCategoryError('Error al guardar categoría');

// Para eliminaciones
toast.showDeleteSuccess('Producto');

// Para ventas
toast.showVentaSuccess('V-001');

// Para errores de red
toast.showNetworkError('Error de conexión');

// Para errores de validación
toast.showValidationError('Email', 'El email no es válido');
```

## Opciones de Configuración

```jsx
const options = {
  duration: 5000, // Duración en milisegundos (0 = no auto-cierre)
  show: true, // Mostrar inmediatamente
};
```

## Componentes

### Toast.jsx
Componente principal del toast individual con:
- Animaciones de entrada/salida
- Barra de progreso
- Iconos según tipo
- Botón de cierre

### ToastContainer.jsx
Contenedor que maneja múltiples toasts:
- Posicionamiento automático
- Gestión de estado
- API global

### useToast.jsx
Hook que proporciona:
- Métodos de conveniencia
- Métodos específicos de la aplicación
- Integración con el sistema global

## Estilos CSS

Los estilos están en `toast.css` e incluyen:
- Animaciones keyframe
- Clases de utilidad
- Estilos responsive
- Efectos hover

## Migración desde react-toastify

### Antes:
```jsx
import { toast } from 'react-toastify';

toast.success('Mensaje');
```

### Después:
```jsx
import { useToast } from '../../hooks/useToast';

const toast = useToast();
toast.success('Título', 'Mensaje');
```

## Ventajas del Nuevo Sistema

1. **Mejor Integración**: Diseño consistente con la aplicación
2. **Más Control**: Animaciones y estilos personalizables
3. **Mejor UX**: Animaciones más suaves y naturales
4. **Métodos Específicos**: Funciones para casos de uso comunes
5. **Menor Bundle**: No depende de librerías externas
6. **Mejor Rendimiento**: Componentes optimizados

## Consideraciones

- Los toasts se posicionan automáticamente en la esquina superior derecha
- Múltiples toasts se apilan verticalmente
- El sistema es compatible con el tema de la aplicación
- Los toasts son accesibles con teclado
- Funciona correctamente en dispositivos móviles 