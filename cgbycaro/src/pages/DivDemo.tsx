import React from 'react';
import DivCharacteristics from '../components/DivCharacteristics';

const DivDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Demostración de Características del Div
          </h1>
          <p className="text-neutral-600">
            Componente interactivo que muestra las características del div seleccionado
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Div de ejemplo */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Div de Ejemplo
            </h2>
            <div className="space-y-6 border-2 border-dashed border-neutral-300 p-4 rounded-lg">
              <div>
                <p className="text-sm text-neutral-500 uppercase tracking-wider mb-2">
                  Producto de ejemplo
                </p>
                <h3 className="text-2xl font-light text-neutral-900 tracking-wide mb-4">
                  Producto Demo
                </h3>
                <p className="text-xl font-semibold text-neutral-900 mb-6">
                  $150.000 COP
                </p>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-neutral-900">Color:</h4>
                <div className="flex gap-3">
                  <button className="px-4 py-2 rounded-md border-2 border-neutral-900 bg-neutral-900 text-white">
                    <span className="inline-block w-4 h-4 rounded-full bg-blue-600 mr-2"></span>
                    Azul
                  </button>
                  <button className="px-4 py-2 rounded-md border-2 border-neutral-300 bg-white text-neutral-900">
                    <span className="inline-block w-4 h-4 rounded-full bg-red-600 mr-2"></span>
                    Rojo
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-neutral-900">Descripción</h4>
                <p className="text-neutral-600 leading-relaxed">
                  Este es un div de ejemplo que simula la estructura del div seleccionado.
                </p>
              </div>
            </div>
          </div>
          
          {/* Componente de características */}
          <DivCharacteristics />
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            Instrucciones de Uso
          </h2>
          <div className="space-y-3 text-neutral-600">
            <p>• <strong>Hover:</strong> Pasa el mouse sobre cada característica para ver su valor</p>
            <p>• <strong>Sin valor:</strong> Las características sin valor aparecen en gris y no tienen interacción</p>
            <p>• <strong>Tooltip:</strong> Los valores se muestran en un tooltip oscuro con flecha</p>
            <p>• <strong>Responsive:</strong> El componente se adapta a diferentes tamaños de pantalla</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DivDemo;