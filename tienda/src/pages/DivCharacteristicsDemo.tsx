import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DivCharacteristicsList from '@/components/DivCharacteristicsList';

const DivCharacteristicsDemo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Inicio
            </Button>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Características del Div</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Análisis del Elemento Div Seleccionado
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A continuación se muestran todas las características del elemento div seleccionado 
            en la página de detalle del producto, presentadas en formato de lista como aparecen en el dashboard.
          </p>
        </div>

        {/* Div original de referencia */}
        <div className="mb-8 bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Elemento Original</h3>
          <div className="bg-gray-100 p-4 rounded-md border border-gray-300">
            <code className="text-sm text-gray-700">
              &lt;div className="space-y-6" data-lov-id="src\pages\ProductoDetalle.tsx:315:10"&gt;
              <br />
              &nbsp;&nbsp;{/* Contenido de información del producto */}
              <br />
              &lt;/div&gt;
            </code>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            <strong>Ubicación:</strong> ProductoDetalle.tsx, línea 315
            <br />
            <strong>Función:</strong> Contenedor principal de la información del producto
          </p>
        </div>

        {/* Lista de características */}
        <DivCharacteristicsList />

        {/* Información adicional */}
        <div className="mt-8 bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Contexto Técnico</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Tecnologías Utilizadas</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• React + TypeScript</li>
                <li>• Tailwind CSS</li>
                <li>• Lucide React (iconos)</li>
                <li>• React Router</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Funcionalidades</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Selector de colores interactivo</li>
                <li>• Control de cantidad</li>
                <li>• Información de stock en tiempo real</li>
                <li>• Botón de agregar al carrito</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DivCharacteristicsDemo;