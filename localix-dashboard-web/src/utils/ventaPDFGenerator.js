import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getLogoBase64, createSimpleLogo } from './logoConfig.js';
import { getCompanyData } from './companyConfig.js';

// Cache para el logo con invalidación automática
let logoCache = null;
let logoCacheTimestamp = null;
let lastBrandSettingsHash = null;
const LOGO_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Función para generar hash de configuración de marca
const getBrandSettingsHash = () => {
  const brandSettings = getBrandSettings();
  return JSON.stringify({
    logo: brandSettings.logo,
    showLogo: brandSettings.showLogo,
    companyName: brandSettings.companyName
  });
};

// Función para invalidar caché si cambió la configuración
const invalidateCacheIfNeeded = () => {
  const currentHash = getBrandSettingsHash();
  if (lastBrandSettingsHash !== null && lastBrandSettingsHash !== currentHash) {
    console.log('🔄 Configuración de marca cambió, invalidando caché de logo');
    logoCache = null;
    logoCacheTimestamp = null;
  }
  lastBrandSettingsHash = currentHash;
};

// Función para obtener la configuración de marca desde localStorage
const getBrandSettings = () => {
  try {
    const settings = localStorage.getItem('localix-settings');
    if (settings) {
      const parsedSettings = JSON.parse(settings);
      return parsedSettings.customBrand || {
        logo: null,
        companyName: 'Localix',
        showLogo: true,
        showCompanyName: true
      };
    }
  } catch (error) {
    console.warn('Error al obtener configuración de marca:', error);
  }
  
  return {
    logo: null,
    companyName: 'Localix',
    showLogo: true,
    showCompanyName: true
  };
};

// Función para obtener los colores de PDF desde localStorage
const getPdfColors = () => {
  try {
    const settings = localStorage.getItem('localix-settings');
    if (settings) {
      const parsedSettings = JSON.parse(settings);
      return parsedSettings.pdfColors || {
        primary: '#e91e63',
        secondary: '#f8bbd9',
        accent: '#2196f3',
        neutral: '#6b7280'
      };
    }
  } catch (error) {
    console.warn('Error al obtener configuración de colores PDF:', error);
  }
  
  return {
    primary: '#e91e63',
    secondary: '#f8bbd9',
    accent: '#2196f3',
    neutral: '#6b7280'
  };
};

// Función para cargar la imagen de fondo
const loadBackgroundImage = async () => {
  try {
    console.log('🔍 Intentando cargar imagen de fondo...');
    
    // Primero intentar usar la API de Electron si está disponible
    if (window.electronAPI && window.electronAPI.loadImageAsBase64) {
      console.log('📡 Usando API de Electron para cargar imagen de fondo...');
      const base64 = await window.electronAPI.loadImageAsBase64('logo_Mesa de trabajo 1.png');
      if (base64) {
        console.log('✅ Imagen de fondo cargada exitosamente desde Electron API');
        return base64;
      } else {
        console.log('❌ Electron API no pudo cargar la imagen de fondo');
      }
    } else {
      console.log('⚠️ Electron API no disponible');
    }
    
    // Fallback: intentar cargar usando fetch
    console.log('🌐 Intentando cargar imagen de fondo con fetch...');
    const response = await fetch('/img/logo_Mesa de trabajo 1.png');
    if (response.ok) {
      console.log('✅ Imagen de fondo cargada exitosamente con fetch');
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } else {
      console.log('❌ Fetch no pudo cargar la imagen de fondo:', response.status);
    }
    
    return null;
  } catch (error) {
    console.warn('❌ Error al cargar la imagen de fondo:', error);
    return null;
  }
};

