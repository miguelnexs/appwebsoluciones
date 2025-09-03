import ventasAPI from './ventasAPI';
import clientesAPI from './clientesAPI';
import pedidosAPI from './pedidosAPI';
import electronAPI from './electronAPI';

// Función para inicializar todas las APIs globales
export const initializeAPIs = () => {
  try {
    // Configurar las APIs globales en window de forma segura
    const apis = {
      ventasAPI,
      clientesAPI,
      pedidosAPI,
      electronAPI
    };

    // Asignar cada API de forma segura
    Object.keys(apis).forEach(apiName => {
      try {
        // Verificar si la propiedad ya existe y es configurable
        const descriptor = Object.getOwnPropertyDescriptor(window, apiName);
        
        if (!descriptor || descriptor.configurable !== false) {
          // Si no existe o es configurable, asignar normalmente
          window[apiName] = apis[apiName];
        } else {
          // Si existe y no es configurable, usar defineProperty
          Object.defineProperty(window, apiName, {
            value: apis[apiName],
            writable: true,
            configurable: true
          });
        }
      } catch (error) {
        console.warn(`⚠️ No se pudo asignar ${apiName}:`, error.message);
        // Intentar asignación directa como fallback
        try {
          window[apiName] = apis[apiName];
        } catch (fallbackError) {
          console.error(`❌ Error crítico asignando ${apiName}:`, fallbackError.message);
        }
      }
    });

    // Agregar un indicador de que las APIs están inicializadas
    try {
      window.apisInitialized = true;
    } catch (error) {
      console.warn('⚠️ No se pudo establecer apisInitialized:', error.message);
    }

    console.log('✅ APIs inicializadas correctamente:', {
      ventasAPI: !!window.ventasAPI,
      clientesAPI: !!window.clientesAPI,
      pedidosAPI: !!window.pedidosAPI,
      electronAPI: !!window.electronAPI
    });
  } catch (error) {
    console.error('❌ Error inicializando APIs:', error);
    throw error;
  }
};

// Función para verificar si las APIs están disponibles
export const checkAPIsAvailability = () => {
  const apis = {
    ventasAPI: !!window.ventasAPI,
    pedidosAPI: !!window.pedidosAPI,
    electronAPI: !!window.electronAPI,
    clientesAPI: !!window.clientesAPI
  };

  const allAvailable = Object.values(apis).every(available => available);

  return {
    ...apis,
    allAvailable
  };
};

// Función para obtener el estado de las APIs
export const getAPIStatus = () => {
  return {
    initialized: !!window.apisInitialized,
    ...checkAPIsAvailability()
  };
};

// Exportar las APIs para uso directo si es necesario
export {
  ventasAPI,
  clientesAPI,
  pedidosAPI,
  electronAPI
};