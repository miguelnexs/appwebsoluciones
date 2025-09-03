import React, { useState, useEffect } from 'react';
import { Printer, FileText, Receipt, Settings, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import PrintConfigModal from './PrintConfigModal';

const PrintSelector = ({ 
  data, 
  type = 'venta', // 'venta' o 'pedido'
  onPrintComplete = null,
  className = '',
  showConfigButton = true 
}) => {
  const [printConfig, setPrintConfig] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [printType, setPrintType] = useState(null); // Para mostrar el tipo actual

  useEffect(() => {
    loadPrintConfig();
  }, []);

  const loadPrintConfig = () => {
    try {
      const savedConfig = localStorage.getItem('printConfig');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setPrintConfig(config);
        setPrintType(config.printType);
      } else {
        // Configuración por defecto
        const defaultConfig = {
          printType: 'pdf',
          ticketSize: '80mm',
          selectedPrinter: ''
        };
        setPrintConfig(defaultConfig);
        setPrintType('pdf');
      }
    } catch (error) {
      console.error('Error cargando configuración de impresión:', error);
      setPrintConfig({ printType: 'pdf', ticketSize: '80mm', selectedPrinter: '' });
      setPrintType('pdf');
    }
  };

  const handleConfigSave = (newConfig) => {
    setPrintConfig(newConfig);
    setPrintType(newConfig.printType);
    toast.success('Configuración de impresión guardada');
  };

  const handlePrint = async (forceType = null) => {
    if (!data) {
      toast.error('No hay datos para imprimir');
      return;
    }

    if (!printConfig) {
      toast.error('Configuración de impresión no disponible');
      return;
    }

    const typeToUse = forceType || printConfig.printType;

    setPrinting(true);
    try {
      if (typeToUse === 'pdf') {
        await handlePDFPrint();
      } else {
        await handleTicketPrint();
      }
      
      if (onPrintComplete) {
        onPrintComplete(typeToUse);
      }
    } catch (error) {
      console.error('Error en impresión:', error);
      toast.error('Error al imprimir');
    } finally {
      setPrinting(false);
    }
  };

  const handlePDFPrint = async () => {
    try {
      if (type === 'venta') {
        const { generarReciboVenta } = await import('../utils/ventaPDFGenerator');
        await generarReciboVenta(data, false); // false = no auto print, solo generar
        toast.success('PDF generado exitosamente');
      } else if (type === 'pedido') {
        const { generarReportePedido } = await import('../utils/pedidoPDFGenerator');
        await generarReportePedido(data, false);
        toast.success('Reporte PDF generado exitosamente');
      }
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new Error('Error al generar PDF');
    }
  };

  const handleTicketPrint = async () => {
    if (!printConfig.selectedPrinter) {
      toast.error('Selecciona una impresora en la configuración');
      return;
    }

    try {
      if (type === 'venta') {
        const { generarTicketVenta } = await import('../utils/ticketGenerator');
        await generarTicketVenta(data, printConfig.ticketSize, true); // true = auto print
        toast.success('Ticket impreso exitosamente');
      } else if (type === 'pedido') {
        const { generarTicketPedido } = await import('../utils/ticketGenerator');
        await generarTicketPedido(data, printConfig.ticketSize, true);
        toast.success('Ticket de pedido impreso exitosamente');
      }
    } catch (error) {
      console.error('Error imprimiendo ticket:', error);
      throw new Error('Error al imprimir ticket');
    }
  };

  const getPrintButtonText = () => {
    if (printing) return 'Imprimiendo...';
    
    if (printType === 'pdf') {
      return type === 'venta' ? 'Generar PDF' : 'Generar Reporte PDF';
    } else {
      return type === 'venta' ? 'Imprimir Ticket' : 'Imprimir Ticket Pedido';
    }
  };

  const getPrintIcon = () => {
    if (printType === 'pdf') {
      return <FileText className="w-4 h-4" />;
    } else {
      return <Receipt className="w-4 h-4" />;
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Botón principal de impresión */}
      <button
        onClick={() => handlePrint()}
        disabled={printing || !data}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {printing ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          getPrintIcon()
        )}
        {getPrintButtonText()}
      </button>

      {/* Botón alternativo (mostrar la otra opción) */}
      {printConfig && (
        <button
          onClick={() => handlePrint(printType === 'pdf' ? 'ticket' : 'pdf')}
          disabled={printing || !data || (printType !== 'pdf' && !printConfig.selectedPrinter)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          title={printType === 'pdf' ? 'Imprimir como ticket' : 'Generar como PDF'}
        >
          {printType === 'pdf' ? (
            <Receipt className="w-4 h-4" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Botón de configuración */}
      {showConfigButton && (
        <button
          onClick={() => setShowConfigModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          title="Configurar impresión"
        >
          <Settings className="w-4 h-4" />
        </button>
      )}

      {/* Indicador del tipo de impresión actual */}
      {printConfig && (
        <div className="flex items-center space-x-1 text-xs text-theme-textSecondary">
          <span>Modo:</span>
          <span className={`px-2 py-1 rounded ${
            printType === 'pdf' 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}>
            {printType === 'pdf' ? 'PDF' : `Ticket ${printConfig.ticketSize}`}
          </span>
        </div>
      )}

      {/* Modal de configuración */}
      <PrintConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onConfigSave={handleConfigSave}
        currentConfig={printConfig}
      />
    </div>
  );
};

export default PrintSelector;