// Función para cargar la imagen real del logo
const loadRealLogo = async () => {
  try {
    console.log('🔍 Intentando cargar imagen real del logo...');
    
    // 1. PRIORIDAD MÁXIMA: Logo de marca personalizada desde configuración
    const brandSettings = getBrandSettings();
    if (brandSettings.showLogo && brandSettings.logo) {
      console.log('🎨 Usando logo de marca personalizada desde configuración');
      // Verificar si es una URL válida de imagen
      if (brandSettings.logo.startsWith('data:image/') || brandSettings.logo.startsWith('blob:') || brandSettings.logo.startsWith('http')) {
        console.log('✅ Logo de marca personalizada encontrado');
        return brandSettings.logo;
      }
    }
    
    // 2. SEGUNDA PRIORIDAD: Lista de posibles nombres de archivo para el logo
    const logoFiles = ['localix-logo.png', 'Logo.png', 'logo.png', 'logo.jpg', 'logo.svg'];
    
    // Primero intentar usar la API de Electron si está disponible
    if (window.electronAPI && window.electronAPI.loadImageAsBase64) {
      console.log('📡 Usando API de Electron para cargar logo...');
      for (const logoFile of logoFiles) {
        const base64 = await window.electronAPI.loadImageAsBase64(logoFile);
        if (base64) {
          console.log(`✅ Imagen cargada exitosamente desde Electron API: ${logoFile}`);
          return base64;
        }
      }
      console.log('❌ Electron API no pudo cargar ninguna imagen');
    } else {
      console.log('⚠️ Electron API no disponible');
    }
    
    // Fallback: intentar cargar usando fetch
    console.log('🌐 Intentando cargar con fetch...');
    for (const logoFile of logoFiles) {
      try {
        const response = await fetch(`/src/img/${logoFile}`);
        if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
          console.log(`✅ Imagen cargada exitosamente con fetch: ${logoFile}`);
          const blob = await response.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        }
      } catch (e) {
        // Continuar con el siguiente archivo
      }
    }
    
    console.log('❌ No se pudo cargar ninguna imagen del logo');
    return null;
  } catch (error) {
    console.warn('❌ Error al cargar la imagen real del logo:', error);
    return null;
  }
};

// Función principal para obtener el logo
const getLogo = async () => {
  try {
    console.log('🔍 Intentando cargar logo...');
    
    // Verificar si necesitamos invalidar el caché
    invalidateCacheIfNeeded();
    
    // Verificar caché válido
    const now = Date.now();
    if (logoCache && logoCacheTimestamp && (now - logoCacheTimestamp) < LOGO_CACHE_DURATION) {
      console.log('✅ Logo obtenido desde caché');
      return logoCache;
    }
    
    console.log('🔄 Caché expirado o vacío, cargando logo...');
    
    // Primero intentar obtener el logo desde la configuración de marca personalizada
    const brandSettings = getBrandSettings();
    if (brandSettings.showLogo && brandSettings.logo) {
      console.log('✅ Logo cargado desde configuración de marca personalizada');
      logoCache = brandSettings.logo;
      logoCacheTimestamp = now;
      return brandSettings.logo;
    }
    
    // Segundo, intentar obtener el logo desde la configuración legacy
    const configLogo = getLogoBase64();
    if (configLogo) {
      console.log('✅ Logo cargado desde configuración legacy');
      logoCache = configLogo;
      logoCacheTimestamp = now;
      return configLogo;
    }
    
    // Si no hay logo en configuración, intentar cargar la imagen real
    const realLogo = await loadRealLogo();
    if (realLogo) {
      console.log('✅ Logo cargado desde archivo');
      logoCache = realLogo;
      logoCacheTimestamp = now;
      return realLogo;
    }
    
    // Como último recurso, usar el logo generado si está habilitado
    if (brandSettings.showLogo) {
      console.log('🔄 Usando logo generado como fallback');
      const fallbackLogo = createSimpleLogo();
      logoCache = fallbackLogo;
      logoCacheTimestamp = now;
      return fallbackLogo;
    }
    
    // Si el logo está deshabilitado, retornar null
    console.log('🚫 Logo deshabilitado en configuración');
    logoCache = null;
    logoCacheTimestamp = now;
    return null;
  } catch (error) {
    console.warn('❌ Error al cargar logo, usando fallback:', error);
    const brandSettings = getBrandSettings();
    const fallbackLogo = brandSettings.showLogo ? createSimpleLogo() : null;
    logoCache = fallbackLogo;
    logoCacheTimestamp = Date.now();
    return fallbackLogo;
  }
};

// Función para obtener la configuración de la tienda
const getTiendaConfig = () => {
  return getCompanyData();
};

