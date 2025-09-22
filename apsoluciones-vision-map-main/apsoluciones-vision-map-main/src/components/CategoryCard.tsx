import React from 'react';
import { Categoria } from '@/services/api';
import { Folder, Package, Calendar } from 'lucide-react';

interface CategoryCardProps {
  category: Categoria;
  productCount?: number;
  onClick?: (category: Categoria) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  productCount = 0,
  onClick 
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(category);
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-200 ${
        onClick ? 'hover:shadow-md hover:border-purple-300 cursor-pointer' : ''
      }`}
      onClick={handleClick}
    >
      <div className="p-6">
        {/* Header con icono y nombre */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-all">
            <Folder className="w-7 h-7 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg group-hover:text-purple-600 transition-colors">
              {category.nombre}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {productCount} {productCount === 1 ? 'producto' : 'productos'}
              </span>
            </div>
          </div>
        </div>

        {/* Descripción */}
        {category.descripcion && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {category.descripcion}
          </p>
        )}

        {/* Estado */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">Estado</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            category.activo 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {category.activo ? 'Activa' : 'Inactiva'}
          </span>
        </div>

        {/* Footer con fecha de creación */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>
                Creada: {category.fecha_creacion ? new Date(category.fecha_creacion).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            {category.fecha_actualizacion && (
              <span>
                Actualizada: {new Date(category.fecha_actualizacion).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;