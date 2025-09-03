import React from 'react';
import { useConnectionGuard } from '../../hooks/useConnectionGuard';

// Ejemplo de página que requiere conexión a la base de datos
const PageWithConnectionGuard = () => {
  const { ConnectionGuard } = useConnectionGuard();

  return (
    <ConnectionGuard>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Página que requiere conexión</h1>
        <p className="text-gray-600">
          Esta página solo se mostrará cuando haya conexión a la base de datos.
          Si no hay conexión, se mostrará automáticamente la página de error.
        </p>
        
        {/* Contenido de la página */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-2">Datos de la base de datos</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Aquí se mostrarían los datos obtenidos de la base de datos...
          </p>
        </div>
      </div>
    </ConnectionGuard>
  );
};

// Ejemplo de página que NO requiere conexión (como configuración)
const PageWithoutConnectionGuard = () => {
  const { ConnectionGuard } = useConnectionGuard();

  return (
    <ConnectionGuard showOnError={false}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Página de configuración</h1>
        <p className="text-gray-600">
          Esta página se puede mostrar incluso sin conexión a la base de datos.
        </p>
        
        {/* Contenido de configuración */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-2">Configuración local</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Configuraciones que no requieren conexión a la base de datos...
          </p>
        </div>
      </div>
    </ConnectionGuard>
  );
};

export { PageWithConnectionGuard, PageWithoutConnectionGuard };
