import React from 'react';
import { Save } from 'lucide-react';

const CartSummary = ({
  metodoPago,
  setMetodoPago,
  tipoVenta,
  setTipoVenta,
  precioEnvio,
  setPrecioEnvio,
  observaciones,
  setObservaciones,
  calcularSubtotal,
  calcularTotal,
  finalizarVenta,
  loading
}) => {
  return (
    <div className="mt-6 space-y-4 border-t pt-6">
      <div>
        <label className="block text-sm font-medium text-theme-textSecondary mb-1">
          Método de Pago
        </label>
        <select
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value)}
          className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-gray-500 text-sm"
        >
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-theme-textSecondary mb-1">
          Tipo de Venta
        </label>
        <select
          value={tipoVenta}
          onChange={(e) => setTipoVenta(e.target.value)}
          className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-gray-500 text-sm"
        >
          <option value="fisica">Venta Física</option>
          <option value="envio">Venta con Envío</option>
        </select>
      </div>

      {tipoVenta === 'envio' && (
        <div>
          <label className="block text-sm font-medium text-theme-textSecondary mb-1">
            Precio de Envío ($)
          </label>
          <input
            type="number"
            value={precioEnvio}
            onChange={(e) => setPrecioEnvio(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-gray-500 text-sm"
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-theme-textSecondary mb-1">
          Observaciones
        </label>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-gray-500 text-sm"
          rows="2"
          placeholder="Observaciones de la venta..."
        />
      </div>

      <div className="bg-theme-background p-3 rounded-lg border border-theme-border">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>$ {(calcularSubtotal() / 100).toFixed(2)}</span>
          </div>
          {tipoVenta === 'envio' && (
            <div className="flex justify-between text-sm">
              <span>Envío:</span>
              <span>$ {(precioEnvio / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-semibold border-t border-theme-border pt-2">
            <span>Total:</span>
            <span>$ {(calcularTotal() / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={finalizarVenta}
        disabled={loading}
        className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center font-medium"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <>
            <Save size={18} className="mr-2" />
            Finalizar Venta
          </>
        )}
      </button>
    </div>
  );
};

export default CartSummary;