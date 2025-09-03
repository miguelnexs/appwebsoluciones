/**
 * Utilidades para manejar la configuración de datos de la empresa
 */

// Función para obtener los datos de la empresa desde localStorage
export const getCompanyData = () => {
  try {
    const savedSettings = localStorage.getItem('localix-settings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      return parsedSettings.companyData || getDefaultCompanyData();
    }
  } catch (error) {
    console.warn('Error al cargar datos de la empresa:', error);
  }
  
  return getDefaultCompanyData();
};

// Función para obtener datos por defecto de la empresa
export const getDefaultCompanyData = () => {
  return {
    nombre: 'Localix',
    direccion: 'Calle 15 # 7-57 Local 101',
    telefono: '(+57) 314 743 5305',
    email: 'info@localix.com',
    nit: '900.123.456-7',
    ruc: '900.123.456-7',
    web: 'www.localix.com',
    ciudad: 'Pereira',
    pais: 'Colombia'
  };
};

// Función para actualizar los datos de la empresa
export const updateCompanyData = (newData) => {
  try {
    const savedSettings = localStorage.getItem('localix-settings');
    let settings = {};
    
    if (savedSettings) {
      settings = JSON.parse(savedSettings);
    }
    
    settings.companyData = {
      ...getDefaultCompanyData(),
      ...settings.companyData,
      ...newData
    };
    
    localStorage.setItem('localix-settings', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error al actualizar datos de la empresa:', error);
    return false;
  }
};

// Función para obtener un campo específico de la empresa
export const getCompanyField = (field) => {
  const companyData = getCompanyData();
  return companyData[field] || '';
};

// Función para formatear la dirección completa
export const getFormattedAddress = () => {
  const companyData = getCompanyData();
  const parts = [
    companyData.direccion,
    companyData.ciudad,
    companyData.pais
  ].filter(Boolean);
  
  return parts.join(', ');
};

// Función para obtener información de contacto formateada
export const getFormattedContact = () => {
  const companyData = getCompanyData();
  const parts = [
    companyData.telefono,
    companyData.nit
  ].filter(Boolean);
  
  return parts.join(' | ');
};

// Función para validar datos de la empresa
export const validateCompanyData = (data) => {
  const errors = [];
  
  if (!data.nombre || data.nombre.trim().length === 0) {
    errors.push('El nombre de la empresa es requerido');
  }
  
  if (!data.direccion || data.direccion.trim().length === 0) {
    errors.push('La dirección es requerida');
  }
  
  if (!data.telefono || data.telefono.trim().length === 0) {
    errors.push('El teléfono es requerido');
  }
  
  if (!data.nit || data.nit.trim().length === 0) {
    errors.push('El NIT es requerido');
  }
  
  if (data.email && !isValidEmail(data.email)) {
    errors.push('El email no tiene un formato válido');
  }
  
  if (data.web && !isValidUrl(data.web)) {
    errors.push('El sitio web no tiene un formato válido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Función auxiliar para validar email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Función auxiliar para validar URL
const isValidUrl = (url) => {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
};

// Función para exportar datos de la empresa como JSON
export const exportCompanyData = () => {
  const companyData = getCompanyData();
  const dataStr = JSON.stringify(companyData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = 'datos_empresa.json';
  link.click();
  
  URL.revokeObjectURL(link.href);
};

// Función para importar datos de la empresa desde JSON
export const importCompanyData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const validation = validateCompanyData(data);
        
        if (validation.isValid) {
          updateCompanyData(data);
          resolve(data);
        } else {
          reject(new Error(`Datos inválidos: ${validation.errors.join(', ')}`));
        }
      } catch (error) {
        reject(new Error('Error al parsear el archivo JSON'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
    
    reader.readAsText(file);
  });
};

export default {
  getCompanyData,
  getDefaultCompanyData,
  updateCompanyData,
  getCompanyField,
  getFormattedAddress,
  getFormattedContact,
  validateCompanyData,
  exportCompanyData,
  importCompanyData
}; 
