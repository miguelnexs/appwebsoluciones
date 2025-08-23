const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, 'src', 'preload', 'index.js');
const targetFile = path.join(__dirname, 'out', 'preload', 'index.js');

console.log('🔧 Verificando archivo preload...');
console.log('📁 Archivo fuente:', sourceFile);
console.log('📁 Archivo destino:', targetFile);

// Verificar si existe el archivo fuente
if (!fs.existsSync(sourceFile)) {
  console.error('❌ Error: El archivo fuente no existe:', sourceFile);
  process.exit(1);
}

// Crear directorio de destino si no existe
const targetDir = path.dirname(targetFile);
if (!fs.existsSync(targetDir)) {
  console.log('📁 Creando directorio:', targetDir);
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copiar archivo
try {
  fs.copyFileSync(sourceFile, targetFile);
  console.log('✅ Archivo copiado exitosamente');
  
  // Verificar que se copió correctamente
  if (fs.existsSync(targetFile)) {
    console.log('✅ Verificación exitosa: El archivo existe en el destino');
  } else {
    console.error('❌ Error: El archivo no se copió correctamente');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error copiando archivo:', error.message);
  process.exit(1);
}
