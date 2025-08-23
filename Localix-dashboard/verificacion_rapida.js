// Script de verificación rápida para la API de clientes
// Copiar y pegar este código en la consola del navegador (F12)

(function() {
  console.log('🔍 VERIFICACIÓN RÁPIDA DE LA API DE CLIENTES');
  console.log('=' * 50);
  
  let problemas = [];
  let soluciones = [];
  
  // 1. Verificar window.clientesAPI
  console.log('1. Verificando window.clientesAPI...');
  if (window.clientesAPI) {
    console.log('✅ window.clientesAPI está disponible');
    
    // Verificar métodos específicos
    const metodos = ['obtenerTodos', 'crear', 'actualizar', 'eliminar', 'buscar'];
    const metodosDisponibles = metodos.filter(metodo => typeof window.clientesAPI[metodo] === 'function');
    
    console.log('✅ Métodos disponibles:', metodosDisponibles);
    
    if (metodosDisponibles.length === metodos.length) {
      console.log('✅ Todos los métodos están disponibles');
    } else {
      const faltantes = metodos.filter(m => !metodosDisponibles.includes(m));
      console.log('❌ Métodos faltantes:', faltantes);
      problemas.push(`Faltan métodos: ${faltantes.join(', ')}`);
      soluciones.push('Reiniciar la aplicación Electron');
    }
  } else {
    console.log('❌ window.clientesAPI NO está disponible');
    problemas.push('window.clientesAPI no está disponible');
    soluciones.push('Reiniciar la aplicación Electron');
  }
  
  // 2. Verificar otras APIs
  console.log('\n2. Verificando otras APIs...');
  const apis = {
    'window.electronAPI': window.electronAPI,
    'window.ventasAPI': window.ventasAPI,
    'window.pedidosAPI': window.pedidosAPI
  };
  
  Object.entries(apis).forEach(([nombre, api]) => {
    if (api) {
      console.log(`${nombre}: ✅ Disponible`);
    } else {
      console.log(`${nombre}: ❌ No disponible`);
      problemas.push(`${nombre} no está disponible`);
    }
  });
  
  // 3. Verificar localStorage
  console.log('\n3. Verificando localStorage...');
  const token = localStorage.getItem('access_token');
  if (token) {
    console.log('✅ Token de acceso presente');
  } else {
    console.log('❌ No hay token de acceso');
    problemas.push('No hay token de autenticación');
    soluciones.push('Iniciar sesión nuevamente');
  }
  
  // 4. Probar conexión al servidor
  console.log('\n4. Probando conexión al servidor...');
  fetch('http://softwarebycg.shop/api/')
    .then(response => {
      if (response.ok) {
        console.log('✅ Servidor respondiendo correctamente');
      } else {
        console.log('❌ Servidor respondió con error:', response.status);
        problemas.push(`Servidor respondió con error ${response.status}`);
        soluciones.push('Verificar que Django esté ejecutándose');
      }
    })
    .catch(error => {
      console.log('❌ Error conectando al servidor:', error.message);
      problemas.push('No se puede conectar al servidor');
      soluciones.push('Iniciar el servidor Django');
    });
  
  // 5. Función para probar la API
  async function probarAPI() {
    console.log('\n5. Probando API de clientes...');
    
    if (!window.clientesAPI) {
      console.log('❌ No se puede probar - window.clientesAPI no está disponible');
      return;
    }
    
    try {
      // Probar obtener clientes
      console.log('🔍 Probando obtenerTodos...');
      const result = await window.clientesAPI.obtenerTodos();
      console.log('✅ Resultado obtenerTodos:', result);
      
      if (result && result.success) {
        console.log('✅ API de clientes funcionando correctamente');
      } else {
        console.log('❌ Error en obtenerTodos:', result?.error);
        problemas.push('Error en API obtenerTodos');
        soluciones.push('Verificar logs del backend');
      }
      
    } catch (error) {
      console.log('❌ Error probando API:', error);
      problemas.push('Error al probar API');
      soluciones.push('Reiniciar aplicación y verificar logs');
    }
  }
  
  // 6. Función para mostrar resumen
  function mostrarResumen() {
    console.log('\n📊 RESUMEN DEL DIAGNÓSTICO');
    console.log('=' * 30);
    
    if (problemas.length === 0) {
      console.log('✅ No se detectaron problemas evidentes');
      console.log('💡 Si sigues teniendo problemas, verifica:');
      console.log('   - Los logs del servidor Django');
      console.log('   - Los logs de la aplicación Electron');
      console.log('   - La configuración de la base de datos');
    } else {
      console.log('❌ Problemas detectados:');
      problemas.forEach((problema, index) => {
        console.log(`   ${index + 1}. ${problema}`);
        if (soluciones[index]) {
          console.log(`      Solución: ${soluciones[index]}`);
        }
      });
      
      console.log('\n🔧 SOLUCIONES RECOMENDADAS:');
      console.log('   1. Reiniciar la aplicación Electron');
      console.log('   2. Verificar que el servidor Django esté ejecutándose');
      console.log('   3. Verificar que los handlers estén registrados');
      console.log('   4. Iniciar sesión nuevamente');
    }
  }
  
  // Ejecutar pruebas
  setTimeout(() => {
    probarAPI();
    setTimeout(mostrarResumen, 1000);
  }, 1000);
  
  // Función para reiniciar manualmente
  window.reiniciarAplicacion = function() {
    console.log('🔄 Para reiniciar la aplicación:');
    console.log('   1. Cerrar completamente la aplicación Electron');
    console.log('   2. Esperar 5 segundos');
    console.log('   3. Volver a abrir la aplicación');
    console.log('   4. Ejecutar este script nuevamente');
  };
  
  // Función para limpiar cache
  window.limpiarCache = function() {
    console.log('🧹 Para limpiar cache:');
    console.log('   1. Cerrar la aplicación');
    console.log('   2. Eliminar carpeta: %APPDATA%\\Localix (Windows)');
    console.log('   3. Reiniciar la aplicación');
  };
  
  console.log('\n💡 Funciones disponibles:');
  console.log('   - probarAPI() - Probar la API de clientes');
  console.log('   - mostrarResumen() - Mostrar resumen del diagnóstico');
  console.log('   - reiniciarAplicacion() - Instrucciones de reinicio');
  console.log('   - limpiarCache() - Instrucciones de limpieza de cache');
  
})();