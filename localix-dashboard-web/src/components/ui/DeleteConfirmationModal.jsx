import React from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  X, 
  CheckCircle,
  Info
} from 'lucide-react';

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirmar eliminación',
  message = '¿Estás seguro de que deseas eliminar este elemento?',
  itemName = '',
  itemType = 'elemento',
  showWarning = true,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  dangerLevel = 'medium' // 'low', 'medium', 'high'
}) => {
  if (!isOpen) return null;

  const getDangerStyles = () => {
    switch (dangerLevel) {
      case 'high':
        return {
          border: 'border-red-300',
          bg: 'bg-red-100',
          icon: 'text-red-700',
          button: 'bg-red-700 hover:bg-red-800',
          title: 'text-red-900',
          message: 'text-red-800'
        };
      case 'medium':
        return {
          border: 'border-red-200',
          bg: 'bg-red-50',
          icon: 'text-red-600',
          button: 'bg-red-600 hover:bg-red-700',
          title: 'text-red-800',
          message: 'text-red-700'
        };
      case 'low':
        return {
          border: 'border-red-200',
          bg: 'bg-red-50',
          icon: 'text-red-500',
          button: 'bg-red-500 hover:bg-red-600',
          title: 'text-red-700',
          message: 'text-red-600'
        };
      default:
        return {
          border: 'border-orange-200',
          bg: 'bg-orange-50',
          icon: 'text-orange-600',
          button: 'bg-orange-600 hover:bg-orange-700',
          title: 'text-orange-800',
          message: 'text-orange-700'
        };
    }
  };

  const styles = getDangerStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay con animación */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal centrado */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className={`relative bg-theme-surface rounded-lg shadow-xl max-w-sm w-full mx-4 transform transition-all duration-300 scale-100 opacity-100 ${styles.border} border-2`}
          style={{
            animation: 'modalSlideIn 0.3s ease-out'
          }}
        >
          {/* Header con gradiente */}
          <div className={`${styles.bg} px-6 py-4 rounded-t-2xl border-b ${styles.border}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${styles.bg} ${styles.border} border`}>
                  <AlertTriangle className={`h-6 w-6 ${styles.icon}`} />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${styles.title}`}>
                    {title}
                  </h3>
                  <p className={`text-sm ${styles.message} mt-1`}>
                    Acción irreversible
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-theme-textSecondary hover:text-theme-textSecondary transition-colors p-1 rounded-full hover:bg-theme-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="px-4 py-4">
            {/* Icono principal */}
            <div className="flex justify-center mb-3">
              <div className={`p-3 rounded-full ${styles.bg} ${styles.border} border-2`}>
                <Trash2 className={`h-6 w-6 ${styles.icon}`} />
              </div>
            </div>

            {/* Mensaje principal */}
            <div className="text-center mb-4">
              <h4 className="text-lg font-semibold text-theme-text mb-2">
                ¿Eliminar {itemType}?
              </h4>
              {itemName && (
                <p className="text-base font-medium text-theme-textSecondary mb-2">
                  "{itemName}"
                </p>
              )}
              <p className="text-sm text-theme-textSecondary leading-relaxed">
                {message}
              </p>
            </div>

            {/* Advertencia */}
            {showWarning && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-800">
                    <p className="text-amber-700">
                      Una vez eliminado, no podrás recuperar este {itemType}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-3 py-2 text-theme-textSecondary bg-theme-secondary hover:bg-theme-border rounded-md font-medium transition-colors duration-200 flex items-center justify-center gap-1 text-sm"
              >
                <X className="h-3 w-3" />
                {cancelText}
              </button>
              <button
                onClick={async () => {
                  try {
                    console.log('🔄 Confirmando eliminación...');
                    await onConfirm();
                    console.log('✅ Eliminación confirmada exitosamente');
                  } catch (error) {
                    console.error('❌ Error en confirmación:', error);
                  } finally {
                    onClose();
                  }
                }}
                className={`flex-1 px-3 py-2 text-white ${styles.button} rounded-md font-medium transition-colors duration-200 flex items-center justify-center gap-1 shadow-md hover:shadow-lg transform hover:scale-105 text-sm`}
              >
                <Trash2 className="h-3 w-3" />
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
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
      `}</style>
    </div>
  );
};

export default DeleteConfirmationModal;
