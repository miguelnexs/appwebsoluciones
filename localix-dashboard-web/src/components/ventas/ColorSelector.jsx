import React from 'react';

const ColorSelector = ({ colors, selectedColor, onColorSelect }) => {
  return (
    <div>
      <p className="text-sm font-medium text-theme-textSecondary mb-2">Colores Disponibles</p>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color.id}
            onClick={() => onColorSelect(color)}
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
              selectedColor?.id === color.id
                ? 'border-gray-900 shadow-md'
                : 'border-theme-border hover:border-theme-border'
            }`}
            style={{ backgroundColor: color.hex_code }}
            title={color.nombre}
          >
            {selectedColor?.id === color.id && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        ))}
      </div>
      {selectedColor && (
        <div className="mt-2 text-sm">
          <p>
            <span className="font-medium">Color seleccionado:</span> {selectedColor.nombre}
          </p>
          <p>
            <span className="font-medium">Stock disponible:</span> {selectedColor.stock} unidades
          </p>
        </div>
      )}
    </div>
  );
};

export default ColorSelector;
