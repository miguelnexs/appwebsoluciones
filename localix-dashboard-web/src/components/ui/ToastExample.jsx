import React from 'react';
import { useToast } from '../../hooks/useToast';

const ToastExample = () => {
  const toast = useToast();

  const showExamples = () => {
    // Ejemplo de éxito
    toast.success('¡Operación exitosa!', 'Los datos se han guardado correctamente.');
    
    // Ejemplo de error
    setTimeout(() => {
      toast.error('Error de conexión', 'No se pudo conectar con el servidor.');
    }, 1000);
    
    // Ejemplo de advertencia
    setTimeout(() => {
      toast.warning('Atención', 'Algunos campos están incompletos.');
    }, 2000);
    
    // Ejemplo de información
    setTimeout(() => {
      toast.info('Información', 'Nuevas actualizaciones disponibles.');
    }, 3000);
    
    // Ejemplo de carga
    setTimeout(() => {
      const loadingId = toast.loading('Procesando...', 'Guardando cambios...');
      
      // Simular proceso
      setTimeout(() => {
        toast.dismiss(loadingId);
        toast.success('¡Completado!', 'El proceso se ha finalizado exitosamente.');
      }, 3000);
    }, 4000);
  };

  return (
    <div className="p-6 bg-theme-surface rounded-lg shadow-sm border border-theme-border">
      <h2 className="text-xl font-semibold text-theme-text mb-4">
        Ejemplos de Toasts
      </h2>
      <p className="text-theme-textSecondary mb-4">
        Haz clic en el botón para ver diferentes tipos de notificaciones:
      </p>
      
      <div className="space-y-3">
        <button
          onClick={showExamples}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Mostrar Ejemplos
        </button>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => toast.success('¡Éxito!', 'Operación completada correctamente.')}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Éxito
          </button>
          
          <button
            onClick={() => toast.error('Error', 'Ha ocurrido un error inesperado.')}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Error
          </button>
          
          <button
            onClick={() => toast.warning('Advertencia', 'Ten cuidado con esta acción.')}
            className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
          >
            Advertencia
          </button>
          
          <button
            onClick={() => toast.info('Información', 'Aquí tienes información útil.')}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Información
          </button>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-theme-background rounded-lg">
        <h3 className="text-sm font-semibold text-theme-textSecondary mb-2">Características:</h3>
        <ul className="text-sm text-theme-textSecondary space-y-1">
          <li>• Animaciones suaves de entrada y salida</li>
          <li>• Barra de progreso automática</li>
          <li>• Diferentes tipos de notificaciones</li>
          <li>• Posicionamiento automático</li>
          <li>• Diseño responsive</li>
          <li>• Efectos hover</li>
        </ul>
      </div>
    </div>
  );
};

export default ToastExample; 
