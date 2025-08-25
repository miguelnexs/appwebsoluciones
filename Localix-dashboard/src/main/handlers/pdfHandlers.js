const { ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

/**
 * Handler para imprimir PDF automáticamente
 */
ipcMain.handle('pdf:print', async (event, pdfBlob, fileName) => {
  try {
    // Crear una ventana oculta para imprimir
    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    // Convertir blob a base64
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:application/pdf;base64,${base64}`;

    // Cargar el PDF en la ventana
    await printWindow.loadURL(dataUrl);

    // Esperar a que se cargue completamente
    await new Promise(resolve => {
      printWindow.webContents.on('did-finish-load', resolve);
    });

    // Imprimir automáticamente
    const printOptions = {
      silent: false,
      printBackground: true,
      color: true,
      margin: {
        marginType: 'printableArea'
      },
      landscape: false,
      pagesPerSheet: 1,
      collate: false,
      copies: 1,
      header: '',
      footer: ''
    };

    const printResult = await printWindow.webContents.print(printOptions);
    
    // Cerrar la ventana después de imprimir
    printWindow.close();

    return { success: true, printed: printResult };
  } catch (error) {
    console.error('Error al imprimir PDF:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Handler para guardar PDF
 */
ipcMain.handle('pdf:save', async (event, pdfBlob, fileName) => {
  try {
    // Obtener la carpeta de descargas del usuario
    const downloadsPath = path.join(os.homedir(), 'Downloads');
    const filePath = path.join(downloadsPath, fileName);

    // Convertir blob a buffer
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Guardar el archivo
    fs.writeFileSync(filePath, buffer);

    return { success: true, filePath };
  } catch (error) {
    console.error('Error al guardar PDF:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Handler para generar y imprimir recibo de venta
 */
ipcMain.handle('venta:imprimir-recibo', async (event, ventaData) => {
  try {
    // Aquí podrías generar el PDF usando una librería como puppeteer
    // Por ahora, retornamos éxito para que el frontend maneje la generación
    return { success: true, message: 'Recibo listo para imprimir' };
  } catch (error) {
    console.error('Error al generar recibo:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Handler para obtener impresora por defecto
 */
ipcMain.handle('printer:get-default', async (event) => {
  try {
    // Obtener la ventana principal desde el evento
    const webContents = event.sender;
    const printers = webContents.getPrinters();
    
    // Buscar la impresora por defecto
    const defaultPrinter = printers.find(printer => printer.isDefault) || printers[0];
    
    console.log('Impresoras disponibles:', printers.length);
    console.log('Impresora por defecto:', defaultPrinter?.name || 'No encontrada');
    
    return { success: true, printer: defaultPrinter };
  } catch (error) {
    console.error('Error al obtener impresora por defecto:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Handler para listar impresoras disponibles
 */
ipcMain.handle('printer:list', async (event) => {
  try {
    // Obtener la ventana principal desde el evento
    const webContents = event.sender;
    const printers = webContents.getPrinters();
    
    console.log('Listando impresoras disponibles:', printers.length);
    printers.forEach((printer, index) => {
      console.log(`${index + 1}. ${printer.name} ${printer.isDefault ? '(Por defecto)' : ''}`);
    });
    
    return { success: true, printers };
  } catch (error) {
    console.error('Error al listar impresoras:', error);
    return { success: false, error: error.message };
  }
});
