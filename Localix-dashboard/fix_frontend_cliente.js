// Script para verificar y corregir problemas en el frontend con la creación de clientes

// Función para verificar la conectividad del servidor
async function verificarServidor() {
  console.log('🔍 Verificando conectividad del servidor...');
  
  try {
    const response = await fetch('http://softwarebycg.shop/api/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Servidor respondiendo correctamente');
      console.log('✅ Status:', response.status);
      console.log('✅ Data:', data);
      return true;
    } else {
      console.error('❌ Servidor respondió con error:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Error conectando al servidor:', error.message);
    return false;
  }
}

// Función para verificar la autenticación
async function verificarAutenticacion() {
  console.log('🔍 Verificando autenticación...');
  
  try {
    // Verificar si hay token en localStorage
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      console.log('⚠️ No hay token de autenticación en localStorage');
      return false;
    }
    
    console.log('✅ Token encontrado en localStorage');
    
    // Verificar si el token es válido
    const response = await fetch('http://softwarebycg.shop/api/ventas/clientes/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Token válido - Autenticación exitosa');
      return true;
    } else if (response.status === 401) {
      console.log('❌ Token inválido o expirado');
      return false;
    } else {
      console.log('⚠️ Respuesta inesperada:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Error verificando autenticación:', error.message);
    return false;
  }
}

// Función para probar la creación de clientes
async function probarCreacionCliente() {
  console.log('🔍 Probando creación de cliente...');
  
  try {
    const token = localStorage.getItem('access_token');
    const clienteData = {
      nombre: 'Cliente de Prueba Frontend',
      email: 'test-frontend@example.com',
      telefono: '3001234567',
      tipo_documento: 'dni',
      numero_documento: '12345678',
      direccion: 'Dirección de prueba desde frontend',
      activo: true
    };
    
    console.log('🔍 Datos del cliente:', clienteData);
    
    const response = await fetch('http://softwarebycg.shop/api/ventas/clientes/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(clienteData)
    });
    
    console.log('🔍 Status de respuesta:', response.status);
    console.log('🔍 Headers de respuesta:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Cliente creado exitosamente');
      console.log('✅ Data de respuesta:', data);
      return { success: true, data };
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error creando cliente');
      console.error('❌ Status:', response.status);
      console.error('❌ Error data:', errorData);
      return { success: false, error: errorData };
    }
  } catch (error) {
    console.error('❌ Error en la petición:', error.message);
    return { success: false, error: error.message };
  }
}

// Función para verificar la API de clientes en el preload
function verificarAPI() {
  console.log('🔍 Verificando API de clientes...');
  
  // Verificar si window.clientesAPI existe
  if (!window.clientesAPI) {
    console.error('❌ window.clientesAPI no está disponible');
    return false;
  }
  
  console.log('✅ window.clientesAPI está disponible');
  
  // Verificar métodos disponibles
  const metodos = [
    'obtenerTodos',
    'obtenerPorId',
    'crear',
    'crearRapido',
    'actualizar',
    'eliminar',
    'buscar'
  ];
  
  const metodosDisponibles = metodos.filter(metodo => typeof window.clientesAPI[metodo] === 'function');
  
  console.log('✅ Métodos disponibles:', metodosDisponibles);
  
  if (metodosDisponibles.length === metodos.length) {
    console.log('✅ Todos los métodos están disponibles');
    return true;
  } else {
    console.log('⚠️ Faltan algunos métodos:', metodos.filter(m => !metodosDisponibles.includes(m)));
    return false;
  }
}

// Función para probar la API de clientes
async function probarAPI() {
  console.log('🔍 Probando API de clientes...');
  
  try {
    // Probar obtener todos los clientes
    console.log('🔍 Probando obtenerTodos...');
    const clientesResult = await window.clientesAPI.obtenerTodos();
    console.log('✅ Resultado obtenerTodos:', clientesResult);
    
    // Probar crear cliente
    console.log('🔍 Probando crear cliente...');
    const clienteData = {
      nombre: 'Cliente API Test',
      email: 'api-test@example.com',
      telefono: '3001234567',
      tipo_documento: 'dni',
      numero_documento: '87654321',
      direccion: 'Dirección API test',
      activo: true
    };
    
    const crearResult = await window.clientesAPI.crear(clienteData);
    console.log('✅ Resultado crear:', crearResult);
    
    return { success: true, clientes: clientesResult, crear: crearResult };
  } catch (error) {
    console.error('❌ Error probando API:', error);
    return { success: false, error: error.message };
  }
}

