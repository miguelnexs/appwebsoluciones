import React from 'react';
import { Search, User, Users, Plus, X  } from 'lucide-react';

const ClientSection = ({
  clienteSeleccionado,
  setClienteSeleccionado,
  busquedaCliente,
  setBusquedaCliente,
  resultadosBusquedaCliente,
  mostrarResultadosCliente,
  setMostrarResultadosCliente,
  clientes,
  setMostrarModalCliente,
  setMostrarModalCrearCliente,
  clienteNombre,
  setClienteNombre,
  recargarClientes
}) => {
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold text-theme-text mb-3">Cliente</h3>
      {clienteSeleccionado ? (
        <div className="p-3 bg-theme-background border border-theme-border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-theme-text">{clienteSeleccionado.nombre}</p>
              <p className="text-sm text-theme-textSecondary">{clienteSeleccionado.email}</p>
              {clienteSeleccionado.telefono && (
                <p className="text-sm text-theme-textSecondary">Tel: {clienteSeleccionado.telefono}</p>
              )}
            </div>
            <button
              onClick={() => setClienteSeleccionado(null)}
              className="text-theme-textSecondary hover:text-theme-textSecondary p-1"
              title="Remover cliente"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-textSecondary" size={16} />
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={busquedaCliente}
              onChange={(e) => setBusquedaCliente(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-theme-background text-theme-text"
            />
            {mostrarResultadosCliente && resultadosBusquedaCliente.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-theme-surface border border-theme-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {resultadosBusquedaCliente.map((cliente) => (
                  <button
                    key={cliente.id}
                    onClick={() => {
                      setClienteSeleccionado(cliente);
                      setMostrarResultadosCliente(false);
                      setBusquedaCliente('');
                    }}
                    className="w-full p-2 text-left border-b border-gray-100 hover:bg-theme-background last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-theme-text text-sm">{cliente.nombre}</p>
                        <p className="text-xs text-theme-textSecondary">{cliente.email}</p>
                        {cliente.telefono && (
                          <p className="text-xs text-theme-textSecondary">Tel: {cliente.telefono}</p>
                        )}
                      </div>
                      <div className="text-xs text-theme-textSecondary">
                        <User size={14} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-theme-textSecondary mb-2">Clientes Recientes</h4>
            <div className="max-h-24 overflow-y-auto border border-theme-border rounded-lg">
              {Array.isArray(clientes) && clientes.slice(0, 3).length > 0 ? (
                clientes.slice(0, 3).map((cliente) => (
                  <button
                    key={cliente.id}
                    onClick={() => setClienteSeleccionado(cliente)}
                    className="w-full p-2 text-left border-b border-gray-100 hover:bg-theme-background last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-theme-text text-sm">{cliente.nombre}</p>
                        <p className="text-xs text-theme-textSecondary">{cliente.email}</p>
                      </div>
                      <div className="text-xs text-theme-textSecondary">
                        <User size={14} />
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-2 text-center text-theme-textSecondary text-xs">
                  No hay clientes registrados
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Nombre del cliente (venta anónima)"
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              className="w-full px-3 py-2 border border-theme-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-theme-background text-theme-text"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setMostrarModalCliente(true)}
              className="flex-1 flex items-center justify-center px-3 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-accent text-sm"
            >
              <Users size={16} className="mr-2" />
              Ver Todos
            </button>
            <button
              onClick={() => setMostrarModalCrearCliente(true)}
              className="px-3 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-accent"
              title="Crear nuevo cliente"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={recargarClientes}
                              className="px-2 py-2 bg-theme-accent text-white rounded text-xs"
              title="Recargar clientes"
            >
              Recargar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientSection;
