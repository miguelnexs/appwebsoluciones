import React from 'react';
import { X } from 'lucide-react';

const QuickClientModal = ({
  mostrarModalCrearCliente,
  setMostrarModalCrearCliente,
  nuevoCliente,
  setNuevoCliente,
  crearClienteRapido
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-theme-surface rounded-lg p-4 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-theme-text">Crear Cliente Rápido</h3>
          <button
            onClick={() => setMostrarModalCrearCliente(false)}
            className="text-theme-textSecondary hover:text-theme-textSecondary"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-theme-textSecondary mb-1">
              Nombre completo *
            </label>
            <input
              type="text"
              placeholder="Nombre completo"
              value={nuevoCliente.nombre}
              onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})}
              className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-textSecondary mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Email (opcional)"
              value={nuevoCliente.email}
              onChange={(e) => setNuevoCliente({...nuevoCliente, email: e.target.value})}
              className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-textSecondary mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              placeholder="Teléfono (opcional)"
              value={nuevoCliente.telefono}
              onChange={(e) => setNuevoCliente({...nuevoCliente, telefono: e.target.value})}
              className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <div className="flex space-x-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-theme-textSecondary mb-1">
                Tipo de documento
              </label>
              <select
                value={nuevoCliente.tipo_documento}
                onChange={(e) => setNuevoCliente({...nuevoCliente, tipo_documento: e.target.value})}
                className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-gray-500"
              >
                <option value="dni">DNI</option>
                <option value="ruc">RUC</option>
                <option value="ce">Carné de Extranjería</option>
                <option value="pasaporte">Pasaporte</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-theme-textSecondary mb-1">
                Número de documento
              </label>
              <input
                type="text"
                placeholder="Número (opcional)"
                value={nuevoCliente.numero_documento}
                onChange={(e) => setNuevoCliente({...nuevoCliente, numero_documento: e.target.value})}
                className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-textSecondary mb-1">
              Dirección
            </label>
            <textarea
              placeholder="Dirección (opcional)"
              value={nuevoCliente.direccion}
              onChange={(e) => setNuevoCliente({...nuevoCliente, direccion: e.target.value})}
              className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-gray-500"
              rows="2"
            />
          </div>

          <div className="flex space-x-3 pt-3">
            <button
              onClick={() => setMostrarModalCrearCliente(false)}
              className="flex-1 py-2 px-4 border border-theme-border text-theme-textSecondary rounded-lg hover:bg-theme-background transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={crearClienteRapido}
              disabled={!nuevoCliente.nombre.trim()}
              className="flex-1 py-2 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Crear Cliente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickClientModal;
