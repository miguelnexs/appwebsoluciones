import React from 'react';
import { X, User } from 'lucide-react';

const ClientModal = ({
  mostrarModalCliente,
  setMostrarModalCliente,
  clientes,
  setClienteSeleccionado,
  nuevoCliente,
  setNuevoCliente,
  crearCliente
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-theme-surface rounded-lg p-4 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-theme-text">Seleccionar Cliente</h3>
          <button
            onClick={() => setMostrarModalCliente(false)}
            className="text-theme-textSecondary hover:text-theme-textSecondary"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-theme-text mb-2">Clientes Registrados</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {clientes.map((cliente) => (
                <button
                  key={cliente.id}
                  onClick={() => {
                    setClienteSeleccionado(cliente);
                    setMostrarModalCliente(false);
                  }}
                  className="w-full p-3 text-left border border-theme-border rounded-lg hover:bg-theme-background transition-colors"
                >
                  <p className="font-medium text-theme-text">{cliente.nombre}</p>
                  <p className="text-sm text-theme-textSecondary">{cliente.email}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-theme-text mb-2">Crear Nuevo Cliente</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre completo *"
                value={nuevoCliente.nombre}
                onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})}
                className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-gray-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={nuevoCliente.email}
                onChange={(e) => setNuevoCliente({...nuevoCliente, email: e.target.value})}
                className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-gray-500"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                value={nuevoCliente.telefono}
                onChange={(e) => setNuevoCliente({...nuevoCliente, telefono: e.target.value})}
                className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-gray-500"
              />
              <div className="flex space-x-2">
                <select
                  value={nuevoCliente.tipo_documento}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, tipo_documento: e.target.value})}
                  className="flex-1 px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-gray-500"
                >
                  <option value="dni">DNI</option>
                  <option value="ruc">RUC</option>
                  <option value="ce">Carné de Extranjería</option>
                  <option value="pasaporte">Pasaporte</option>
                </select>
                <input
                  type="text"
                  placeholder="Número de documento"
                  value={nuevoCliente.numero_documento}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, numero_documento: e.target.value})}
                  className="flex-1 px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-gray-500"
                />
              </div>
              <textarea
                placeholder="Dirección"
                value={nuevoCliente.direccion}
                onChange={(e) => setNuevoCliente({...nuevoCliente, direccion: e.target.value})}
                className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-gray-500"
                rows="2"
              />
              <button
                onClick={crearCliente}
                disabled={!nuevoCliente.nombre.trim()}
                className="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Crear Cliente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientModal;
