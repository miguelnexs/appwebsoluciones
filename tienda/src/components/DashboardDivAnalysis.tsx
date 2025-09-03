import React from 'react';

interface DivCharacteristic {
  name: string;
  value: string;
  hasValue: boolean;
}

const DashboardDivAnalysis: React.FC = () => {
  // Características del div de la tabla de características de productos del dashboard
  const divCharacteristics: DivCharacteristic[] = [
    {
      name: "Elemento HTML",
      value: "div",
      hasValue: true
    },
    {
      name: "Clases CSS",
      value: "bg-theme-surface border border-theme-border rounded-xl overflow-hidden",
      hasValue: true
    },
    {
      name: "Componente padre",
      value: "ProductFormCaracteristicas",
      hasValue: true
    },
    {
      name: "Línea de código",
      value: "229",
      hasValue: true
    },
    {
      name: "Propósito",
      value: "Contenedor de tabla para mostrar características de productos",
      hasValue: true
    },
    {
      name: "Estructura interna",
      value: "Contiene una tabla (table) con thead y tbody",
      hasValue: true
    },
    {
      name: "Elementos hijos",
      value: "table > thead > tr > th (5 columnas: Nombre, Valor, Orden, Estado, Acciones)",
      hasValue: true
    },
    {
      name: "Espaciado",
      value: "Sin padding interno, overflow-hidden para bordes redondeados",
      hasValue: true
    },
    {
      name: "Interactividad",
      value: "Filas con hover:bg-theme-background, botones de editar y eliminar",
      hasValue: true
    },
    {
      name: "Responsividad",
      value: "min-w-full en la tabla para scroll horizontal en pantallas pequeñas",
      hasValue: true
    },
    {
      name: "Estado condicional",
      value: "Muestra mensaje 'No hay características configuradas' cuando está vacío",
      hasValue: true
    },
    {
      name: "Tema",
      value: "Utiliza variables de tema (theme-surface, theme-border, theme-background)",
      hasValue: true
    },
    {
      name: "Funcionalidad",
      value: "CRUD completo de características: crear, leer, actualizar, eliminar",
      hasValue: true
    },
    {
      name: "Datos mostrados",
      value: "nombre, valor, orden, estado (activo/inactivo) de cada característica",
      hasValue: true
    },
    {
      name: "Acciones disponibles",
      value: "Editar (ícono Edit) y Eliminar (ícono Trash2) por cada característica",
      hasValue: true
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Análisis del Div de Características de Productos - Dashboard Localix
        </h1>
        <p className="text-gray-600 mb-6">
          Análisis detallado del elemento div que contiene la tabla de características de productos 
          en el componente ProductFormCaracteristicas.jsx del dashboard de Localix.
        </p>
        
        {/* Código original del div */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Código del Div Original:</h3>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <div className="text-gray-500">// Línea 229 en ProductFormCaracteristicas.jsx</div>
            <div className="mt-2">
              &lt;div className="bg-theme-surface border border-theme-border rounded-xl overflow-hidden"&gt;
            </div>
            <div className="ml-4 text-blue-400">
              &lt;table className="min-w-full"&gt;
            </div>
            <div className="ml-8 text-yellow-400">
              &lt;thead className="bg-theme-background"&gt;
            </div>
            <div className="ml-12 text-purple-400">
              &lt;tr&gt;
            </div>
            <div className="ml-16 text-pink-400">
              &lt;th&gt;Nombre&lt;/th&gt;
            </div>
            <div className="ml-16 text-pink-400">
              &lt;th&gt;Valor&lt;/th&gt;
            </div>
            <div className="ml-16 text-pink-400">
              &lt;th&gt;Orden&lt;/th&gt;
            </div>
            <div className="ml-16 text-pink-400">
              &lt;th&gt;Estado&lt;/th&gt;
            </div>
            <div className="ml-16 text-pink-400">
              &lt;th&gt;Acciones&lt;/th&gt;
            </div>
            <div className="ml-12 text-purple-400">
              &lt;/tr&gt;
            </div>
            <div className="ml-8 text-yellow-400">
              &lt;/thead&gt;
            </div>
            <div className="ml-8 text-yellow-400">
              &lt;tbody&gt;...&lt;/tbody&gt;
            </div>
            <div className="ml-4 text-blue-400">
              &lt;/table&gt;
            </div>
            <div>
              &lt;/div&gt;
            </div>
          </div>
        </div>
      </div>

      {/* Lista de características */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Características del Div Analizado
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Pasa el mouse sobre cada característica para ver su valor
          </p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {divCharacteristics.map((characteristic, index) => (
            <div
              key={index}
              className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {characteristic.name}
                  </div>
                  {characteristic.hasValue && (
                    <div className="mt-1 text-sm text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                        {characteristic.value}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Contexto del Dashboard
        </h3>
        <div className="text-blue-800 space-y-2">
          <p>
            <strong>Archivo:</strong> ProductFormCaracteristicas.jsx
          </p>
          <p>
            <strong>Ubicación:</strong> /src/renderer/src/components/productos/
          </p>
          <p>
            <strong>Función:</strong> Gestión completa de características de productos (CRUD)
          </p>
          <p>
            <strong>Tecnologías:</strong> React, Tailwind CSS, Lucide Icons, Electron API
          </p>
          <p>
            <strong>Estado:</strong> Maneja loading, error, success y datos de características
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardDivAnalysis;