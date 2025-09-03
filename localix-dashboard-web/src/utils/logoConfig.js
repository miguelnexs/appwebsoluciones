// Configuración del logo como base64
// Este archivo contiene la imagen del logo convertida a base64

// Función para obtener el logo como base64
export const getLogoBase64 = () => {
  // Aquí puedes pegar el base64 de tu imagen

  
  // Para obtener el base64 de tu imagen:
  // 1. Abre la imagen en el navegador
  // 2. Abre las herramientas de desarrollador
  // 3. Ve a la consola y ejecuta:
  //    fetch('/img/Logo.png').then(r => r.blob()).then(b => {
  //      const reader = new FileReader();
  //      reader.onload = () => console.log(reader.result);
  //      reader.readAsDataURL(b);
  //    });
  
  // Por ahora, retornamos null para usar el logo generado
  return null;
};

// Función para crear un logo simple como fallback
export const createSimpleLogo = () => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 100;
    canvas.height = 100;
    
    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 100, 100);
    
    // Logo rosa claro
    ctx.fillStyle = '#fce7f3';
    ctx.fillRect(10, 10, 80, 80);
    
    // Texto "CG"
    ctx.fillStyle = '#be185d';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CG', 50, 50);
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.warn('No se pudo crear el logo:', error);
    return null;
  }
}; 
