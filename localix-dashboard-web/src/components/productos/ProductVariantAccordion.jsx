import React from 'react';
import { ExpandMore, Image } from '@mui/icons-material';
import ProductStatusChip from './ProductStatusChip';

const ProductVariantAccordion = ({ product, expanded, onExpand }) => {
  if (!product.variantes || product.variantes.length === 0) return null;

  return (
    <tr>
      <td colSpan={7} className="p-0 border-b-0">
        <div 
          className={`bg-red-50 rounded-lg overflow-hidden transition-all duration-200 ${
            expanded ? 'shadow-sm' : ''
          }`}
        >
          <button
            onClick={onExpand}
            className={`w-full flex justify-between items-center p-4 hover:bg-red-100 transition-colors ${
              expanded ? 'border-b border-red-200' : ''
            }`}
            aria-expanded={expanded}
          >
            <span className="text-sm font-medium text-red-700">
              Ver {product.variantes.length} variante(s)
            </span>
            <ExpandMore 
              className={`transform transition-transform duration-200 ${
                expanded ? 'rotate-180' : ''
              } text-red-500`}
            />
          </button>

          {expanded && (
            <div className="p-0">
              <div className="overflow-hidden border border-red-200 rounded-b-lg">
                <table className="min-w-full divide-y divide-red-200">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
                        Variante
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-theme-surface divide-y divide-red-200">
                    {product.variantes.map((variant) => (
                      <tr 
                        key={variant.id}
                        className="hover:bg-red-50 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {variant.imagen_principal_url ? (
                              <img
                                src={variant.imagen_principal_url}
                                alt={variant.nombre}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center">
                                <Image className="text-red-400" fontSize="small" />
                              </div>
                            )}
                            <span className="text-sm text-theme-text truncate max-w-xs">
                              {variant.nombre}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-theme-textSecondary">
                          {variant.sku}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-theme-text">
                          ${variant.precio}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-theme-textSecondary">
                          {variant.gestion_stock ? variant.stock : 'N/A'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <ProductStatusChip status={variant.estado} small />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default ProductVariantAccordion;
