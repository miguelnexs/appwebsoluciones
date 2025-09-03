import React from 'react';

interface DivCharacteristic {
  name: string;
  value: string;
  hasValue: boolean;
}

const DivCharacteristicsList: React.FC = () => {
  const characteristics: DivCharacteristic[] = [
    {
      name: 'Clase CSS',
      value: 'space-y-6',
      hasValue: true
    },
    {
      name: 'Componente',
      value: 'ProductoDetalle.tsx',
      hasValue: true
    },
    {
      name: 'Línea',
      value: '315',
      hasValue: true
    },
    {
      name: 'Tipo de elemento',
      value: 'div',
      hasValue: true
    },
    {
      name: 'Estructura',
      value: 'Contenedor principal de información del producto',
      hasValue: true
    },
    {
      name: 'Elementos hijos',
      value: '6 divs anidados (información básica, descripción, stock, cantidad, botones, información de envío)',
      hasValue: true
    },
    {
      name: 'Espaciado',
      value: 'space-y-6 (espaciado vertical de 1.5rem entre elementos)',
      hasValue: true
    },
    {
      name: 'Propósito',
      value: 'Mostrar toda la información detallada del producto incluyendo precio, descripción, stock y opciones de compra',
      hasValue: true
    },
    {
      name: 'Interactividad',
      value: 'Contiene selectores de color, controles de cantidad y botón de agregar al carrito',
      hasValue: true
    },
    {
      name: 'Responsividad',
      value: 'Adaptable a diferentes tamaños de pantalla',
      hasValue: true
    },
    {
      name: 'Data attributes',
      value: 'data-lov-id, data-lov-name, data-component-path, data-component-line, data-component-file, data-component-name, data-component-content',
      hasValue: true
    },
    {
      name: 'Contexto',
      value: 'Parte de la página de detalle del producto, ubicado en la sección derecha junto a la galería de imágenes',
      hasValue: true
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold mb-2">Características del Div</h2>
          <p className="text-blue-100">Información detallada del elemento seleccionado</p>
        </div>
        
        <div className="p-6">
          <div className="grid gap-4">
            {characteristics.map((characteristic, index) => (
              <div 
                key={index}
                className="group border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      {characteristic.name}
                    </h3>
                    {characteristic.hasValue && (
                      <div className="ml-5">
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-md border-l-4 border-blue-500">
                          {characteristic.value}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Definido
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">Información del elemento</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Este div es el contenedor principal de la información del producto en la página de detalle. 
                  Utiliza Tailwind CSS para el espaciado y contiene todos los elementos interactivos para la compra.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DivCharacteristicsList;