// Función para crear el HTML del recibo
const createReciboHTML = (venta, logoImage, backgroundImage) => {
  const fecha = new Date(venta.fecha_venta).toLocaleString('es-ES');
  const clienteNombre = venta.cliente?.nombre || venta.cliente_nombre || 'Cliente General';
  const clienteTelefono = venta.cliente?.telefono || '';
  const clienteEmail = venta.cliente?.email || '';
  
  // Obtener configuración de la tienda
  const TIENDA_CONFIG = getTiendaConfig();
  const brandSettings = getBrandSettings();
  const pdfColors = getPdfColors();
  
  // Usar el nombre de la empresa personalizado si está disponible
  const companyName = brandSettings.showCompanyName ? 
    (brandSettings.companyName || TIENDA_CONFIG.nombre) : 
    TIENDA_CONFIG.nombre;
  
  // Calcular subtotal
  const subtotal = venta.items?.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0) || 0;
  
  // Generar filas de productos
  const productosHTML = venta.items?.map(item => {
    const nombre = item.producto?.nombre || item.producto_nombre || 'Producto';
    const color = item.color?.nombre || '';
    const cantidad = item.cantidad || 0;
    const precio = parseFloat(item.precio_unitario || 0);
      const total = parseFloat(item.subtotal || 0);
    const nombreCompleto = color ? `${nombre} (${color})` : nombre;
    
    return `
      <tr>
        <td class="producto-nombre">${nombreCompleto}</td>
        <td class="cantidad">${cantidad}</td>
        <td class="precio">$${(precio / 100).toFixed(2)}</td>
              <td class="total">$${(total / 100).toFixed(2)}</td>
      </tr>
    `;
  }).join('') || '';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recibo de Venta</title>
        <style>
            @page {
                size: A4;
                margin: 0;
            }
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.3;
                color: #1f2937;
                background: white;
                position: relative;
                min-height: 100vh;
                font-size: 12px;
            }
            
            /* Imagen de fondo con transparencia */
            body::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: url('${backgroundImage || ''}');
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                opacity: 0.3;
                z-index: -1;
            }
            
            .container {
                max-width: 210mm;
                margin: 0 auto;
                padding: 15px;
                background: white;
                min-height: 100vh;
            }
            
            /* Header */
            .header {
                background: #f8fafc;
                color: #1f2937;
                padding: 12px;
                border-radius: 6px;
                margin-bottom: 16px;
                border: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .logo {
                width: 50px;
                height: 50px;
                object-fit: contain;
                border-radius: 4px;
                background: white;
                padding: 4px;
                border: 1px solid #e5e7eb;
            }
            
            .tienda-info h1 {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 4px;
                color: #1e40af;
            }
            
            .tienda-info p {
                font-size: 11px;
                margin: 2px 0;
                color: #64748b;
                font-weight: 400;
            }
            
            /* Información de la venta - Diseño actualizado */
            .venta-info {
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 16px;
                border: 2px solid ${pdfColors.accent};
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                position: relative;
                overflow: hidden;
            }
            
            .venta-info::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, ${pdfColors.primary} 0%, ${pdfColors.accent} 100%);
            }
            
            .venta-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
                padding-bottom: 12px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                position: relative;
                z-index: 1;
            }
            
            .venta-numero {
                font-size: 16px;
                font-weight: 700;
                color: ${pdfColors.primary};
                background: rgba(255, 255, 255, 0.9);
                padding: 8px 16px;
                border-radius: 20px;
                border: 2px solid ${pdfColors.primary};
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                letter-spacing: 0.5px;
            }
            
            .venta-fecha {
                font-size: 12px;
                color: ${pdfColors.neutral};
                font-weight: 600;
                background: rgba(255, 255, 255, 0.9);
                padding: 6px 12px;
                border-radius: 20px;
                border: 1px solid ${pdfColors.secondary};
                backdrop-filter: blur(4px);
            }
            
            .cliente-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin-bottom: 16px;
                position: relative;
                z-index: 1;
            }
            
            .cliente-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.7);
                border-radius: 8px;
                border: 1px solid rgba(0, 0, 0, 0.05);
                transition: all 0.2s ease;
            }
            
            .cliente-label {
                font-weight: 600;
                color: ${pdfColors.primary};
                min-width: 80px;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .cliente-valor {
                color: #374151;
                font-weight: 500;
                font-size: 12px;
            }
            
            /* Tabla de productos */
            .productos-section {
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 16px;
                overflow: hidden;
                margin-bottom: 32px;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }
            
            .productos-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 12px;
                background: white;
                border: 1px solid #e5e7eb;
            }
            
            .productos-table th {
                background: ${pdfColors.primary};
                color: white;
                padding: 8px 6px;
                text-align: left;
                font-weight: 600;
                font-size: 11px;
                text-transform: uppercase;
                border-bottom: 1px solid ${pdfColors.accent};
            }
            
            .productos-table td {
                padding: 6px;
                border-bottom: 1px solid #e5e7eb;
                font-size: 11px;
                font-weight: 400;
                color: #374151;
            }
            
            .productos-table tr:nth-child(even) {
                background: #f8fafc;
            }
            
            .producto-nombre {
                font-weight: 500;
                color: #333;
            }
            
            .cantidad {
                text-align: center;
                font-weight: bold;
                color: #333;
            }
            
            .precio, .total {
                text-align: right;
                font-weight: bold;
            }
            
            .precio {
                color: #666;
            }
            
            .total {
                color: #333;
            }
            
            /* Totales */
            .totales-section {
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 16px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .total-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .total-item:last-child {
                border-bottom: none;
            }
            
            .total-label {
                font-weight: 500;
                color: #374151;
                font-size: 12px;
            }
            
            .total-valor {
                font-weight: 600;
                color: #111827;
                font-size: 12px;
                text-align: right;
            }
            
            .total-final {
                border-top: 2px solid ${pdfColors.primary};
                padding: 12px 0 8px 0;
                margin-top: 8px;
                background: ${pdfColors.secondary};
                border-radius: 6px;
                padding: 12px;
            }
            
            .total-final .total-label {
                font-size: 14px;
                font-weight: 700;
                color: ${pdfColors.primary};
                text-transform: uppercase;
            }
            
            .total-final .total-valor {
                font-size: 16px;
                font-weight: 700;
                color: ${pdfColors.primary};
            }
            
            /* Método de pago */
            .pago-section {
                background: white;
                border: 2px solid #dee2e6;
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .pago-info {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .pago-label {
                font-weight: bold;
                color: #333;
            }
            
            .pago-valor {
                color: #333;
                font-weight: 500;
            }
            
            /* Observaciones */
            ${venta.observaciones ? `
            .observaciones-section {
                background: white;
                border: 2px solid #dee2e6;
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .observaciones-label {
                font-weight: bold;
                color: #333;
                margin-bottom: 8px;
            }
            
            .observaciones-texto {
                color: #333;
                font-style: italic;
            }
            ` : ''}
            
            /* Footer */
            .footer {
                margin-top: 15px;
                padding: 8px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 10px;
                background: #f9fafb;
                border-radius: 4px;
                font-weight: 400;
                line-height: 1.3;
            }
            
            .footer h3 {
                font-weight: 500;
                color: ${pdfColors.primary};
                margin-bottom: 4px;
                font-size: 11px;
            }
            
            .footer p {
                color: #64748b;
                font-size: 9px;
                font-weight: 400;
                margin: 2px 0;
                line-height: 1.3;
            }
            
            /* Responsive */
            @media print {
                body {
                    background: white;
                }
                
                .container {
                    max-width: none;
                    padding: 0;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                ${logoImage ? `<img src="${logoImage}" alt="Logo" class="logo">` : ''}
                <div class="tienda-info">
                    <h1>${companyName}</h1>
                    <p>${TIENDA_CONFIG.direccion}</p>
                    <p>${TIENDA_CONFIG.telefono} | ${TIENDA_CONFIG.ruc}</p>
                    <p>${TIENDA_CONFIG.email}</p>
                </div>
            </div>
            
            <!-- Información de la venta -->
            <div class="venta-info">
                <div class="venta-header">
                    <div class="venta-numero">VENTA #${venta.numero_venta || venta.id}</div>
                    <div class="venta-fecha">${fecha}</div>
                </div>
                
                <div class="cliente-info">
                    <div class="cliente-item">
                        <span class="cliente-label">Cliente:</span>
                        <span class="cliente-valor">${clienteNombre}</span>
                    </div>
                    ${clienteTelefono ? `
                    <div class="cliente-item">
                        <span class="cliente-label">Teléfono:</span>
                        <span class="cliente-valor">${clienteTelefono}</span>
                    </div>
                    ` : ''}
                    ${clienteEmail ? `
                    <div class="cliente-item">
                        <span class="cliente-label">Email:</span>
                        <span class="cliente-valor">${clienteEmail}</span>
                    </div>
                    ` : ''}
                    <div class="cliente-item">
                        <span class="cliente-label">Vendedor:</span>
                        <span class="cliente-valor">${venta.vendedor || 'Sistema'}</span>
                    </div>
                </div>
            </div>
            
            <!-- Tabla de productos -->
            <div class="productos-section">
                <table class="productos-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio Unit.</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productosHTML}
                    </tbody>
                </table>
            </div>
            
            <!-- Totales -->
            <div class="totales-section">
                <div class="total-item">
                    <span class="total-label">Subtotal:</span>
                    <span class="total-valor">$${(subtotal / 100).toFixed(2)}</span>
                </div>
                
                ${venta.porcentaje_descuento && venta.porcentaje_descuento > 0 ? `
                <div class="total-item">
                    <span class="total-label">Descuento (${venta.porcentaje_descuento}%):</span>
                    <span class="total-valor">-$${(((subtotal * venta.porcentaje_descuento) / 100) / 100).toFixed(2)}</span>
                </div>
                ` : ''}
                
                ${venta.precio_envio && venta.precio_envio > 0 ? `
                <div class="total-item">
                    <span class="total-label">Envío:</span>
                    <span class="total-valor">$${(venta.precio_envio / 100).toFixed(2)}</span>
                </div>
                ` : ''}
                
                <div class="total-item total-final">
                    <span class="total-label">TOTAL:</span>
                    <span class="total-valor">$${(venta.total / 100).toFixed(2)}</span>
                </div>
            </div>
            
            <!-- Método de pago -->
            <div class="pago-section">
                <div class="pago-info">
                    <span class="pago-label">Método de pago:</span>
                    <span class="pago-valor">${venta.metodo_pago || 'Efectivo'}</span>
                </div>
            </div>
            
            ${venta.observaciones ? `
            <!-- Observaciones -->
            <div class="observaciones-section">
                <div class="observaciones-label">Observaciones:</div>
                <div class="observaciones-texto">${venta.observaciones}</div>
            </div>
            ` : ''}
            
            <!-- Footer -->
            <div class="footer">
                <h3>¡Gracias por su compra!</h3>
                <p>Para consultas: ${TIENDA_CONFIG.telefono}</p>
                <p>${TIENDA_CONFIG.web}</p>
                <p>Generado el: ${new Date().toLocaleString('es-ES')}</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Función para generar PDF desde HTML
const generatePDFFromHTML = async (htmlContent, fileName, format = 'a4') => {
  try {
    console.log('🔄 Generando PDF desde HTML...');
    
    // Crear un elemento temporal para el HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '210mm'; // Ancho A4
    tempDiv.style.height = 'auto';
    tempDiv.style.background = 'white';
    document.body.appendChild(tempDiv);
    
    // Convertir HTML a canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2, // Mejor calidad
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794, // 210mm en píxeles a 96 DPI
      height: tempDiv.scrollHeight,
      scrollX: 0,
      scrollY: 0
    });
    
    // Remover el elemento temporal
    document.body.removeChild(tempDiv);
    
    // Crear PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: format
    });
    
    const imgWidth = 210; // Ancho A4 en mm
    const pageHeight = 297; // Alto A4 en mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;
    
    // Agregar primera página
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Agregar páginas adicionales si es necesario
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Guardar PDF
    pdf.save(fileName);
    
    console.log('✅ PDF generado exitosamente');
    return pdf;
    
  } catch (error) {
    console.error('❌ Error al generar PDF desde HTML:', error);
    throw error;
  }
};

/**
 * Genera un PDF de recibo para una venta usando HTML
 * @param {Object} venta - Datos de la venta
 * @param {boolean} autoPrint - Si debe imprimir automáticamente
 */
export const generarReciboVenta = async (venta, autoPrint = true) => {
  try {
    console.log('🚀 Iniciando generación de recibo con HTML...');
    
    // Cargar imágenes
    const logoImage = await getLogo();
    const backgroundImage = await loadBackgroundImage();
    
    // Crear HTML del recibo
    const htmlContent = createReciboHTML(venta, logoImage, backgroundImage);
    
    // Generar nombre del archivo
    const fecha = new Date().toISOString().split('T')[0];
    const hora = new Date().toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }).replace(':', '-');
    const fileName = `recibo_${venta.numero_venta || venta.id}_${fecha}_${hora}.pdf`;
    
    // Generar PDF
    const pdf = await generatePDFFromHTML(htmlContent, fileName, 'a4');
    
    // Imprimir si se solicita
    if (autoPrint) {
      if (window.electronAPI && window.electronAPI.printPDF) {
        const pdfBlob = pdf.output('blob');
        window.electronAPI.printPDF(pdfBlob, fileName);
      } else {
        // Fallback: abrir en nueva ventana
        setTimeout(() => {
          window.open(pdf.output('bloburl'), '_blank');
        }, 100);
      }
    }
    
    return pdf;
    
  } catch (error) {
    console.error('❌ Error al generar recibo:', error);
    throw error;
  }
};

/**
 * Genera un recibo simple usando HTML
 * @param {Object} venta - Datos de la venta
 */
export const generarReciboSimple = async (venta) => {
  try {
    console.log('🚀 Iniciando generación de recibo simple con HTML...');
    
    // Cargar imágenes
    const logoImage = await getLogo();
    const backgroundImage = await loadBackgroundImage();
    
    // Crear HTML del recibo (mismo que el anterior)
    const htmlContent = createReciboHTML(venta, logoImage, backgroundImage);
    
    // Generar nombre del archivo
    const fecha = new Date().toISOString().split('T')[0];
    const fileName = `recibo_simple_${venta.numero_venta || venta.id}_${fecha}.pdf`;
    
    // Generar PDF
    const pdf = await generatePDFFromHTML(htmlContent, fileName, 'a4');
    
    return pdf;
    
  } catch (error) {
    console.error('❌ Error al generar recibo simple:', error);
    throw error;
  }
};

/**
 * Función de prueba para verificar la carga de la imagen
 * Puedes llamar esta función desde la consola del navegador
 */
export const testLogoLoading = async () => {
  console.log('🧪 Iniciando prueba de carga de logo...');
  
  try {
    const logo = await getLogo();
    if (logo) {
      console.log('✅ Logo cargado exitosamente');
      console.log('📏 Tamaño del logo (caracteres):', logo.length);
      console.log('🔗 Tipo de logo:', logo.substring(0, 30) + '...');
      
      // Crear una imagen de prueba para verificar
      const img = new Image();
      img.onload = () => {
        console.log('✅ Imagen válida - Dimensiones:', img.width, 'x', img.height);
      };
      img.onerror = () => {
        console.log('❌ Error al cargar la imagen en el DOM');
      };
      img.src = logo;
      
      return logo;
    } else {
      console.log('❌ No se pudo cargar el logo');
      return null;
    }
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    return null;
  }
};

