# Modal de Confirmación de Eliminación

## Descripción

Un modal moderno y atractivo para confirmar acciones de eliminación, con diferentes niveles de peligro y diseño adaptativo según el tipo de elemento a eliminar.

## Características

### 🎨 **Diseño Moderno**
- Modal con bordes redondeados y sombras suaves
- Animaciones de entrada y salida fluidas
- Header con gradiente y colores adaptativos
- Iconos específicos para cada tipo de acción

### ⚠️ **Niveles de Peligro**
- **Alto (High)**: Rojo - Para elementos críticos (ventas, categorías importantes)
- **Medio (Medium)**: Naranja - Para elementos normales (productos, categorías)
- **Bajo (Low)**: Amarillo - Para elementos menores (colores, variantes)

### 🎯 **Funcionalidades**
- Overlay con animación de fade
- Botones con efectos hover
- Mensajes personalizables
- Integración con el sistema de toasts
- Cierre con ESC o clic en overlay

## Uso Básico

### 1. Importar el hook y componente

```jsx
import { useDeleteConfirmation } from '../../hooks/useDeleteConfirmation';
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';
```

### 2. Usar en el componente

```jsx
const MyComponent = () => {
  const { deleteModal, hideDeleteConfirmation, confirmDeleteCategory } = useDeleteConfirmation();
  
  const handleDelete = async (slug, categoryName) => {
    const success = await confirmDeleteCategory(
      async () => {
        // Función de eliminación
        await deleteCategory(slug);
      },
      categoryName
    );
    
    if (success) {
      // Éxito
    } else {
      // Error
    }
  };

  return (
    <div>
      {/* Contenido del componente */}
      
      {/* Modal de confirmación */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={hideDeleteConfirmation}
        onConfirm={deleteModal.onConfirm}
        title={deleteModal.title}
        message={deleteModal.message}
        itemName={deleteModal.itemName}
        itemType={deleteModal.itemType}
        dangerLevel={deleteModal.dangerLevel}
      />
    </div>
  );
};
```

## Métodos Disponibles

### Hook `useDeleteConfirmation`

```jsx
const {
  deleteModal,           // Estado del modal
  showDeleteConfirmation, // Mostrar modal personalizado
  hideDeleteConfirmation, // Ocultar modal
  confirmDelete,         // Confirmación genérica
  confirmDeleteProduct,  // Para productos
  confirmDeleteCategory, // Para categorías
  confirmDeleteClient,   // Para clientes
  confirmDeleteSale,     // Para ventas
  confirmDeleteColor,    // Para colores
  confirmDeleteVariant   // Para variantes
} = useDeleteConfirmation();
```

## Ejemplos de Uso

### Eliminación Simple

```jsx
const handleDelete = async (slug, name) => {
  const success = await confirmDeleteCategory(
    async () => {
      await deleteCategory(slug);
    },
    name
  );
};
```

### Eliminación de Productos

```jsx
const handleDeleteProduct = async (productSlug, productName) => {
  const success = await confirmDeleteProduct(
    async () => {
      await window.electronAPI.productos.eliminar(productSlug);
      fetchProducts(); // Recargar lista
    },
    productName
  );
  
  if (!success) {
    // Manejar error
  }
};
```

### Eliminación con Modal Personalizado

```jsx
const handleDelete = () => {
  showDeleteConfirmation({
    itemName: 'Mi Categoría',
    itemType: 'categoría',
    dangerLevel: 'high',
    title: 'Eliminar Categoría Crítica',
    message: 'Esta categoría contiene productos importantes. ¿Estás seguro?',
    onConfirm: async () => {
      await deleteCategory();
    }
  });
};
```

### Diferentes Niveles de Peligro

```jsx
// Peligro alto (rojo)
showDeleteConfirmation({
  itemName: 'Venta #12345',
  itemType: 'venta',
  dangerLevel: 'high'
});

// Peligro medio (naranja)
showDeleteConfirmation({
  itemName: 'Producto Premium',
  itemType: 'producto',
  dangerLevel: 'medium'
});

// Peligro bajo (amarillo)
showDeleteConfirmation({
  itemName: 'Color Azul',
  itemType: 'color',
  dangerLevel: 'low'
});
```

## Props del Modal

### DeleteConfirmationModal

```jsx
<DeleteConfirmationModal
  isOpen={boolean}           // Si el modal está abierto
  onClose={function}         // Función para cerrar
  onConfirm={function}       // Función de confirmación
  title={string}            // Título del modal
  message={string}          // Mensaje principal
  itemName={string}         // Nombre del elemento
  itemType={string}         // Tipo de elemento
  showWarning={boolean}     // Mostrar advertencia (default: true)
  confirmText={string}      // Texto del botón confirmar (default: 'Eliminar')
  cancelText={string}       // Texto del botón cancelar (default: 'Cancelar')
  dangerLevel={string}      // Nivel de peligro: 'low', 'medium', 'high'
/>
```

## Estilos Adaptativos

### Colores por Nivel de Peligro

```css
/* Alto (High) */
.border-red-200, .bg-red-50, .text-red-600, .bg-red-600

/* Medio (Medium) */
.border-orange-200, .bg-orange-50, .text-orange-600, .bg-orange-600

/* Bajo (Low) */
.border-yellow-200, .bg-yellow-50, .text-yellow-600, .bg-yellow-600
```

## Animaciones

### Entrada del Modal
```css
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

## Integración con Toasts

El modal se integra automáticamente con el sistema de toasts:

- **Éxito**: Muestra toast de eliminación exitosa
- **Error**: Muestra toast de error con detalles
- **Confirmación**: No muestra toast (solo el modal)

## Casos de Uso Específicos

### Productos
- **Nivel de peligro**: Medio (naranja) por defecto
- **Información mostrada**: Nombre, SKU, precio, stock
- **Consideraciones especiales**: Verificar stock antes de eliminar
- **Integración**: Con sistema de inventario y variantes

### Categorías
- **Nivel de peligro**: Alto (rojo) si tiene productos
- **Información mostrada**: Nombre, cantidad de productos
- **Consideraciones especiales**: Verificar productos asociados
- **Integración**: Con sistema de productos

### Clientes
- **Nivel de peligro**: Bajo (amarillo) por defecto
- **Información mostrada**: Nombre, email, ventas asociadas
- **Consideraciones especiales**: Verificar historial de compras
- **Integración**: Con sistema de ventas

## Ventajas

1. **UX Mejorada**: Modal atractivo y profesional
2. **Prevención de Errores**: Confirmación clara y visible
3. **Flexibilidad**: Personalizable para diferentes tipos
4. **Consistencia**: Diseño uniforme en toda la app
5. **Accesibilidad**: Compatible con navegación por teclado
6. **Responsive**: Se adapta a diferentes pantallas

## Consideraciones

- El modal se posiciona centrado en la pantalla
- Se puede cerrar con ESC o clic en overlay
- Los botones tienen efectos hover y focus
- El diseño es consistente con el tema de la app
- Funciona correctamente en dispositivos móviles 