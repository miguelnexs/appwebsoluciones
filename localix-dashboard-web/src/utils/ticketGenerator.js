import jsPDF from 'jspdf';

// Configuraciones de tamaños de ticket
const TICKET_SIZES = {
  '58mm': {
    width: 58,
    height: 'auto', // Se ajusta automáticamente según el contenido
    maxWidth: 58,
    fontSize: 8,
    lineHeight: 3,
    margin: 2
  },
  '80mm': {
    width: 80,
    height: 'auto',
    maxWidth: 80,
    fontSize: 10,
    lineHeight: 4,
    margin: 3
  },
  '110mm': {
    width: 110,
    height: 'auto',
    maxWidth: 110,
    fontSize: 12,
    lineHeight: 5,
    margin: 4
  }
};

// Cache para datos de empresa
let empresaCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene los datos de la empresa desde la configuración
 */
const getBrandSettings = async () => {
  const now = Date.now();
  
  // Verificar si el cache es válido
  if (empresaCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return empresaCache;
  }

  try {
    let brandSettings;
    
    if (window.electronAPI && window.electronAPI.config) {
      brandSettings = await window.electronAPI.config.getBrandSettings();
    } else {
      // Fallback para desarrollo
      const response = await fetch('/api/config/brand');
      brandSettings = await response.json();
    }

    empresaCache = brandSettings;
    cacheTimestamp = now;
    return brandSettings;
  } catch (error) {
    console.error('Error obteniendo configuración de empresa:', error);
    return {
      nombre: 'Mi Empresa',
      direccion: 'Dirección no configurada',
      telefono: 'Teléfono no configurado',
      email: 'email@empresa.com'
    };
  }
};

/**
 * Genera un ticket de venta en formato térmico
 * @param {Object} venta - Datos de la venta
 * @param {string} ticketSize - Tamaño del ticket ('58mm', '80mm', '110mm')
 * @param {boolean} autoPrint - Si debe imprimir automáticamente
 * @returns {jsPDF} Documento PDF del ticket
 */
