import React from 'react';
import { Eye, Edit, Trash2, FileText, Settings, MoreHorizontal } from 'lucide-react';

/**
 * Componente estandarizado para botones de acciones en tablas
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onView - Función para ver detalles
 * @param {Function} props.onEdit - Función para editar
 * @param {Function} props.onDelete - Función para eliminar
 * @param {Function} props.onPrint - Función para imprimir (opcional)
 * @param {Function} props.onSettings - Función para configuración (opcional)
 * @param {boolean} props.showView - Mostrar botón ver (default: true)
 * @param {boolean} props.showEdit - Mostrar botón editar (default: true)
 * @param {boolean} props.showDelete - Mostrar botón eliminar (default: true)
 * @param {boolean} props.showPrint - Mostrar botón imprimir (default: false)
 * @param {boolean} props.showSettings - Mostrar botón configuración (default: false)
 * @param {boolean} props.loading - Estado de carga para botones
 * @param {string} props.size - Tamaño de los botones ('sm', 'md', 'lg')
 * @param {string} props.variant - Variante de diseño ('compact', 'full', 'icon-only')
 */
const ActionButtons = ({
  onView,
  onEdit,
  onDelete,
  onPrint,
  onSettings,
  showView = true,
  showEdit = true,
  showDelete = true,
  showPrint = false,
  showSettings = false,
  loading = false,
  size = 'md',
  variant = 'compact'
}) => {
  // Configuración de tamaños
  const sizeConfig = {
    sm: {
      button: 'p-1.5',
      icon: 'w-3 h-3',
      text: 'text-xs',
      gap: 'gap-1'
    },
    md: {
      button: 'p-2',
      icon: 'w-4 h-4',
      text: 'text-xs',
      gap: 'gap-1'
    },
    lg: {
      button: 'p-2.5',
      icon: 'w-5 h-5',
      text: 'text-sm',
      gap: 'gap-1.5'
    }
  };

  const config = sizeConfig[size];

  // Configuración de variantes
  const variantConfig = {
    compact: {
      container: 'flex items-center space-x-1',
      button: `${config.button} rounded transition-colors`,
      showText: false
    },
    full: {
      container: 'flex items-center space-x-2',
      button: `${config.button} rounded transition-colors flex items-center ${config.gap}`,
      showText: true
    },
    'icon-only': {
      container: 'flex items-center space-x-1',
      button: `${config.button} rounded transition-colors`,
      showText: false
    }
  };

  const variantStyle = variantConfig[variant];

  // Estilos base para botones
  const baseButtonStyle = `${variantStyle.button} disabled:opacity-50 disabled:cursor-not-allowed`;

  // Estilos específicos para cada acción
  const buttonStyles = {
    view: `${baseButtonStyle} bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700`,
    edit: `${baseButtonStyle} bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700`,
    delete: `${baseButtonStyle} bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700`,
    print: `${baseButtonStyle} bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700`,
    settings: `${baseButtonStyle} bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700`
  };

  return (
    <div className={variantStyle.container}>
      {/* Botón Ver */}
      {showView && onView && (
        <button
          onClick={onView}
          disabled={loading}
          className={buttonStyles.view}
          title="Ver detalles"
        >
          <Eye className={config.icon} />
          {variantStyle.showText && <span className={config.text}>Ver</span>}
        </button>
      )}

      {/* Botón Editar */}
      {showEdit && onEdit && (
        <button
          onClick={onEdit}
          disabled={loading}
          className={buttonStyles.edit}
          title="Editar"
        >
          <Edit className={config.icon} />
          {variantStyle.showText && <span className={config.text}>Editar</span>}
        </button>
      )}

      {/* Botón Imprimir */}
      {showPrint && onPrint && (
        <button
          onClick={onPrint}
          disabled={loading}
          className={buttonStyles.print}
          title="Imprimir"
        >
          <FileText className={config.icon} />
          {variantStyle.showText && <span className={config.text}>PDF</span>}
        </button>
      )}

      {/* Botón Configuración */}
      {showSettings && onSettings && (
        <button
          onClick={onSettings}
          disabled={loading}
          className={buttonStyles.settings}
          title="Configuración"
        >
          <Settings className={config.icon} />
          {variantStyle.showText && <span className={config.text}>Config</span>}
        </button>
      )}

      {/* Botón Eliminar */}
      {showDelete && onDelete && (
        <button
          onClick={onDelete}
          disabled={loading}
          className={buttonStyles.delete}
          title="Eliminar"
        >
          <Trash2 className={config.icon} />
          {variantStyle.showText && <span className={config.text}>Eliminar</span>}
        </button>
      )}
    </div>
  );
};

export default ActionButtons;
