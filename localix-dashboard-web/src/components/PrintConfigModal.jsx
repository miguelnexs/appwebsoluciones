import React, { useState, useEffect } from 'react';
import { Printer, Settings, Check, X, FileText, Receipt } from 'lucide-react';
import { getAvailableTicketSizes } from '../utils/ticketGenerator';

const PrintConfigModal = ({ isOpen, onClose, onConfigSave, currentConfig = null }) => {
  const [printType, setPrintType] = useState('pdf'); // 'pdf' o 'ticket'
  const [ticketSize, setTicketSize] = useState('80mm');
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableTicketSizes, setAvailableTicketSizes] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  useEffect(() => {
    // Cargar configuración actual si existe
    if (currentConfig) {
      setPrintType(currentConfig.printType || 'pdf');
      setTicketSize(currentConfig.ticketSize || '80mm');
      setSelectedPrinter(currentConfig.selectedPrinter || '');
    } else {
      // Cargar desde localStorage
      const savedConfig = localStorage.getItem('printConfig');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setPrintType(config.printType || 'pdf');
        setTicketSize(config.ticketSize || '80mm');
        setSelectedPrinter(config.selectedPrinter || '');
      }
    }
  }, [currentConfig, isOpen]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Cargar tamaños de ticket disponibles
      const ticketSizes = getAvailableTicketSizes();
      setAvailableTicketSizes(ticketSizes);

      // Cargar impresoras disponibles
      if (window.pdfAPI) {
        const printersResult = await window.pdfAPI.listarImpresoras();
        if (printersResult.success) {
          setPrinters(printersResult.printers || []);
        }
      }
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = () => {
    const config = {
      printType,
      ticketSize,
      selectedPrinter
    };

    // Guardar en localStorage
    localStorage.setItem('printConfig', JSON.stringify(config));

    // Llamar callback si existe
    if (onConfigSave) {
      onConfigSave(config);
    }

    onClose();
  };

  const handleTestPrint = async () => {
    if (printType === 'ticket' && !selectedPrinter) {
      alert('Selecciona una impresora para imprimir tickets');
      return;
    }

    try {
      setLoading(true);
      
      if (printType === 'pdf') {
        // Generar PDF de prueba
        const { generarReciboSimple } = await import('../utils/ventaPDFGenerator');
        const testVenta = createTestSale();
        const doc = await generarReciboSimple(testVenta);
        
        // Descargar PDF
        doc.save('test_print.pdf');
        alert('PDF de prueba generado y descargado');
      } else {
        // Generar ticket de prueba
        const { generarTicketVenta } = await import('../utils/ticketGenerator');
        const testVenta = createTestSale();
        const doc = await generarTicketVenta(testVenta, ticketSize, false);
        
        // Imprimir ticket
        if (window.pdfAPI) {
          const pdfBlob = doc.output('blob');
          await window.pdfAPI.imprimir(pdfBlob, 'test_ticket.pdf');
          alert('Ticket de prueba enviado a la impresora');
        } else {
          // Fallback: descargar como PDF
          doc.save('test_ticket.pdf');
          alert('Ticket de prueba generado y descargado');
        }
      }
    } catch (error) {
      console.error('Error en impresión de prueba:', error);
      alert('Error al generar la impresión de prueba');
    } finally {
      setLoading(false);
    }
  };

  const createTestSale = () => {
    return {
      id: 'TEST',
      numero_venta: 'TEST-001',
      fecha_venta: new Date().toISOString(),
      cliente: { nombre: 'Cliente de Prueba' },
      items: [
        {
          producto: { nombre: 'Producto de Prueba 1' },
          cantidad: 2,
          precio_unitario: 15.50,
          subtotal: 31.00
        },
        {
          producto: { nombre: 'Producto de Prueba 2' },
          cantidad: 1,
          precio_unitario: 25.00,
          subtotal: 25.00
        }
      ],
      total: 56.00,
      metodo_pago: 'efectivo',
      vendedor: 'Sistema de Prueba'
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-theme-surface rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-theme-text flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Configuración de Impresión
          </h2>
          <button
            onClick={onClose}
            className="text-theme-textSecondary hover:text-theme-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-theme-textSecondary mt-2">Cargando configuración...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tipo de Impresión */}
            <div>
              <label className="block text-sm font-medium text-theme-text mb-3">
                Tipo de Impresión
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPrintType('pdf')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    printType === 'pdf'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-theme-border bg-theme-background hover:border-blue-300'
                  }`}
                >
                  <FileText className={`w-6 h-6 mx-auto mb-2 ${
                    printType === 'pdf' ? 'text-blue-600' : 'text-theme-textSecondary'
                  }`} />
                  <div className={`text-sm font-medium ${
                    printType === 'pdf' ? 'text-blue-600' : 'text-theme-text'
                  }`}>
                    PDF
                  </div>
                  <div className="text-xs text-theme-textSecondary mt-1">
                    Formato estándar
                  </div>
                </button>

                <button
                  onClick={() => setPrintType('ticket')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    printType === 'ticket'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-theme-border bg-theme-background hover:border-blue-300'
                  }`}
                >
                  <Receipt className={`w-6 h-6 mx-auto mb-2 ${
                    printType === 'ticket' ? 'text-blue-600' : 'text-theme-textSecondary'
                  }`} />
                  <div className={`text-sm font-medium ${
                    printType === 'ticket' ? 'text-blue-600' : 'text-theme-text'
                  }`}>
                    Ticket
                  </div>
                  <div className="text-xs text-theme-textSecondary mt-1">
                    Formato térmico
                  </div>
                </button>
              </div>
            </div>

            {/* Configuración de Ticket */}
            {printType === 'ticket' && (
              <div className="space-y-4">
                {/* Tamaño de Ticket */}
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    Tamaño de Ticket
                  </label>
                  <select
                    value={ticketSize}
                    onChange={(e) => setTicketSize(e.target.value)}
                    className="w-full p-3 border border-theme-border rounded-lg bg-theme-background text-theme-text focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {availableTicketSizes.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.label} ({size.width}mm de ancho)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selección de Impresora */}
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    Impresora
                  </label>
                  <select
                    value={selectedPrinter}
                    onChange={(e) => setSelectedPrinter(e.target.value)}
                    className="w-full p-3 border border-theme-border rounded-lg bg-theme-background text-theme-text focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar impresora...</option>
                    {printers.map((printer, index) => (
                      <option key={index} value={printer.name}>
                        {printer.name} {printer.isDefault ? '(Por defecto)' : ''}
                      </option>
                    ))}
                  </select>
                  {printers.length === 0 && (
                    <p className="text-xs text-theme-textSecondary mt-1">
                      No se encontraron impresoras disponibles
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="bg-theme-background rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <Printer className="w-3 h-3 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-theme-text mb-1">
                    {printType === 'pdf' ? 'Impresión PDF' : 'Impresión de Tickets'}
                  </h4>
                  <p className="text-xs text-theme-textSecondary">
                    {printType === 'pdf'
                      ? 'Los PDFs se generarán en formato A4 estándar y se pueden descargar o imprimir.'
                      : 'Los tickets se generarán en formato térmico optimizado para impresoras de recibos.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-3">
              <button
                onClick={handleTestPrint}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <Printer className="w-4 h-4" />
                {loading ? 'Probando...' : 'Probar'}
              </button>
              
              <button
                onClick={handleSaveConfig}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                Guardar
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-theme-textSecondary bg-theme-secondary rounded-lg hover:bg-theme-border transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintConfigModal;
