import React from 'react';
import { X, Package } from 'lucide-react';
import ColorSelector from './ColorSelector';

const ProductModal = ({
  productoSeleccionado,
  setMostrarModalProducto,
  colorSeleccionado,
  setColorSeleccionado,
  cantidadSeleccionada,
  setCantidadSeleccionada,
  agregarAlCarrito
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-theme-surface rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-theme-border">
          <h3 className="text-lg font-semibold text-theme-text">{productoSeleccionado.nombre}</h3>
          <button
            onClick={() => setMostrarModalProducto(false)}
            className="text-theme-textSecondary hover:text-theme-textSecondary p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            {productoSeleccionado.imagen_principal_url ? (
              <img
                src={productoSeleccionado.imagen_principal_url}
                alt={productoSeleccionado.nombre}
                className="w-full h-48 object-cover rounded-lg border border-theme-border"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-full h-48 bg-theme-secondary rounded-lg border border-theme-border flex items-center justify-center ${
              productoSeleccionado.imagen_principal_url ? 'hidden' : ''
            }`}>
              <Package size={48} className="text-theme-textSecondary" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-theme-textSecondary">SKU</p>
                <p className="text-sm font-medium">{productoSeleccionado.sku}</p>
              </div>
              <div>
                <p className="text-xs text-theme-textSecondary">Categoría</p>
                <p className="text-sm font-medium">{productoSeleccionado.categoria || 'Sin categoría'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-theme-textSecondary">Precio</p>
              <p className="text-xl font-semibold text-theme-text">
                $ {productoSeleccionado.precio}
              </p>
            </div>

            {productoSeleccionado.colores_disponibles && productoSeleccionado.colores_disponibles.length > 0 && (
              <ColorSelector
                colors={productoSeleccionado.colores_disponibles}
                selectedColor={colorSeleccionado}
                onColorSelect={setColorSeleccionado}
              />
            )}

            <div className="mb-3">
              <label className="block text-sm font-medium text-theme-textSecondary mb-2">
                Cantidad:
              </label>
              <div className="flex items-center border border-theme-border rounded-lg w-32">
                <button
                  onClick={() => setCantidadSeleccionada(Math.max(1, cantidadSeleccionada - 1))}
                  className="px-3 py-2 hover:bg-theme-secondary disabled:opacity-50 text-sm"
                  disabled={cantidadSeleccionada <= 1}
                >
                  -
                </button>
                <span className="px-3 py-2 min-w-[2rem] text-center text-sm">{cantidadSeleccionada}</span>
                <button
                  onClick={() => setCantidadSeleccionada(cantidadSeleccionada + 1)}
                  className="px-3 py-2 hover:bg-theme-secondary disabled:opacity-50 text-sm"
                  disabled={
                    (colorSeleccionado && colorSeleccionado.stock <= cantidadSeleccionada) ||
                    (!colorSeleccionado && productoSeleccionado.stock <= cantidadSeleccionada)
                  }
                >
                  +
                </button>
              </div>
            </div>

            {productoSeleccionado.variantes && productoSeleccionado.variantes.length > 0 && (
              <div>
                <p className="text-sm font-medium text-theme-textSecondary mb-2">Variantes Disponibles</p>
                <div className="grid grid-cols-2 gap-2">
                  {productoSeleccionado.variantes.map((variante) => (
                    <button
                      key={variante.id}
                      onClick={() => {
                        agregarAlCarrito(productoSeleccionado, variante, colorSeleccionado, cantidadSeleccionada);
                        setMostrarModalProducto(false);
                      }}
                      className={`p-2 border rounded text-center transition-colors ${
                        variante.stock > 0
                          ? 'border-theme-border hover:border-theme-border hover:bg-theme-background'
                          : 'border-theme-border bg-theme-secondary opacity-60 cursor-not-allowed'
                      }`}
                      disabled={variante.stock === 0}
                    >
                      <p className="font-medium text-theme-text text-sm">{variante.valor}</p>
                      <p className="text-xs text-theme-textSecondary">
                        +$ {variante.precio_extra}
                      </p>
                      <p className={`text-xs ${
                        variante.stock > 0 ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        Stock: {variante.stock}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(!productoSeleccionado.variantes || productoSeleccionado.variantes.length === 0) && (
              <button
                onClick={() => {
                  agregarAlCarrito(productoSeleccionado, null, colorSeleccionado, cantidadSeleccionada);
                  setMostrarModalProducto(false);
                }}
                disabled={
                  (productoSeleccionado.colores_disponibles && productoSeleccionado.colores_disponibles.length > 0 && !colorSeleccionado) ||
                  (colorSeleccionado && colorSeleccionado.stock === 0) ||
                  (!colorSeleccionado && productoSeleccionado.stock === 0)
                }
                className="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                {(() => {
                  if (productoSeleccionado.colores_disponibles && productoSeleccionado.colores_disponibles.length > 0 && !colorSeleccionado) {
                    return 'Selecciona un color';
                  }
                  if (colorSeleccionado && colorSeleccionado.stock === 0) return 'Color Agotado';
                  if (!colorSeleccionado && productoSeleccionado.stock === 0) return 'Sin Stock';
                  return 'Agregar al Carrito';
                })()}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
