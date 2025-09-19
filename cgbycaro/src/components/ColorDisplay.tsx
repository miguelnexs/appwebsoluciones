import React from 'react';
import { ProductColor } from '../hooks/useProductos';

interface ColorDisplayProps {
  colors: ProductColor[];
  maxColors?: number;
  size?: 'sm' | 'md' | 'lg';
}

const ColorDisplay: React.FC<ColorDisplayProps> = ({ 
  colors, 
  maxColors = 4, 
  size = 'sm' 
}) => {
  if (!colors || colors.length === 0) {
    return null;
  }

  // Filtrar colores que no sean "Único" y tengan hex_code
  const validColors = colors.filter(color => 
    color.name !== "Único" && color.hex_code
  );

  if (validColors.length === 0) {
    return null;
  }

  const displayColors = validColors.slice(0, maxColors);
  const remainingCount = validColors.length - maxColors;

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const containerClasses = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2'
  };

  return (
    <div className={`flex items-center justify-center ${containerClasses[size]} mt-1`}>
      {displayColors.map((color, index) => (
        <div
          key={index}
          className={`${sizeClasses[size]} rounded-full border border-gray-300 shadow-sm`}
          style={{ backgroundColor: color.hex_code }}
          title={color.name}
        />
      ))}
      {remainingCount > 0 && (
        <span className="text-xs text-gray-500 ml-1">
          +{remainingCount}
        </span>
      )}
    </div>
  );
};

export default ColorDisplay;