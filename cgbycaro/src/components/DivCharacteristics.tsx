import React from 'react';

interface DivCharacteristicsProps {
  className?: string;
}

const DivCharacteristics: React.FC<DivCharacteristicsProps> = ({ className }) => {
  // Características del div seleccionado basadas en la información proporcionada
  const characteristics = [
    { name: 'Clase CSS', value: 'space-y-6' },
    { name: 'Componente', value: 'ProductoDetalle.tsx' },
    { name: 'Línea', value: '315' },
    { name: 'Tipo de elemento', value: 'div' },
    { name: 'Estructura', value: 'Contenedor principal de información del producto' },
    { name: 'Elementos hijos', value: 'Información del producto, colores, descripción, stock, controles de cantidad' },
    { name: 'Espaciado', value: 'space-y-6 (24px entre elementos)' },
    { name: 'Propósito', value: 'Organizar la información detallada del producto' },
    { name: 'Interactividad', value: 'Contiene elementos interactivos como botones y controles' },
    { name: 'Responsive' }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h3 className="text-xl font-semibold text-neutral-900 mb-4">
        Características del Div Seleccionado
      </h3>
      <ul className="space-y-2">
        {characteristics.map((char, index) => (
          <li key={index} className="group relative">
            {char.value ? (
              <div className="cursor-pointer">
                <span className="text-neutral-700 font-medium group-hover:text-neutral-900 transition-colors">
                  {char.name}
                </span>
                <div className="absolute left-0 top-full mt-1 bg-neutral-800 text-white px-3 py-2 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap">
                  <div className="text-sm">{char.value}</div>
                  <div className="absolute -top-1 left-4 w-2 h-2 bg-neutral-800 rotate-45"></div>
                </div>
              </div>
            ) : (
              <span className="text-neutral-500">
                {char.name}
              </span>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-6 p-4 bg-neutral-50 rounded-md">
        <p className="text-sm text-neutral-600">
          <strong>Nota:</strong> Pasa el mouse sobre cada característica para ver su valor. 
          Las características sin valor no tienen interacción.
        </p>
      </div>
    </div>
  );
};

export default DivCharacteristics;