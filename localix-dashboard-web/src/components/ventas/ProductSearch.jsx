import React from 'react';
import { Search, Plus } from 'lucide-react';

const ProductSearch = ({ 
  busquedaProducto, 
  setBusquedaProducto, 
  resultadosBusqueda, 
  mostrarResultados, 
  manejarSeleccionProducto,
  getStockTotal
}) => {
  return (
    <div className="relative mb-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-theme-textSecondary" size={20} />
        <input
          type="text"
          placeholder="Buscar productos por nombre o SKU..."
          value={busquedaProducto}
          onChange={(e) => setBusquedaProducto(e.target.value)}
          className="w-full pl-12 pr-4 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-theme-background transition"
        />
      </div>
      {mostrarResultados && resultadosBusqueda.length > 0 && (
        <div className="absolute z-20 w-full mt-2 bg-theme-surface border border-theme-border rounded-lg shadow max-h-80 overflow-y-auto animate-fade-in">
          {resultadosBusqueda.map((producto) => (
            <div
              key={producto.id}
                             className="p-4 border-b border-theme-border cursor-pointer hover:bg-theme-background group"
              onClick={() => manejarSeleccionProducto(producto)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {producto.imagen_principal_url ? (
                    <img
                      src={producto.imagen_principal_url}
                      alt={producto.nombre}
                      className="w-12 h-12 object-cover rounded-lg border border-theme-border"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-theme-secondary rounded-lg border border-theme-border flex items-center justify-center">
                      <Package size={18} className="text-theme-textSecondary" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-theme-text text-base truncate group-hover:underline">{producto.nombre}</h3>
                  <p className="text-xs text-theme-textSecondary">SKU: {producto.sku}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-base font-semibold text-theme-text">$ {producto.precio}</p>
                                       <span className={`text-xs px-2 py-1 rounded font-medium border ${getStockTotal(producto) > 0 ? 'bg-theme-success/20 text-theme-success border-theme-success/30' : 'bg-theme-secondary text-theme-textSecondary border-theme-border'}`}>
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
      )}
    </div>
  );
};

export default ProductSearch;
