import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronUp, ChevronDown, ArrowUpDown, GripVertical } from 'lucide-react';

/**
 * Componente de fila arrastrable
 */
const SortableRow = ({ id, children, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    boxShadow: isDragging ? '0 10px 25px rgba(0, 0, 0, 0.15)' : 'none',
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...props}
      className={`${props.className || ''} ${isDragging ? 'z-50 bg-white border-2 border-blue-200 rounded-lg' : ''} transition-all duration-200 ease-in-out`}
    >
      {/* Columna de arrastre */}
      <td className="px-2 py-3 text-center">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-all duration-200 ease-in-out transform hover:scale-110"
          title="Arrastrar para reordenar"
        >
          <GripVertical className="w-4 h-4 text-gray-400 hover:text-blue-600 transition-colors" />
        </div>
      </td>
      {children}
    </tr>
  );
};

/**
 * Componente de tabla con funcionalidad de drag-and-drop
 * Extiende el DataTable existente agregando capacidades de reordenamiento
 */
const DraggableDataTable = ({
  columns,
  data,
  sortConfig,
  onSort,
  onReorder, // Nueva prop para manejar el reordenamiento
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  size = 'md',
  striped = true,
  hover = true,
  dragDisabled = false, // Prop para deshabilitar el drag-and-drop
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Función para manejar el final del arrastre
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = data.findIndex((item) => item.id === active.id);
      const newIndex = data.findIndex((item) => item.id === over.id);
      
      const newData = arrayMove(data, oldIndex, newIndex);
      
      // Llamar a la función de reordenamiento proporcionada por el padre
      if (onReorder) {
        onReorder(newData);
      }
    }
  };

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
        {/* Columna adicional para el handle de arrastre */}
        {!dragDisabled && (
          <th className={`${config.header} ${config.text} text-center font-medium text-theme-textSecondary uppercase tracking-wider w-12`}>
            <div className="flex items-center justify-center" title="Columna de reordenamiento">
              <GripVertical className="w-4 h-4 text-blue-400 opacity-70" />
            </div>
          </th>
        )}
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
              {!dragDisabled && (
                <td className={`${config.cell} ${config.text} text-center`}>
                  <div className="h-4 bg-gray-200 rounded w-4 mx-auto"></div>
                </td>
              )}
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
              colSpan={columns.length + (dragDisabled ? 0 : 1)} 
              className={`${config.cell} ${config.text} text-center text-theme-textSecondary py-8`}
            >
              {emptyMessage}
            </td>
          </tr>
        </tbody>
      );
    }

    const rowContent = (row, rowIndex) => (
      <>
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
      </>
    );

    if (dragDisabled) {
      // Renderizar filas normales sin drag-and-drop
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
              {rowContent(row, rowIndex)}
            </tr>
          ))}
        </tbody>
      );
    }

    // Renderizar filas con drag-and-drop
    return (
      <tbody className="bg-theme-surface divide-y divide-theme-border">
        <SortableContext items={data.map(item => item.id)} strategy={verticalListSortingStrategy}>
          {data.map((row, rowIndex) => (
            <SortableRow
              key={row.id}
              id={row.id}
              className={`
                ${striped && rowIndex % 2 === 0 ? 'bg-theme-surface' : 'bg-theme-background'}
                ${hover ? 'hover:bg-theme-secondary transition-colors' : ''}
              `}
            >
              {rowContent(row, rowIndex)}
            </SortableRow>
          ))}
        </SortableContext>
      </tbody>
    );
  };

  const tableContent = (
    <div className="bg-theme-surface rounded-lg border border-theme-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          {renderHeader()}
          {renderRows()}
        </table>
      </div>
    </div>
  );

  // Si el drag está deshabilitado, renderizar tabla normal
  if (dragDisabled) {
    return tableContent;
  }

  // Renderizar tabla con contexto de drag-and-drop
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {tableContent}
    </DndContext>
  );
};

export default DraggableDataTable;
