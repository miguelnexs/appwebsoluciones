import React from 'react';

interface ProductCharacteristicsProps {
  className?: string;
}

const ProductCharacteristics: React.FC<ProductCharacteristicsProps> = ({ className }) => {
  // Características específicas del producto basadas en el div seleccionado
  const productCharacteristics = [
    {
      name: 'Material',
      value: 'Cuero sintético de alta calidad',
      hasValue: true
    },
    {
      name: 'Dimensiones',
      value: '30cm x 25cm x 15cm',
      hasValue: true
    },
    {
      name: 'Peso',
      value: '0.8 kg',
      hasValue: true
    },
    {
      name: 'Compartimentos',
      value: '3 compartimentos principales + 2 bolsillos internos',
      hasValue: true
    },
    {
      name: 'Cierre',
      value: 'Cremallera metálica resistente',
      hasValue: true
    },
    {
      name: 'Asas',
      value: 'Dobles con refuerzo, altura ajustable',
      hasValue: true
    },
    {
      name: 'Forro interior',
      value: 'Tela impermeable con patrón de marca',
      hasValue: true
    },
    {
      name: 'Cuidado',
      value: 'Limpiar con paño húmedo, no sumergir en agua',
      hasValue: true
    },
    {
      name: 'Garantía',
      value: '3 meses contra defectos de fabricación',
      hasValue: true
    },
    {
      name: 'Origen',
      value: 'Fabricado en Colombia',
      hasValue: true
    }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      <div className="bg-gradient-to-r from-neutral-800 to-neutral-600 text-white p-6 rounded-t-lg">
        <h3 className="text-xl font-semibold mb-2">Características del Producto</h3>
        <p className="text-neutral-200 text-sm">Especificaciones técnicas y detalles</p>
      </div>
      
      <div className="p-6">
        <div className="grid gap-4">
          {productCharacteristics.map((characteristic, index) => (
            <div 
              key={index}
              className="group border border-gray-200 rounded-lg p-4 hover:border-neutral-400 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-neutral-600 rounded-full mr-3"></span>
                    {characteristic.name}
                  </h4>
                  {characteristic.hasValue && (
                    <div className="ml-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-md border-l-4 border-neutral-600">
                        {characteristic.value}
                      </p>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Disponible
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-neutral-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-neutral-800">Información del producto</h4>
              <p className="text-sm text-neutral-700 mt-1">
                Estas características corresponden al producto mostrado en el div seleccionado de la página de detalle. 
                Pasa el mouse sobre cada característica para ver los detalles específicos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCharacteristics;