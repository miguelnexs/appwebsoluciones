// Script de prueba para diagnosticar problemas con la creación de clientes
const axios = require('axios');

// Configuración
const API_BASE_URL = 'http://softwarebycg.shop';
const TEST_CLIENTE = {
  nombre: 'Cliente de Prueba',
  email: 'test@example.com',
  telefono: '3001234567',
  tipo_documento: 'dni',
  numero_documento: '12345678',
  direccion: 'Dirección de prueba',
  activo: true
};

// Función para obtener token de autenticación
async function getAuthToken() {
  try {
    console.log('🔍 Obteniendo token de autenticación...');
    
    // Intentar obtener token desde localStorage del navegador
    // Esto es solo para pruebas, en producción se manejaría diferente
    const response = await axios.post(`${API_BASE_URL}/api/auth/login/`, {
      username: 'admin', // Cambiar por credenciales reales
      password: 'admin123'
    });
    
    if (response.data.access) {
      console.log('✅ Token obtenido exitosamente');
      return response.data.access;
    } else {
      console.log('❌ No se pudo obtener token');
      return null;
    }
  } catch (error) {
    console.error('❌ Error obteniendo token:', error.response?.data || error.message);
    return null;
  }
}

// Función para crear cliente
async function crearCliente(token) {
  try {
    console.log('🔍 Intentando crear cliente...');
    console.log('🔍 Datos del cliente:', JSON.stringify(TEST_CLIENTE, null, 2));
    
    const config = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=300'
      },
      timeout: 30000
    };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔍 Token de autorización incluido');
    } else {
      console.log('⚠️ Sin token de autorización');
    }
    
    console.log('🔍 URL de la petición:', `${API_BASE_URL}/api/ventas/clientes/`);
    console.log('🔍 Configuración:', JSON.stringify(config, null, 2));
    
    const response = await axios.post(`${API_BASE_URL}/api/ventas/clientes/`, TEST_CLIENTE, config);
    
    console.log('✅ Cliente creado exitosamente');
    console.log('✅ Status:', response.status);
    console.log('✅ Data:', JSON.stringify(response.data, null, 2));
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Error creando cliente:');
    console.error('❌ Error completo:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error response status:', error.response?.status);
    console.error('❌ Error response data:', error.response?.data);
    console.error('❌ Error response headers:', error.response?.headers);
    
    return { 
      success: false, 
      error: error.response?.data?.error || error.response?.data?.message || error.message || 'Error al crear cliente' 
    };
  }
}

// Función para obtener clientes existentes
async function obtenerClientes(token) {
  try {
    console.log('🔍 Obteniendo clientes existentes...');
    
    const config = {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'max-age=300'
      },
      timeout: 30000
    };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await axios.get(`${API_BASE_URL}/api/ventas/clientes/`, config);
    
    console.log('✅ Clientes obtenidos exitosamente');
    console.log('✅ Cantidad de clientes:', response.data.length);
    console.log('✅ Primeros 3 clientes:', JSON.stringify(response.data.slice(0, 3), null, 2));
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Error obteniendo clientes:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.error || error.response?.data?.message || 'Error al obtener clientes' 
    };
  }
}

// Función para verificar la conectividad del servidor
async function verificarServidor() {
  try {
    console.log('🔍 Verificando conectividad del servidor...');
    
    const response = await axios.get(`${API_BASE_URL}/api/`, {
      timeout: 5000
    });
    
    console.log('✅ Servidor respondiendo correctamente');
    console.log('✅ Status:', response.status);
    console.log('✅ Data:', response.data);
    
    return true;
  } catch (error) {
    console.error('❌ Error conectando al servidor:', error.message);
    return false;
  }
}

// Función principal de prueba
async function ejecutarPruebas() {
  console.log('🚀 Iniciando pruebas de creación de clientes...');
  console.log('🔍 API_BASE_URL:', API_BASE_URL);
  
  // 1. Verificar conectividad del servidor
  console.log('\n=== PASO 1: Verificar conectividad del servidor ===');
  const servidorOk = await verificarServidor();
  if (!servidorOk) {
    console.error('❌ No se puede conectar al servidor. Verificar que esté ejecutándose.');
    return;
  }
  
  // 2. Obtener token de autenticación
  console.log('\n=== PASO 2: Obtener token de autenticación ===');
  const token = await getAuthToken();
  
  // 3. Obtener clientes existentes
  console.log('\n=== PASO 3: Obtener clientes existentes ===');
  const clientesResult = await obtenerClientes(token);
  
  // 4. Intentar crear cliente
  console.log('\n=== PASO 4: Intentar crear cliente ===');
  const crearResult = await crearCliente(token);
  
  // 5. Resumen de resultados
  console.log('\n=== RESUMEN DE PRUEBAS ===');
  console.log('✅ Servidor:', servidorOk ? 'Conectado' : 'No conectado');
  console.log('✅ Token:', token ? 'Obtenido' : 'No obtenido');
  console.log('✅ Obtener clientes:', clientesResult.success ? 'Exitoso' : 'Falló');
  console.log('✅ Crear cliente:', crearResult.success ? 'Exitoso' : 'Falló');
  
  if (!crearResult.success) {
    console.log('\n❌ ERROR DETECTADO:');
    console.log('❌ Mensaje de error:', crearResult.error);
    console.log('\n🔧 POSIBLES SOLUCIONES:');
    console.log('1. Verificar que el backend esté ejecutándose en el puerto correcto');
    console.log('2. Verificar las credenciales de autenticación');
    console.log('3. Verificar que el usuario tenga permisos para crear clientes');
    console.log('4. Verificar la configuración de CORS en el backend');
    console.log('5. Verificar que las migraciones de la base de datos estén aplicadas');
  } else {
    console.log('\n✅ Todas las pruebas pasaron exitosamente');
  }
}

// Ejecutar pruebas si el script se ejecuta directamente
if (require.main === module) {
  ejecutarPruebas().catch(error => {
    console.error('❌ Error ejecutando pruebas:', error);
  });
}

module.exports = {
  ejecutarPruebas,
  crearCliente,
  obtenerClientes,
  verificarServidor
};