/**
 * Función de prueba para verificar la carga de la imagen de fondo
 * Puedes llamar esta función desde la consola del navegador
 */
export const testBackgroundImageLoading = async () => {
  console.log('🧪 Iniciando prueba de carga de imagen de fondo...');
  
  try {
    const backgroundImage = await loadBackgroundImage();
    if (backgroundImage) {
      console.log('✅ Imagen de fondo cargada exitosamente');
      console.log('📏 Tamaño de la imagen de fondo (caracteres):', backgroundImage.length);
      console.log('🔗 Tipo de imagen de fondo:', backgroundImage.substring(0, 30) + '...');
      
      // Crear una imagen de prueba para verificar
      const img = new Image();
      img.onload = () => {
        console.log('✅ Imagen de fondo válida - Dimensiones:', img.width, 'x', img.height);
      };
      img.onerror = () => {
        console.log('❌ Error al cargar la imagen de fondo en el DOM');
      };
      img.src = backgroundImage;
      
      return backgroundImage;
    } else {
      console.log('❌ No se pudo cargar la imagen de fondo');
      return null;
    }
  } catch (error) {
    console.error('❌ Error en la prueba de imagen de fondo:', error);
    return null;
  }
};

/**
 * Función de prueba para generar un PDF de ejemplo
 */
export const testPDFGeneration = async () => {
  console.log('🧪 Iniciando prueba de generación de PDF...');
  
  try {
    // Datos de prueba
    const ventaPrueba = {
      id: 'TEST001',
      numero_venta: 'V-2024-001',
      fecha_venta: new Date().toISOString(),
      cliente: {
        nombre: 'Cliente de Prueba',
        telefono: '3001234567',
        email: 'cliente@prueba.com'
      },
      items: [
        {
          producto: { nombre: 'Producto 1' },
          color: { nombre: 'Rojo' },
          cantidad: 2,
          precio_unitario: 25.50,
          subtotal: 51.00
        },
        {
          producto: { nombre: 'Producto 2' },
          cantidad: 1,
          precio_unitario: 15.75,
          subtotal: 15.75
        }
      ],
      total: 66.75,
      metodo_pago: 'Efectivo',
      observaciones: 'Esta es una venta de prueba para verificar la generación de PDFs con HTML.'
    };
    
    const pdf = await generarReciboVenta(ventaPrueba, false);
    console.log('✅ PDF de prueba generado exitosamente');
    return pdf;
    
  } catch (error) {
    console.error('❌ Error en la prueba de generación de PDF:', error);
    throw error;
  }
};
