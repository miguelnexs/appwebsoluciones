import React from 'react';
import { ShoppingCart, X, ChevronDown, ChevronUp } from 'lucide-react';

const FloatingCart = ({
  carrito,
  isCartOpen,
  toggleCart,
  removerDelCarrito,
  actualizarCantidad,
  calcularTotal,
  calcularSubtotal,
  finalizarVenta,
  loading
}) => {
  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isCartOpen ? 'w-80' : 'w-16'}`}>
      {/* Botón flotante */}
      <button
        onClick={toggleCart}
        className={`bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center ${
          isCartOpen ? 'ml-auto' : 'w-14 h-14'
        }`}
      >
        {isCartOpen ? (
          <X size={24} />
        ) : (
          <div className="relative">
            <ShoppingCart size={24} />
            {carrito.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {carrito.reduce((total, item) => total + item.cantidad, 0)}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Contenido del carrito */}
      {isCartOpen && (
        <div className="mt-2 bg-theme-surface rounded-lg shadow-xl border border-theme-border overflow-hidden">
          {/* Header */}
          <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
            <h3 className="font-semibold flex items-center">
              <ShoppingCart className="mr-2" size={18} />
              Mi Pedido ({carrito.reduce((total, item) => total + item.cantidad, 0)})
            </h3>
            <button onClick={toggleCart} className="text-white hover:text-theme-textSecondary">
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Lista de productos */}
          <div className="max-h-96 overflow-y-auto p-3">
            {carrito.length === 0 ? (
              <div className="text-center py-6 text-theme-textSecondary">
                <ShoppingCart size={32} className="mx-auto mb-2 text-theme-textSecondary" />
                <p>El carrito está vacío</p>
              </div>
            ) : (
              carrito.map((item, index) => (
                <div key={index} className="flex items-start py-3 border-b border-gray-100 last:border-0">
                  <div className="relative w-16 h-16 flex-shrink-0 bg-theme-secondary rounded-md overflow-hidden">
                    {item.producto.imagen_principal_url ? (
                      <img
                        src={item.producto.imagen_principal_url}
                        alt={item.producto.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-theme-textSecondary">
                        <Package size={20} />
                      </div>
                    )}
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.cantidad}
                    </span>
                  </div>

                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-theme-text text-sm line-clamp-2">
                        {item.producto.nombre}
                      </h4>
                      <button
                        onClick={() => removerDelCarrito(index)}
                        className="text-theme-textSecondary hover:text-red-500 ml-2"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {item.variante && (
                      <p className="text-xs text-theme-textSecondary mt-1">
                        {item.variante.nombre}: {item.variante.valor}
                      </p>
                    )}

                    {item.color && (
                      <div className="flex items-center mt-1">
                        <span
                          className="w-3 h-3 rounded-full mr-1 border border-theme-border"
                          style={{ backgroundColor: item.color.hex_code }}
                        ></span>
                        <span className="text-xs text-theme-textSecondary">{item.color.nombre}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => actualizarCantidad(index, item.cantidad - 1)}
                          className="text-theme-textSecondary hover:bg-theme-secondary p-1 rounded"
                          disabled={item.cantidad <= 1}
                        >
                          <ChevronDown size={14} />
                        </button>
                        <span className="text-sm">{item.cantidad}</span>
                        <button
                          onClick={() => actualizarCantidad(index, item.cantidad + 1)}
                          className="text-theme-textSecondary hover:bg-theme-secondary p-1 rounded"
                        >
                          <ChevronUp size={14} />
                        </button>
                      </div>
                      <p className="font-semibold text-theme-text">
                        ${((item.precio * item.cantidad) / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totales y botón de pago */}
          {carrito.length > 0 && (
            <div className="border-t border-theme-border p-3 bg-theme-background">
              <div className="flex justify-between mb-2">
                <span className="text-theme-textSecondary">Subtotal:</span>
                <span className="font-medium">${(calcularSubtotal() / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-theme-textSecondary">Total:</span>
                <span className="font-bold text-lg text-blue-600">${(calcularTotal() / 100).toFixed(2)}</span>
              </div>
              <button
                onClick={finalizarVenta}
                disabled={loading}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center font-medium"
              >
                {loading ? 'Procesando...' : 'Finalizar Venta'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FloatingCart;
