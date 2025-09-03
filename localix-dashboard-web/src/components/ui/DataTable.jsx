import React from 'react';
import { ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';

/**
 * Componente estandarizado para tablas de datos
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.columns - Configuración de columnas
 * @param {Array} props.data - Datos de la tabla
 * @param {Object} props.sortConfig - Configuración de ordenamiento
 * @param {Function} props.onSort - Función para ordenar
 * @param {boolean} props.loading - Estado de carga
 * @param {string} props.emptyMessage - Mensaje cuando no hay datos
 * @param {string} props.size - Tamaño de la tabla ('sm', 'md', 'lg')
 * @param {boolean} props.striped - Filas alternadas
 * @param {boolean} props.hover - Efecto hover en filas
 */
const DataTable = ({
  columns,
  data,
  sortConfig,
  onSort,
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  size = 'md',
  striped = true,
  hover = true
}) => {
  // Configuración de tamaños
  const sizeConfig = {
    sm: {
      header: 'px-3 py-2',
      cell: 'px-3 py-2',
      text: 'text-xs'
    },
    md: {
      header: 'px-4 py-3',
      cell: 'px-4 py-3',
      text: 'text-sm'
    },
    lg: {
      header: 'px-6 py-4',
      cell: 'px-6 py-4',
      text: 'text-base'
    }
  };

  const config = sizeConfig[size];

  // Función para renderizar el ícono de ordenamiento
  const renderSortIcon = (columnKey) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 ml-1" />
      : <ChevronDown className="w-4 h-4 ml-1" />;
  };

  // Función para renderizar el encabezado
  const renderHeader = () => (
    <thead className="bg-theme-background border-b border-theme-border">
      <tr>
        {columns.map((column, index) => (
          <th
            key={column.key || index}
            className={`
              ${config.header} 
              ${config.text}
              text-left 
              font-medium 
              text-theme-textSecondary 
              uppercase 
              tracking-wider
              ${column.sortable ? 'cursor-pointer hover:bg-theme-secondary transition-colors' : ''}
              ${column.align ? `text-${column.align}` : 'text-left'}
              ${column.width ? `w-${column.width}` : ''}
            `}
            onClick={column.sortable ? () => onSort(column.key) : undefined}
          >
            <div className="flex items-center">
              {column.label}
              {column.sortable && renderSortIcon(column.key)}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );

  // Función para renderizar las filas
  const renderRows = () => {
    if (loading) {
      return (
        <tbody>
          {[...Array(5)].map((_, index) => (
            <tr key={index} className="animate-pulse">
              {columns.map((column, colIndex) => (
                <td key={colIndex} className={`${config.cell} ${config.text}`}>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      );
    }

    if (!data || data.length === 0) {
      return (
        <tbody>
          <tr>
            <td 
              colSpan={columns.length} 
              className={`${config.cell} ${config.text} text-center text-theme-textSecondary py-8`}
            >
              {emptyMessage}
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody className="bg-theme-surface divide-y divide-theme-border">
        {data.map((row, rowIndex) => (
          <tr
            key={row.id || rowIndex}
            className={`
              ${striped && rowIndex % 2 === 0 ? 'bg-theme-surface' : 'bg-theme-background'}
              ${hover ? 'hover:bg-theme-secondary transition-colors' : ''}
            `}
          >
            {columns.map((column, colIndex) => (
              <td
                key={column.key || colIndex}
                className={`
                  ${config.cell} 
                  ${config.text}
                  ${column.align ? `text-${column.align}` : 'text-left'}
                  ${column.className || ''}
                `}
              >
                {column.render ? column.render(row, rowIndex) : row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  };

  return (
    <div className="bg-theme-surface rounded-lg border border-theme-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          {renderHeader()}
          {renderRows()}
        </table>
      </div>
    </div>
  );
};

export default DataTable;
