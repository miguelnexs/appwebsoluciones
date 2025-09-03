import React, { useState } from 'react';
import { useDeleteConfirmation } from '../../hooks/useDeleteConfirmation';
import { useToast } from '../../hooks/useToast';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const DeleteConfirmationExample = () => {
  const { deleteModal, hideDeleteConfirmation, showDeleteConfirmation } = useDeleteConfirmation();
  const toast = useToast();
  const [items, setItems] = useState([
    { id: 1, name: 'Producto Premium', type: 'producto', dangerLevel: 'medium' },
    { id: 2, name: 'Categoría Importante', type: 'categoría', dangerLevel: 'high' },
    { id: 3, name: 'Cliente VIP', type: 'cliente', dangerLevel: 'low' },
    { id: 4, name: 'Venta #12345', type: 'venta', dangerLevel: 'high' },
  ]);

  const handleDeleteItem = (item) => {
    showDeleteConfirmation({
      itemName: item.name,
      itemType: item.type,
      dangerLevel: item.dangerLevel,
      title: `Eliminar ${item.type}`,
      message: `¿Estás seguro de que deseas eliminar este ${item.type}? Esta acción no se puede deshacer.`,
      onConfirm: () => {
        // Simular eliminación
        setItems(prev => prev.filter(i => i.id !== item.id));
        toast.showDeleteSuccess(item.name);
      }
    });
  };

  const getDangerColor = (level) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-theme-secondary text-theme-text border-theme-border';
    }
  };

  const getDangerIcon = (level) => {
    switch (level) {
      case 'high': return '🔴';
      case 'medium': return '🟠';
      case 'low': return '🟡';
      default: return '⚪';
    }
  };

  return (
    <div className="p-6 bg-theme-surface rounded-lg shadow-sm border border-theme-border">
      <h2 className="text-xl font-semibold text-theme-text mb-4">
        Ejemplos de Confirmación de Eliminación
      </h2>
      <p className="text-theme-textSecondary mb-6">
        Haz clic en cualquier elemento para ver el modal de confirmación de eliminación:
      </p>
      
      <div className="grid gap-4">
        {items.map((item) => (
          <div 
            key={item.id}
            className={`p-4 rounded-lg border-2 ${getDangerColor(item.dangerLevel)} transition-all duration-200 hover:scale-105 cursor-pointer`}
            onClick={() => handleDeleteItem(item)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getDangerIcon(item.dangerLevel)}</span>
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm opacity-75">Tipo: {item.type}</p>
                  <p className="text-xs opacity-60">Nivel de peligro: {item.dangerLevel}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">Haz clic para eliminar</div>
                <div className="text-xs opacity-75">Modal personalizado</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Características del Modal:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Diseño moderno con animaciones suaves</li>
          <li>• Diferentes niveles de peligro (bajo, medio, alto)</li>
          <li>• Colores adaptativos según el tipo de elemento</li>
          <li>• Mensajes personalizados por tipo</li>
          <li>• Efectos hover y transiciones</li>
          <li>• Integración con el sistema de toasts</li>
        </ul>
      </div>

      {/* Modal de Confirmación */}
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

export default DeleteConfirmationExample; 
