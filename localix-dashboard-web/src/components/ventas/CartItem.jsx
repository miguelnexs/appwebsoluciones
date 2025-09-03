import React from 'react';
import { X, Plus, Minus } from 'lucide-react';

const CartItem = ({ 
  item, 
  index, 
  actualizarCantidad, 
  removerDelCarrito,
  calcularStockDisponible,
  calcularStockRestante
}) => {
  return (
    <div className="p-4 border border-theme-border rounded-lg bg-theme-surface shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Imagen del producto */}
        <div className="flex-shrink-0 relative">
          {item.producto.imagen_principal_url ? (
            <img
              src={item.producto.imagen_principal_url}
              alt={item.producto.nombre}
              className="w-20 h-20 object-cover rounded-lg border border-theme-border"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border border-theme-border flex items-center justify-center ${
            item.producto.imagen_principal_url ? 'hidden' : ''
          }`}>
            <span className="text-theme-textSecondary text-xs text-center">Imagen no disponible</span>
          </div>
          
          {/* Badge de cantidad */}
          <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {item.cantidad}
          </div>
        </div>
        
        {/* Información del producto */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-theme-text text-base line-clamp-2">
              {item.producto.nombre}
            </h4>
            <button
              onClick={() => removerDelCarrito(index)}
              className="text-theme-textSecondary hover:text-red-500 p-1 transition-colors"
              title="Eliminar del carrito"
            >
              <X size={16} />
            </button>
          </div>
          
          {/* Variantes y color */}
          <div className="mt-1 space-y-1">
            {item.variante && (
              <p className="text-xs text-theme-textSecondary bg-theme-background px-2 py-1 rounded inline-block">
                {item.variante.nombre}: {item.variante.valor}
              </p>
            )}
            
            {item.color && (
              <div className="flex items-center text-xs text-theme-textSecondary bg-theme-background px-2 py-1 rounded inline-block">
                <span 
                  className="w-3 h-3 rounded-full mr-1 border border-theme-border"
                  style={{ backgroundColor: item.color.hex_code }}
                ></span>
                Color: {item.color.nombre}
              </div>
            )}
          </div>
          
          {/* Precio y controles */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => actualizarCantidad(index, item.cantidad - 1)}
                className="p-1 rounded-full bg-theme-secondary text-theme-textSecondary hover:bg-theme-border disabled:opacity-30"
                disabled={item.cantidad <= 1}
                title="Reducir cantidad"
              >
                <Minus size={14} />
              </button>
              
              <span className="text-sm font-medium w-6 text-center">{item.cantidad}</span>
              
              <button
                onClick={() => actualizarCantidad(index, item.cantidad + 1)}
                className="p-1 rounded-full bg-theme-secondary text-theme-textSecondary hover:bg-theme-border disabled:opacity-30"
                disabled={calcularStockRestante(item) <= 0}
                title="Aumentar cantidad"
              >
                <Plus size={14} />
              </button>
            </div>
            
            <div className="text-right">
              <p className="font-bold text-theme-text">${(item.precio * item.cantidad)}</p>
              <p className="text-xs text-theme-textSecondary">${item.precio} c/u</p>
            </div>
          </div>
          
          {/* Stock */}
          <div className="mt-2">
            <div className="w-full bg-theme-border rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full" 
                style={{
                  width: `${Math.min(100, (item.cantidad / calcularStockDisponible(item)) * 100)}%`
                }}
              ></div>
            </div>
            <p className="text-xs text-theme-textSecondary mt-1">
              {calcularStockRestante(item)} disponibles de {calcularStockDisponible(item)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
