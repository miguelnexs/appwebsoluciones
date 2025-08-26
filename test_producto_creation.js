const axios = require('axios');
const FormData = require('form-data');

// Configuración de la API
const API_BASE_URL = 'http://localhost:8000';

// Función para probar la creación de productos
async function testProductCreation() {
  try {
    console.log('🧪 === INICIANDO PRUEBA DE CREACIÓN DE PRODUCTO ===');
    
    // Primero, intentar hacer login para obtener un token
    console.log('🔐 Intentando hacer login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/usuarios/login/`, {
      username: 'admin', // Cambiar por credenciales válidas
      password: 'admin123' // Cambiar por credenciales válidas
    });
    
    console.log('✅ Login exitoso');
    const accessToken = loginResponse.data.access;
    console.log('🎫 Token obtenido:', accessToken ? 'SÍ' : 'NO');
    
    // Crear datos de prueba para el producto
    const productData = {
      nombre: 'Producto de Prueba',
      sku: 'TEST-' + Date.now(),
      tipo: 'fisico',
      estado: 'publicado',
      descripcion_corta: 'Descripción breve del producto de prueba',
      descripcion_larga: 'Descripción larga del producto de prueba',
      precio: '100.00',
      costo: '50.00',
      gestion_stock: 'false',
      stock: '10'
    };
    
    console.log('📦 Datos del producto:', productData);
    
    // Crear FormData
    const formData = new FormData();
    Object.entries(productData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    // Configuración de la petición
    const config = {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        ...formData.getHeaders()
      }
    };
    
    console.log('🚀 Enviando petición de creación...');
    const response = await axios.post(
      `${API_BASE_URL}/api/productos/productos/`,
      formData,
      config
    );
    
    console.log('✅ Producto creado exitosamente!');
    console.log('📋 Respuesta:', response.data);
    
  } catch (error) {
    console.error('❌ Error en la prueba:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    
    if (error.response?.status === 401) {
      console.error('🔒 Error de autenticación - verificar credenciales');
    } else if (error.response?.status === 400) {
      console.error('📝 Error de validación - verificar datos del producto');
    }
  }
}

// Ejecutar la prueba
testProductCreation();