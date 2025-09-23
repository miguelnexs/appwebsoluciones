import React from 'react';
import { Producto } from '@/data/staticData';
import { Package, DollarSign, Tag, Barcode } from 'lucide-react';

interface ProductCardProps {
  product: Producto;
  onClick?: (product: Producto) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(product);
    }
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={handleClick}
    >
      <div className="p-6">
        {/* Header con icono y nombre */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                {product.nombre}
              </h3>
              <p className="text-sm text-gray-500">
                {product.categoria?.nombre || 'Sin categoría'}
              </p>
            </div>
          </div>
        </div>

        {/* Descripción */}
        {product.descripcion && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.descripcion}
          </p>
        )}

        {/* Información del producto */}
        <div className="space-y-3">
          {/* Precio */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Precio</span>
            </div>
            <span className="font-semibold text-green-600">
              ${product.precio?.toLocaleString() || 'N/A'}
            </span>
          </div>

          {/* Stock */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">Stock</span>
            </div>
            <span className={`font-semibold ${
              (product.stock || 0) > 10 
                ? 'text-green-600' 
                : (product.stock || 0) > 0 
                  ? 'text-yellow-600' 
                  : 'text-red-600'
            }`}>
              {product.stock || 0} unidades
            </span>
          </div>

          {/* Código de barras */}
          {product.codigo_barras && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Barcode className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Código</span>
              </div>
              <span className="text-sm font-mono text-gray-700">
                {product.codigo_barras}
              </span>
            </div>
          )}

          {/* Estado */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Estado</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              product.activo 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {product.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        {/* Footer con fechas */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              Creado: {product.fecha_creacion ? new Date(product.fecha_creacion).toLocaleDateString() : 'N/A'}
            </span>
            {product.fecha_actualizacion && (
              <span>
                Actualizado: {new Date(product.fecha_actualizacion).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;