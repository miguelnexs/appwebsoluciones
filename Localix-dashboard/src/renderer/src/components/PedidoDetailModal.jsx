import React, { useState, useEffect } from 'react';
import { X, Package, User, Calendar, MapPin, Phone, FileText, Truck, CheckCircle, Clock, Download } from 'lucide-react';
import { getHistorialPedido, cambiarEstadoPedido } from '../main/handlers/pedidoHandlers';
import { generarReportePedido } from '../utils/pedidoPDFGenerator';
import { toast } from 'react-toastify';
import PrintSelector from './PrintSelector';

const ESTADOS_PEDIDO = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'en_preparacion', label: 'En Preparación' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
];

const PedidoDetailModal = ({ pedido, isOpen, onClose, onEstadoCambiado }) => {
  console.log('🔍 PedidoDetailModal - pedido completo:', pedido);
  console.log('🔍 PedidoDetailModal - pedido.items:', pedido?.items);
  console.log('🔍 PedidoDetailModal - typeof pedido.items:', typeof pedido?.items);
  console.log('🔍 PedidoDetailModal - Array.isArray(pedido.items):', Array.isArray(pedido?.items));
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [showEstadoEdit, setShowEstadoEdit] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  useEffect(() => {
    if (isOpen && pedido) {
      loadHistorial();
      setShowEstadoEdit(false);
      setNuevoEstado('');
    }
  }, [isOpen, pedido]);

  const loadHistorial = async () => {
    if (!pedido) return;
    try {
      setLoadingHistorial(true);
      const historialData = await getHistorialPedido(pedido.id);
      setHistorial(historialData);
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmado':
        return 'bg-blue-100 text-blue-800';
      case 'en_preparacion':
        return 'bg-orange-100 text-orange-800';
      case 'enviado':
        return 'bg-purple-100 text-purple-800';
      case 'entregado':
        return 'bg-blue-100 text-blue-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-theme-secondary text-theme-text';
    }
  };

  const getEstadoText = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'confirmado':
        return 'Confirmado';
      case 'en_preparacion':
        return 'En Preparación';
      case 'enviado':
        return 'Enviado';
      case 'entregado':
        return 'Entregado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShowEstadoEdit = () => {
    setNuevoEstado(pedido.estado_pedido);
    setShowEstadoEdit(true);
  };

  const handleCancelarCambio = () => {
    setShowEstadoEdit(false);
    setNuevoEstado('');
  };

  const handleGuardarCambio = async () => {
    if (!nuevoEstado || nuevoEstado === pedido.estado_pedido) {
      setShowEstadoEdit(false);
      return;
    }
    setCambiandoEstado(true);
    try {
      await cambiarEstadoPedido(pedido.id, nuevoEstado);
      toast.success('Estado del pedido actualizado');
      setShowEstadoEdit(false);
      if (onEstadoCambiado) onEstadoCambiado();
    } catch (error) {
      toast.error('Error al cambiar el estado');
    } finally {
      setCambiandoEstado(false);
    }
  };

  const handleGenerarPDF = async () => {
    setGenerandoPDF(true);
    try {
      await generarReportePedido(pedido, false);
      toast.success('Reporte PDF generado exitosamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.error('Error al generar el reporte PDF');
    } finally {
      setGenerandoPDF(false);
    }
  };

  if (!isOpen || !pedido) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-surface rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-theme-text">
                Pedido {pedido.numero_pedido}
              </h3>
              <p className="text-sm text-theme-textSecondary">
                Creado el {formatDate(pedido.fecha_creacion)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-theme-textSecondary hover:text-theme-textSecondary p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información del Cliente */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-theme-text flex items-center gap-2">
                <User size={20} />
                Información del Cliente
              </h4>
              <div className="bg-theme-background rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-theme-textSecondary">Nombre:</label>
                  <p className="text-sm text-theme-text">
                    {pedido.cliente?.nombre || pedido.venta?.cliente_nombre || 'Cliente anónimo'}
                  </p>
                </div>
                {pedido.cliente?.email && (
                  <div>
                    <label className="text-sm font-medium text-theme-textSecondary">Email:</label>
                    <p className="text-sm text-theme-text">{pedido.cliente.email}</p>
                  </div>
                )}
                {pedido.telefono_contacto && (
                  <div>
                    <label className="text-sm font-medium text-theme-textSecondary">Teléfono:</label>
                    <p className="text-sm text-theme-text">{pedido.telefono_contacto}</p>
                  </div>
                )}
                {pedido.direccion_entrega && (
                  <div>
                    <label className="text-sm font-medium text-theme-textSecondary">Dirección:</label>
                    <p className="text-sm text-theme-text">{pedido.direccion_entrega}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información del Pedido */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-theme-text flex items-center gap-2">
                <Package size={20} />
                Información del Pedido
              </h4>
              <div className="bg-theme-background rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-theme-textSecondary">Estado:</span>
                  {!showEstadoEdit ? (
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${getEstadoColor(pedido.estado_pedido)}`}
                      title="Haz clic para cambiar el estado"
                      onClick={() => handleShowEstadoEdit()}
                    >
                      {getEstadoText(pedido.estado_pedido)}
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select
                        className="px-2 py-1 border rounded text-sm"
                        value={nuevoEstado}
                        onChange={e => setNuevoEstado(e.target.value)}
                        disabled={cambiandoEstado}
                      >
                        {ESTADOS_PEDIDO.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <button
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                        onClick={handleGuardarCambio}
                        disabled={cambiandoEstado || nuevoEstado === pedido.estado_pedido}
                      >
                        Guardar
                      </button>
                      <button
                        className="px-2 py-1 bg-theme-border text-theme-textSecondary rounded text-xs hover:bg-gray-300"
                        onClick={handleCancelarCambio}
                        disabled={cambiandoEstado}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
                {showEstadoEdit && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-theme-textSecondary">Estado de Pago:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${pedido.estado_pago === 'pagado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {pedido.estado_pago === 'pagado' ? 'Pagado' : 'Pendiente'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-theme-textSecondary">Tipo de Venta:</span>
                  <span className="text-sm text-theme-text">
                    {pedido.tipo_venta === 'fisica' ? 'Venta Física' : 'Venta Digital'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-theme-textSecondary">Método de Pago:</span>
                  <span className="text-sm text-theme-text">{pedido.metodo_pago || 'No especificado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-theme-textSecondary">Total:</span>
                  <span className="text-sm font-semibold text-theme-text">
                    $ {parseFloat(pedido.total_pedido || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Fechas importantes */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-theme-text flex items-center gap-2 mb-4">
              <Calendar size={20} />
              Fechas Importantes
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-theme-background rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-theme-textSecondary" />
                  <span className="text-sm font-medium text-theme-textSecondary">Creación</span>
                </div>
                <p className="text-sm text-theme-text">{formatDate(pedido.fecha_creacion)}</p>
              </div>
              {pedido.fecha_confirmacion && (
                <div className="bg-theme-background rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-sm font-medium text-theme-textSecondary">Confirmación</span>
                  </div>
                  <p className="text-sm text-theme-text">{formatDate(pedido.fecha_confirmacion)}</p>
                </div>
              )}
              {pedido.fecha_envio && (
                <div className="bg-theme-background rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck size={16} className="text-blue-500" />
                    <span className="text-sm font-medium text-theme-textSecondary">Envío</span>
                  </div>
                  <p className="text-sm text-theme-text">{formatDate(pedido.fecha_envio)}</p>
                </div>
              )}
              {pedido.fecha_entrega && (
                <div className="bg-theme-background rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-sm font-medium text-theme-textSecondary">Entrega</span>
                  </div>
                  <p className="text-sm text-theme-text">{formatDate(pedido.fecha_entrega)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Productos */}
          {pedido.items && Array.isArray(pedido.items) && pedido.items.length > 0 ? (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-theme-text flex items-center gap-2 mb-4">
                <Package size={20} />
                Productos ({pedido.items.length})
              </h4>
              <div className="bg-theme-background rounded-lg p-4">
                <div className="space-y-3">
                  {pedido.items.map((item, index) => {
                    console.log('PedidoDetailModal item:', item);
                    return (
                      <div key={index} className="flex items-center gap-3 py-3 border-b border-theme-border last:border-b-0">
                        {/* Imagen del producto */}
                        <div className="flex-shrink-0">
                          {item.producto?.imagen_principal_url ? (
                            <img
                              src={item.producto.imagen_principal_url}
                              alt={item.producto?.nombre || 'Producto'}
                              className="w-12 h-12 rounded-lg object-cover border border-theme-border"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-12 h-12 bg-theme-secondary rounded-lg border border-theme-border flex items-center justify-center ${item.producto?.imagen_principal_url ? 'hidden' : ''}`}>
                            <Package size={16} className="text-theme-textSecondary" />
                          </div>
                        </div>
                        {/* Información del producto */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-theme-text truncate">{item.producto?.nombre || 'Producto'}</span>
                            {/* Mostrar color si existe */}
                            {item.color && item.color.nombre && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-theme-secondary border border-theme-border ml-2" title={item.color.nombre}>
                                {item.color.hex_code && (
                                  <span
                                    className="inline-block w-4 h-4 rounded-full border border-theme-border"
                                    style={{ backgroundColor: item.color.hex_code }}
                                  ></span>
                                )}
                                {item.color.nombre}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-theme-textSecondary">
                            <span>Cantidad: {item.cantidad}</span>
                          </div>
                        </div>
                        {/* Precios */}
                        <div className="flex-shrink-0 text-right">
                          <div className="text-sm text-theme-textSecondary">
                            $ {parseFloat(item.precio_unitario || 0).toFixed(2)} c/u
                          </div>
                          <div className="text-sm font-semibold text-theme-text">
                            $ {parseFloat(item.subtotal || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-theme-text flex items-center gap-2 mb-4">
                <Package size={20} />
                Productos
              </h4>
              <div className="bg-theme-background rounded-lg p-4">
                <div className="text-center text-theme-textSecondary">
                  {!pedido.items ? (
                    <p>No hay información de productos disponible</p>
                  ) : !Array.isArray(pedido.items) ? (
                    <p>Formato de productos no válido</p>
                  ) : (
                    <p>No hay productos en este pedido</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Información adicional */}
          {(pedido.notas || pedido.instrucciones_entrega || pedido.codigo_seguimiento || pedido.empresa_envio) && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-theme-text flex items-center gap-2 mb-4">
                <FileText size={20} />
                Información Adicional
              </h4>
              <div className="bg-theme-background rounded-lg p-4 space-y-3">
                {pedido.notas && (
                  <div>
                    <label className="text-sm font-medium text-theme-textSecondary">Notas:</label>
                    <p className="text-sm text-theme-text">{pedido.notas}</p>
                  </div>
                )}
                {pedido.instrucciones_entrega && (
                  <div>
                    <label className="text-sm font-medium text-theme-textSecondary">Instrucciones de Entrega:</label>
                    <p className="text-sm text-theme-text">{pedido.instrucciones_entrega}</p>
                  </div>
                )}
                {pedido.codigo_seguimiento && (
                  <div>
                    <label className="text-sm font-medium text-theme-textSecondary">Código de Seguimiento:</label>
                    <p className="text-sm text-theme-text">{pedido.codigo_seguimiento}</p>
                  </div>
                )}
                {pedido.empresa_envio && (
                  <div>
                    <label className="text-sm font-medium text-theme-textSecondary">Empresa de Envío:</label>
                    <p className="text-sm text-theme-text">{pedido.empresa_envio}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Historial */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-theme-text flex items-center gap-2 mb-4">
              <Clock size={20} />
              Historial del Pedido
            </h4>
            <div className="bg-theme-background rounded-lg p-4">
              {loadingHistorial ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
                  <p className="text-sm text-theme-textSecondary mt-2">Cargando historial...</p>
                </div>
              ) : historial.length > 0 ? (
                <div className="space-y-3">
                  {historial.map((entry, index) => (
                    <div key={index} className="flex items-start gap-3 py-2 border-b border-theme-border last:border-b-0">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(entry.estado_nuevo)}`}>
                            {getEstadoText(entry.estado_nuevo)}
                          </span>
                          <span className="text-xs text-theme-textSecondary">
                            {formatDate(entry.fecha_cambio)}
                          </span>
                        </div>
                        {entry.notas && (
                          <p className="text-sm text-theme-textSecondary">{entry.notas}</p>
                        )}
                        {entry.usuario_nombre && (
                          <p className="text-xs text-theme-textSecondary">Por: {entry.usuario_nombre}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-theme-textSecondary text-center py-4">No hay historial disponible</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-3 p-6 border-t border-theme-border">
          <PrintSelector
            data={pedido}
            type="pedido"
            onPrintComplete={(printType) => {
              console.log(`Pedido impreso como ${printType}`);
            }}
            className="flex-1"
          />
          
          <button
            onClick={onClose}
            className="px-4 py-2 text-theme-textSecondary bg-theme-secondary rounded-lg hover:bg-theme-border transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PedidoDetailModal;