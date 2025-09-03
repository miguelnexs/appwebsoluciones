// Utilidades para aplicar temas automáticamente a componentes

/**
 * Mapeo de clases de Tailwind a clases de tema
 */
export const themeClassMap = {
  // Fondos
  'bg-white': 'bg-theme-surface',
  'bg-gray-50': 'bg-theme-background',
  'bg-gray-100': 'bg-theme-secondary',
  'bg-gray-200': 'bg-theme-border',
  
  // Textos
  'text-gray-900': 'text-theme-text',
  'text-gray-800': 'text-theme-text',
  'text-gray-700': 'text-theme-textSecondary',
  'text-gray-600': 'text-theme-textSecondary',
  'text-gray-500': 'text-theme-textSecondary',
  'text-gray-400': 'text-theme-textSecondary',
  'text-gray-300': 'text-theme-textSecondary',
  
  // Bordes
  'border-gray-200': 'border-theme-border',
  'border-gray-300': 'border-theme-border',
  'border-gray-400': 'border-theme-border',
  'border-gray-500': 'border-theme-border',
  
  // Hover states
  'hover:bg-gray-50': 'hover:bg-theme-secondary',
  'hover:bg-gray-100': 'hover:bg-theme-secondary',
  'hover:text-gray-900': 'hover:text-theme-text',
  'hover:text-gray-700': 'hover:text-theme-textSecondary',
  
  // Dividers
  'divide-gray-200': 'divide-theme-border',
  'divide-gray-300': 'divide-theme-border',
};

/**
 * Aplica clases de tema a una cadena de clases CSS
 */
export function applyThemeClasses(className) {
  if (!className) return className;
  
  let result = className;
  
  // Aplicar mapeo de clases
  Object.entries(themeClassMap).forEach(([oldClass, newClass]) => {
    const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
    result = result.replace(regex, newClass);
  });
  
  return result;
}

/**
 * Aplica clases de tema a un objeto de props
 */
export function applyThemeToProps(props) {
  if (!props || !props.className) return props;
  
  return {
    ...props,
    className: applyThemeClasses(props.className)
  };
}

/**
 * Componente HOC para aplicar temas automáticamente
 */
export function withTheme(Component) {
  return function ThemedComponent(props) {
    const themedProps = applyThemeToProps(props);
    return <Component {...themedProps} />;
  };
}

/**
 * Hook para obtener clases de tema comunes
 */
export function useThemeClasses() {
  return {
    // Contenedores
    container: 'bg-theme-surface border border-theme-border rounded-lg',
    card: 'bg-theme-surface border border-theme-border rounded-lg p-4',
    header: 'bg-theme-surface border-b border-theme-border p-4',
    
    // Textos
    title: 'text-theme-text font-semibold',
    subtitle: 'text-theme-textSecondary text-sm',
    body: 'text-theme-text',
    caption: 'text-theme-textSecondary text-xs',
    
    // Botones
    buttonPrimary: 'bg-theme-primary text-white hover:bg-opacity-90',
    buttonSecondary: 'bg-theme-secondary text-theme-text hover:bg-opacity-90',
    buttonOutline: 'border border-theme-border text-theme-text hover:bg-theme-secondary',
    
    // Tablas
    tableHeader: 'bg-theme-secondary text-theme-textSecondary',
    tableRow: 'hover:bg-theme-secondary',
    tableCell: 'text-theme-text',
    tableCellSecondary: 'text-theme-textSecondary',
    
    // Formularios
    input: 'bg-theme-surface border border-theme-border text-theme-text',
    label: 'text-theme-textSecondary text-sm',
    error: 'text-theme-error text-sm',
    
    // Estados
    success: 'bg-theme-success text-white',
    warning: 'bg-theme-warning text-white',
    error: 'bg-theme-error text-white',
    info: 'bg-theme-accent text-white',
  };
}

/**
 * Función para actualizar automáticamente componentes existentes
 */
export function updateComponentTheme(componentCode) {
  let updatedCode = componentCode;
  
  // Aplicar mapeo de clases
  Object.entries(themeClassMap).forEach(([oldClass, newClass]) => {
    const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
    updatedCode = updatedCode.replace(regex, newClass);
  });
  
  return updatedCode;
}

/**
 * Lista de páginas que necesitan actualización de tema
 */
export const pagesToUpdate = [
  'DashboardPage.jsx',
  'ProductsPage.jsx',
  'OrdersPage.jsx',
  'CustomerPage.jsx',
  'CategoriesPage.jsx',
  'VentasPage.jsx',
  'ProductFormPage.jsx',
  'HelpPage.jsx'
];

// Nota: Los temas verde y morado han sido eliminados para simplificar el sistema

/**
 * Lista de componentes que necesitan actualización de tema
 */
export const componentsToUpdate = [
  'CustomerModal.jsx',
  'ColorSelector.jsx',
  'ProductDialog/index.jsx',
  'ProductForm.jsx',
  'ProductList.jsx',
  'OrderModal.jsx',
  'CartItem.jsx',
  'CartSummary.jsx'
];

export default {
  themeClassMap,
  applyThemeClasses,
  applyThemeToProps,
  withTheme,
  useThemeClasses,
  updateComponentTheme,
  pagesToUpdate,
  componentsToUpdate
};
