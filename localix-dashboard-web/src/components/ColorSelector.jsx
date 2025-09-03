import React from 'react';

const ColorSelector = ({ colors, selectedColor, onColorSelect, disabled = false }) => {
  if (!colors || colors.length === 0) {
    return null;
  }

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-theme-textSecondary mb-2">
        Seleccionar Color:
      </label>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color.id}
            type="button"
            onClick={() => onColorSelect(color)}
            disabled={disabled}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg border-2 text-sm font-medium
              ${selectedColor?.id === color.id
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-theme-border bg-theme-surface text-theme-textSecondary hover:border-theme-border'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${color.stock <= 0 ? 'opacity-30 cursor-not-allowed' : ''}
            `}
            title={`${color.nombre} - Stock: ${color.stock}`}
          >
            <div
              className="w-4 h-4 rounded-full border border-theme-border"
              style={{ backgroundColor: color.hex_code }}
            />
            <span>{color.nombre}</span>
            {color.stock <= 0 && (
              <span className="text-xs text-red-500">(Agotado)</span>
            )}
          </button>
        ))}
      </div>
      {selectedColor && (
        <p className="text-xs text-theme-textSecondary mt-1">
          Stock disponible: {selectedColor.stock} unidades
        </p>
      )}
    </div>
  );
};

export default ColorSelector; 
