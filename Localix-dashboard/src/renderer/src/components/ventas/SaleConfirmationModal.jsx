import React from 'react';
import { X, CheckCircle } from 'lucide-react';
import PrintSelector from '../PrintSelector';

const SaleConfirmationModal = ({ modalVenta, setModalVenta }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-surface rounded-lg max-w-md w-full mx-4 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center">
            <CheckCircle className="mr-2" size={24} />
            <h3 className="text-xl font-bold">¡Venta completada!</h3>
          </div>
          <button
            onClick={() => setModalVenta({ open: false, venta: null })}
            className="text-white hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">N° Venta:</span>
              <span className="font-semibold">{modalVenta.venta.numero_venta}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Cliente:</span>
              <span className="font-semibold">
                {modalVenta.venta.cliente?.nombre || modalVenta.venta.cliente_nombre || 'Mostrador'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Fecha:</span>
              <span className="font-semibold">
                {new Date(modalVenta.venta.fecha_venta).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between text-lg">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-green-600">$ {modalVenta.venta.total}</span>
            </div>

            <div className="mt-4">
              <h4 className="font-medium border-b pb-2 mb-2">Detalle de productos:</h4>
              <ul className="max-h-40 overflow-y-auto">
                {modalVenta.venta.items?.map((item, idx) => (
                  <li key={idx} className="py-1 border-b border-gray-100 last:border-0">
                    <div className="flex justify-between">
                      <span>
                        {item.producto}
                        {item.color?.nombre && ` (${item.color.nombre})`} x{item.cantidad}
                      </span>
                      <span className="text-theme-textSecondary">$ {item.subtotal}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Opciones de impresión y confirmación */}
          <div className="mt-6 space-y-4">
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3 text-theme-text">Opciones de impresión:</h4>
              <PrintSelector
                data={modalVenta.venta}
                type="venta"
                onPrintComplete={(printType) => {
                  console.log(`Venta impresa como ${printType}`);
                }}
                className="mb-3"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setModalVenta({ open: false, venta: null })}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleConfirmationModal;