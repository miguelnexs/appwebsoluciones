import React, { useState } from 'react';
import { useDeleteConfirmation } from '../../hooks/useDeleteConfirmation';
import { useToast } from '../../hooks/useToast';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { Package, Trash2, AlertTriangle } from 'lucide-react';

const ProductDeleteExample = () => {
  const { deleteModal, hideDeleteConfirmation, confirmDeleteProduct } = useDeleteConfirmation();
  const toast = useToast();
  const [products, setProducts] = useState([
    { 
      id: 1, 
      name: 'Billetera Premium de Cuero', 
      sku: 'BIL-001',
      price: 299.99,
      stock: 15,
      status: 'publicado',
      dangerLevel: 'medium' 
    },
    { 
      id: 2, 
      name: 'Bolso de Trabajo Ejecutivo', 
      sku: 'BOL-002',
      price: 599.99,
      stock: 8,
      status: 'publicado',
      dangerLevel: 'high' 
    },
    { 
      id: 3, 
      name: 'Cartera de Mano Elegante', 
      sku: 'CAR-003',
      price: 199.99,
      stock: 0,
      status: 'agotado',
      dangerLevel: 'low' 
    },
    { 
      id: 4, 
      name: 'Mochila de Viaje Resistente', 
      sku: 'MOC-004',
      price: 399.99,
      stock: 25,
      status: 'publicado',
      dangerLevel: 'medium' 
    },
  ]);

  const handleDeleteProduct = async (product) => {
    const success = await confirmDeleteProduct(
      async () => {
        // Simular eliminación
        setProducts(prev => prev.filter(p => p.id !== product.id));
      },
      product.name
    );
    
    if (success) {
      toast.showDeleteSuccess(product.name);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'publicado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'borrador': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'agotado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-theme-secondary text-theme-text border-theme-border';
    }
  };

  const getDangerColor = (level) => {
    switch (level) {
      case 'high': return 'bg-red-50 border-red-200';
      case 'medium': return 'bg-orange-50 border-orange-200';
      case 'low': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-theme-background border-theme-border';
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price / 100);
  };

  return (
    <div className="p-6 bg-theme-surface rounded-lg shadow-sm border border-theme-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Package className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-theme-text">
            Ejemplo de Eliminación de Productos
          </h2>
          <p className="text-theme-textSecondary">
            Haz clic en cualquier producto para ver el modal de confirmación
          </p>
        </div>
      </div>
      
      <div className="grid gap-4">
        {products.map((product) => (
          <div 
            key={product.id}
            className={`p-4 rounded-lg border-2 ${getDangerColor(product.dangerLevel)} transition-all duration-200 hover:scale-105 cursor-pointer`}
            onClick={() => handleDeleteProduct(product)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{getDangerIcon(product.dangerLevel)}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-theme-text">{product.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-theme-textSecondary">
                    <div>
                      <span className="font-medium">SKU:</span> {product.sku}
                    </div>
                    <div>
                      <span className="font-medium">Precio:</span> {formatPrice(product.price)}
                    </div>
                    <div>
                      <span className="font-medium">Stock:</span> {product.stock}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm font-medium text-theme-textSecondary">
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar</span>
                </div>
                <div className="text-xs text-theme-textSecondary mt-1">
                  Modal personalizado
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Características del Modal de Productos:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Nivel de peligro adaptativo:</strong> Rojo para productos premium, naranja para normales, amarillo para básicos</li>
              <li>• <strong>Información detallada:</strong> Muestra nombre, SKU, precio y stock del producto</li>
              <li>• <strong>Confirmación clara:</strong> Mensaje específico sobre la eliminación del producto</li>
              <li>• <strong>Integración con toasts:</strong> Notificación de éxito/error automática</li>
              <li>• <strong>Prevención de errores:</strong> Doble confirmación para productos importantes</li>
            </ul>
          </div>
        </div>
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

export default ProductDeleteExample;