export const generarTicketVenta = async (venta, ticketSize = '80mm', autoPrint = false) => {
  try {
    const config = TICKET_SIZES[ticketSize];
    if (!config) {
      throw new Error(`Tamaño de ticket no válido: ${ticketSize}`);
    }

    // Crear documento PDF con tamaño personalizado
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [config.width, 200] // Altura inicial, se ajustará después
    });

    let yPosition = config.margin;
    const { fontSize, lineHeight, margin, maxWidth } = config;

    // Configurar fuente
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);

    // Obtener datos de la empresa
    const empresa = await getBrandSettings();

    // Función para agregar texto centrado
    const addCenteredText = (text, y, bold = false) => {
      if (bold) doc.setFont('helvetica', 'bold');
      const textWidth = doc.getTextWidth(text);
      const x = (config.width - textWidth) / 2;
      doc.text(text, x, y);
      if (bold) doc.setFont('helvetica', 'normal');
      return y + lineHeight;
    };

    // Función para agregar texto justificado
    const addJustifiedText = (label, value, y) => {
      const labelWidth = doc.getTextWidth(label);
      const valueWidth = doc.getTextWidth(value);
      const availableSpace = maxWidth - margin * 2 - labelWidth - valueWidth;
      
      doc.text(label, margin, y);
      doc.text(value, maxWidth - margin - valueWidth, y);
      return y + lineHeight;
    };

    // Función para agregar línea separadora
    const addSeparatorLine = (y) => {
      const lineChar = '-';
      const lineLength = Math.floor((maxWidth - margin * 2) / doc.getTextWidth(lineChar));
      const line = lineChar.repeat(lineLength);
      return addCenteredText(line, y);
    };

    // Encabezado de la empresa
    yPosition = addCenteredText(empresa.nombre.toUpperCase(), yPosition, true);
    
    if (empresa.direccion) {
      yPosition = addCenteredText(empresa.direccion, yPosition);
    }
    
    if (empresa.telefono) {
      yPosition = addCenteredText(`Tel: ${empresa.telefono}`, yPosition);
    }
    
    if (empresa.email) {
      yPosition = addCenteredText(empresa.email, yPosition);
    }

    yPosition = addSeparatorLine(yPosition + 2);

    // Información de la venta
    yPosition = addCenteredText('TICKET DE VENTA', yPosition + 2, true);
    yPosition += 2;

    yPosition = addJustifiedText('Ticket:', venta.numero_venta || venta.id, yPosition);
    
    const fecha = new Date(venta.fecha_venta || venta.created_at);
    yPosition = addJustifiedText('Fecha:', fecha.toLocaleDateString('es-ES'), yPosition);
    yPosition = addJustifiedText('Hora:', fecha.toLocaleTimeString('es-ES'), yPosition);
    
    if (venta.cliente && venta.cliente.nombre) {
      yPosition = addJustifiedText('Cliente:', venta.cliente.nombre, yPosition);
    } else if (venta.cliente_nombre) {
      yPosition = addJustifiedText('Cliente:', venta.cliente_nombre, yPosition);
    }

    if (venta.vendedor) {
      yPosition = addJustifiedText('Vendedor:', venta.vendedor, yPosition);
    }

    yPosition = addSeparatorLine(yPosition + 2);

    // Productos
    yPosition += 2;
    
    // Encabezado de productos
    doc.setFontSize(fontSize - 1);
    doc.text('CANT', margin, yPosition);
    doc.text('PRODUCTO', margin + 10, yPosition);
    doc.text('TOTAL', maxWidth - margin - 15, yPosition);
    yPosition += lineHeight;
    
    yPosition = addSeparatorLine(yPosition);
    
    doc.setFontSize(fontSize);
    
    let subtotal = 0;
    
    // Procesar items de la venta
    const items = venta.items || venta.productos || [];
    
    for (const item of items) {
      const producto = item.producto || item;
      const cantidad = item.cantidad || 1;
      const precio = item.precio_unitario || item.precio || 0;
      const itemTotal = item.subtotal || (cantidad * precio);
      
      subtotal += itemTotal;
      
      // Cantidad
      doc.text(cantidad.toString(), margin, yPosition);
      
      // Nombre del producto (puede ocupar múltiples líneas)
      const nombreProducto = producto.nombre || 'Producto';
      const maxProductNameWidth = maxWidth - margin * 2 - 20; // Espacio para cantidad y precio
      
      const lines = doc.splitTextToSize(nombreProducto, maxProductNameWidth);
      doc.text(lines, margin + 10, yPosition);
      
      // Total del item
      const totalText = `$${(itemTotal / 100).toFixed(2)}`;
      const totalWidth = doc.getTextWidth(totalText);
      doc.text(totalText, maxWidth - margin - totalWidth, yPosition);
      
      yPosition += lineHeight * Math.max(1, lines.length);
      
      // Si hay color o talla, agregar como sublínea
      if (item.color || item.talla) {
        doc.setFontSize(fontSize - 1);
        let detalles = [];
        if (item.color) detalles.push(`Color: ${item.color}`);
        if (item.talla) detalles.push(`Talla: ${item.talla}`);
        doc.text(detalles.join(', '), margin + 10, yPosition);
        yPosition += lineHeight;
        doc.setFontSize(fontSize);
      }
    }

    yPosition = addSeparatorLine(yPosition + 1);

    // Totales
    yPosition += 2;
    
    yPosition = addJustifiedText('Subtotal:', `$${(subtotal / 100).toFixed(2)}`, yPosition);
    
    // Descuento si existe
    if (venta.descuento && venta.descuento > 0) {
      yPosition = addJustifiedText('Descuento:', `-$${(venta.descuento / 100).toFixed(2)}`, yPosition);
    }
    
    // Envío si existe
    if (venta.precio_envio && venta.precio_envio > 0) {
      yPosition = addJustifiedText('Envío:', `$${(venta.precio_envio / 100).toFixed(2)}`, yPosition);
    }
    
    yPosition = addSeparatorLine(yPosition + 1);
    
    // Total final
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fontSize + 1);
    yPosition = addJustifiedText('TOTAL:', `$${((venta.total || subtotal) / 100).toFixed(2)}`, yPosition + 1);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);

    yPosition += 2;
    yPosition = addSeparatorLine(yPosition);

    // Método de pago
    yPosition += 2;
    const metodoPago = venta.metodo_pago || 'No especificado';
    yPosition = addJustifiedText('Pago:', metodoPago.toUpperCase(), yPosition);

    // Observaciones si existen
    if (venta.observaciones) {
      yPosition += 2;
      yPosition = addSeparatorLine(yPosition);
      yPosition += 2;
      doc.text('Observaciones:', margin, yPosition);
      yPosition += lineHeight;
      const obsLines = doc.splitTextToSize(venta.observaciones, maxWidth - margin * 2);
      doc.text(obsLines, margin, yPosition);
      yPosition += lineHeight * obsLines.length;
    }

    // Pie del ticket
    yPosition += 4;
    yPosition = addSeparatorLine(yPosition);
    yPosition += 2;
    yPosition = addCenteredText('¡Gracias por su compra!', yPosition, true);
    yPosition += 2;
    yPosition = addCenteredText(new Date().toLocaleString('es-ES'), yPosition);

    // Ajustar el tamaño del documento al contenido
    const finalHeight = yPosition + margin;
    doc.internal.pageSize.setHeight(finalHeight);

    // Imprimir automáticamente si se solicita
    if (autoPrint && window.electronAPI && window.electronAPI.pdf) {
      try {
        const pdfBlob = doc.output('blob');
        await window.electronAPI.pdf.imprimir(pdfBlob, `ticket_${venta.numero_venta || venta.id}.pdf`);
      } catch (error) {
        console.error('Error al imprimir ticket:', error);
        throw error;
      }
    }

    return doc;
  } catch (error) {
    console.error('Error generando ticket:', error);
    throw error;
  }
};

