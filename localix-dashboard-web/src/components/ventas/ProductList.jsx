import React from 'react';
import { Plus, Package } from 'lucide-react';

const ProductList = ({ productos, manejarSeleccionProducto, getStockTotal }) => {
  return (
    <div className="flex-1 overflow-hidden">
      <h3 className="text-lg font-semibold text-theme-text mb-4">Productos Disponibles</h3>
      <div className="grid grid-cols-1 gap-4 h-full overflow-y-auto pr-2">
        {productos.map((producto) => (
          <div
            key={producto.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-blue-400 bg-theme-surface group ${
              getStockTotal(producto) > 0 ? 'border-theme-border' : 'border-theme-border bg-theme-background opacity-60'
            }`}
            onClick={() => manejarSeleccionProducto(producto)}
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {producto.imagen_principal_url ? (
                  <img
                    src={producto.imagen_principal_url}
                    alt={producto.nombre}
                    className="w-14 h-14 object-cover rounded-lg border border-theme-border"
                  />
                ) : (
                  <div className="w-14 h-14 bg-theme-secondary rounded-lg border border-theme-border flex items-center justify-center">
                    <Package size={18} className="text-theme-textSecondary" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-theme-text text-base line-clamp-2 mb-1 group-hover:underline">
                  {producto.nombre}
                </h4>
                <p className="text-xs text-theme-textSecondary mb-1">SKU: {producto.sku}</p>
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-theme-text">$ {producto.precio}</p>
                  <span className={`text-xs px-2 py-1 rounded font-medium border ${
                    getStockTotal(producto) > 0 
                      ? 'bg-theme-success/20 text-theme-success border-theme-success/30' 
                      : 'bg-theme-secondary text-theme-textSecondary border-theme-border'
                  }`}>
                    {getStockTotal(producto) > 0 ? `${getStockTotal(producto)} u.` : 'Agotado'}
                  </span>
                </div>
              </div>
            </div>
            {getStockTotal(producto) > 0 && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    manejarSeleccionProducto(producto);
                  }}
                  className="px-4 py-1 bg-theme-surface border border-theme-border text-theme-text rounded-lg text-sm font-medium hover:bg-theme-secondary transition-all"
                  title="Agregar al carrito"
                >
                  <Plus size={14} /> Agregar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