// Función para verificar el componente CustomerModal
function verificarComponente() {
  console.log('🔍 Verificando componente CustomerModal...');
  
  // Verificar si el componente está disponible
  if (typeof window !== 'undefined' && window.React) {
    console.log('✅ React está disponible');
  } else {
    console.log('⚠️ React no está disponible en el contexto global');
  }
  
  // Verificar si hay errores en la consola
  const originalError = console.error;
  const errors = [];
  
  console.error = (...args) => {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  // Simular un error para verificar que funciona
  console.error('Test error');
  
  console.log('✅ Verificación de errores configurada');
  
  return true;
}

// Función para corregir problemas comunes
async function corregirProblemas() {
  console.log('🔧 Iniciando corrección de problemas...');
  
  const problemas = [];
  const soluciones = [];
  
  // 1. Verificar servidor
  console.log('\n=== PASO 1: Verificar servidor ===');
  const servidorOk = await verificarServidor();
  if (!servidorOk) {
    problemas.push('Servidor no responde');
    soluciones.push('Verificar que Django esté ejecutándose en puerto 8000');
  }
  
  // 2. Verificar autenticación
  console.log('\n=== PASO 2: Verificar autenticación ===');
  const authOk = await verificarAutenticacion();
  if (!authOk) {
    problemas.push('Problemas de autenticación');
    soluciones.push('Iniciar sesión nuevamente o verificar credenciales');
  }
  
  // 3. Verificar API
  console.log('\n=== PASO 3: Verificar API ===');
  const apiOk = verificarAPI();
  if (!apiOk) {
    problemas.push('API de clientes no disponible');
    soluciones.push('Reiniciar la aplicación Electron');
  }
  
  // 4. Probar creación directa
  console.log('\n=== PASO 4: Probar creación directa ===');
  const crearOk = await probarCreacionCliente();
  if (!crearOk.success) {
    problemas.push('Error en creación directa de cliente');
    soluciones.push('Verificar logs del backend para errores específicos');
  }
  
  // 5. Probar API
  console.log('\n=== PASO 5: Probar API ===');
  const apiTestOk = await probarAPI();
  if (!apiTestOk.success) {
    problemas.push('Error en API de clientes');
    soluciones.push('Verificar configuración del preload y handlers');
  }
  
  // Mostrar resumen
  console.log('\n=== RESUMEN DE PROBLEMAS ===');
  if (problemas.length === 0) {
    console.log('✅ No se detectaron problemas');
  } else {
    console.log('❌ Problemas detectados:');
    problemas.forEach((problema, index) => {
      console.log(`  ${index + 1}. ${problema}`);
      console.log(`     Solución: ${soluciones[index]}`);
    });
  }
  
  return problemas.length === 0;
}

// Función para mostrar información de diagnóstico
function mostrarDiagnostico() {
  console.log('📊 DIAGNÓSTICO DEL SISTEMA');
  console.log('=' * 40);
  
  // Información del navegador
  console.log('🌐 Navegador:', navigator.userAgent);
  console.log('🔗 URL actual:', window.location.href);
  
  // Información de localStorage
  console.log('💾 localStorage:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(`  - ${key}: ${value ? 'Presente' : 'Vacío'}`);
  }
  
  // Información de sessionStorage
  console.log('💾 sessionStorage:');
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    const value = sessionStorage.getItem(key);
    console.log(`  - ${key}: ${value ? 'Presente' : 'Vacío'}`);
  }
  
  // Verificar APIs disponibles
  console.log('🔌 APIs disponibles:');
  console.log(`  - window.clientesAPI: ${window.clientesAPI ? 'Sí' : 'No'}`);
  console.log(`  - window.electronAPI: ${window.electronAPI ? 'Sí' : 'No'}`);
  console.log(`  - window.ventasAPI: ${window.ventasAPI ? 'Sí' : 'No'}`);
  console.log(`  - window.pedidosAPI: ${window.pedidosAPI ? 'Sí' : 'No'}`);
}

// Función principal
async function main() {
  console.log('🚀 DIAGNÓSTICO Y CORRECCIÓN DE PROBLEMAS CON CLIENTES');
  console.log('=' * 60);
  
  // Mostrar diagnóstico inicial
  mostrarDiagnostico();
  
  // Ejecutar correcciones
  const exito = await corregirProblemas();
  
  if (exito) {
    console.log('\n🎉 SISTEMA FUNCIONANDO CORRECTAMENTE');
    console.log('✅ Puedes crear clientes sin problemas');
  } else {
    console.log('\n⚠️ SE DETECTARON PROBLEMAS');
    console.log('🔧 Revisa las soluciones sugeridas arriba');
  }
}

// Exportar funciones para uso en consola
window.diagnosticoClientes = {
  main,
  verificarServidor,
  verificarAutenticacion,
  probarCreacionCliente,
  verificarAPI,
  probarAPI,
  corregirProblemas,
  mostrarDiagnostico
};

// Ejecutar automáticamente si se carga como script
if (typeof window !== 'undefined') {
  console.log('🔍 Script de diagnóstico de clientes cargado');
  console.log('💡 Ejecuta window.diagnosticoClientes.main() para iniciar el diagnóstico');
}

// Para uso en Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    main,
    verificarServidor,
    verificarAutenticacion,
    probarCreacionCliente,
    verificarAPI,
    probarAPI,
    corregirProblemas,
    mostrarDiagnostico
  };
}