/**
 * Genera un ticket de pedido en formato térmico
 * @param {Object} pedido - Datos del pedido
 * @param {string} ticketSize - Tamaño del ticket
 * @param {boolean} autoPrint - Si debe imprimir automáticamente
 * @returns {jsPDF} Documento PDF del ticket
 */
export const generarTicketPedido = async (pedido, ticketSize = '80mm', autoPrint = false) => {
  try {
    const config = TICKET_SIZES[ticketSize];
    if (!config) {
      throw new Error(`Tamaño de ticket no válido: ${ticketSize}`);
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [config.width, 200]
    });

    let yPosition = config.margin;
    const { fontSize, lineHeight, margin, maxWidth } = config;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);

    const empresa = await getBrandSettings();

    // Funciones auxiliares (reutilizadas del generador de ventas)
    const addCenteredText = (text, y, bold = false) => {
      if (bold) doc.setFont('helvetica', 'bold');
      const textWidth = doc.getTextWidth(text);
      const x = (config.width - textWidth) / 2;
      doc.text(text, x, y);
      if (bold) doc.setFont('helvetica', 'normal');
      return y + lineHeight;
    };

    const addJustifiedText = (label, value, y) => {
      const labelWidth = doc.getTextWidth(label);
      const valueWidth = doc.getTextWidth(value);
      doc.text(label, margin, y);
      doc.text(value, maxWidth - margin - valueWidth, y);
      return y + lineHeight;
    };

    const addSeparatorLine = (y) => {
      const lineChar = '-';
      const lineLength = Math.floor((maxWidth - margin * 2) / doc.getTextWidth(lineChar));
      const line = lineChar.repeat(lineLength);
      return addCenteredText(line, y);
    };

    // Encabezado
    yPosition = addCenteredText(empresa.nombre.toUpperCase(), yPosition, true);
    if (empresa.direccion) yPosition = addCenteredText(empresa.direccion, yPosition);
    if (empresa.telefono) yPosition = addCenteredText(`Tel: ${empresa.telefono}`, yPosition);
    
    yPosition = addSeparatorLine(yPosition + 2);
    yPosition = addCenteredText('TICKET DE PEDIDO', yPosition + 2, true);
    yPosition += 2;

    // Información del pedido
    yPosition = addJustifiedText('Pedido:', pedido.numero_pedido || pedido.id, yPosition);
    
    const fecha = new Date(pedido.fecha_creacion || pedido.created_at);
    yPosition = addJustifiedText('Fecha:', fecha.toLocaleDateString('es-ES'), yPosition);
    
    // Estado del pedido
    const estado = pedido.estado_pedido || 'pendiente';
    yPosition = addJustifiedText('Estado:', estado.toUpperCase(), yPosition);
    
    // Cliente
    const clienteNombre = pedido.cliente?.nombre || pedido.venta?.cliente_nombre || 'Cliente anónimo';
    yPosition = addJustifiedText('Cliente:', clienteNombre, yPosition);
    
    if (pedido.telefono_contacto) {
      yPosition = addJustifiedText('Teléfono:', pedido.telefono_contacto, yPosition);
    }

    yPosition = addSeparatorLine(yPosition + 2);

    // Productos del pedido
    yPosition += 2;
    doc.setFontSize(fontSize - 1);
    doc.text('CANT', margin, yPosition);
    doc.text('PRODUCTO', margin + 10, yPosition);
    doc.text('TOTAL', maxWidth - margin - 15, yPosition);
    yPosition += lineHeight;
    yPosition = addSeparatorLine(yPosition);
    
    doc.setFontSize(fontSize);
    
    let subtotal = 0;
    const items = pedido.items || pedido.productos || [];
    
    for (const item of items) {
      const producto = item.producto || item;
      const cantidad = item.cantidad || 1;
      const precio = item.precio_unitario || item.precio || 0;
      const itemTotal = item.subtotal || (cantidad * precio);
      
      subtotal += itemTotal;
      
      doc.text(cantidad.toString(), margin, yPosition);
      
      const nombreProducto = producto.nombre || 'Producto';
      const maxProductNameWidth = maxWidth - margin * 2 - 20;
      const lines = doc.splitTextToSize(nombreProducto, maxProductNameWidth);
      doc.text(lines, margin + 10, yPosition);
      
      const totalText = `$${(itemTotal / 100).toFixed(2)}`;
      const totalWidth = doc.getTextWidth(totalText);
      doc.text(totalText, maxWidth - margin - totalWidth, yPosition);
      
      yPosition += lineHeight * Math.max(1, lines.length);
    }

    yPosition = addSeparatorLine(yPosition + 1);
    yPosition += 2;
    
    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fontSize + 1);
    yPosition = addJustifiedText('TOTAL:', `$${((pedido.total || subtotal) / 100).toFixed(2)}`, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);

    // Información adicional
    if (pedido.direccion_entrega) {
      yPosition += 2;
      yPosition = addSeparatorLine(yPosition);
      yPosition += 2;
      doc.text('Dirección de entrega:', margin, yPosition);
      yPosition += lineHeight;
      const dirLines = doc.splitTextToSize(pedido.direccion_entrega, maxWidth - margin * 2);
      doc.text(dirLines, margin, yPosition);
      yPosition += lineHeight * dirLines.length;
    }

    if (pedido.notas) {
      yPosition += 2;
      yPosition = addSeparatorLine(yPosition);
      yPosition += 2;
      doc.text('Notas:', margin, yPosition);
      yPosition += lineHeight;
      const notasLines = doc.splitTextToSize(pedido.notas, maxWidth - margin * 2);
      doc.text(notasLines, margin, yPosition);
      yPosition += lineHeight * notasLines.length;
    }

    // Pie del ticket
    yPosition += 4;
    yPosition = addSeparatorLine(yPosition);
    yPosition += 2;
    yPosition = addCenteredText('Ticket generado automáticamente', yPosition);
    yPosition += 2;
    yPosition = addCenteredText(new Date().toLocaleString('es-ES'), yPosition);

    // Ajustar tamaño
    const finalHeight = yPosition + margin;
    doc.internal.pageSize.setHeight(finalHeight);

    // Imprimir si se solicita
    if (autoPrint && window.electronAPI && window.electronAPI.pdf) {
      try {
        const pdfBlob = doc.output('blob');
        await window.electronAPI.pdf.imprimir(pdfBlob, `ticket_pedido_${pedido.numero_pedido || pedido.id}.pdf`);
      } catch (error) {
        console.error('Error al imprimir ticket de pedido:', error);
        throw error;
      }
    }

    return doc;
  } catch (error) {
    console.error('Error generando ticket de pedido:', error);
    throw error;
  }
};

/**
 * Obtiene los tamaños de ticket disponibles
 * @returns {Array} Lista de tamaños disponibles
 */
export const getAvailableTicketSizes = () => {
  return Object.keys(TICKET_SIZES).map(size => ({
    value: size,
    label: size,
    width: TICKET_SIZES[size].width
  }));
};

/**
 * Invalida el cache de datos de empresa
 */
export const invalidateEmpresaCache = () => {
  empresaCache = null;
  cacheTimestamp = null;
};
