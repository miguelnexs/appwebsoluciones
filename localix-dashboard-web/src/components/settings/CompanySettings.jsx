import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  FileText, 
  Save, 
  RotateCcw,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Palette
} from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { 
  getCompanyData, 
  updateCompanyData, 
  validateCompanyData,
  exportCompanyData,
  importCompanyData 
} from '../../utils/companyConfig';

const CompanySettings = () => {
  const { settings, updateCompanyData: updateSettingsCompanyData, updatePdfColor } = useSettings();
  const [formData, setFormData] = useState(getCompanyData());
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [validationErrors, setValidationErrors] = useState({});
  const [pdfColors, setPdfColors] = useState(settings.pdfColors || {
    primary: '#e91e63',
    secondary: '#f8bbd9', 
    accent: '#2196f3',
    neutral: '#6b7280'
  });
  const [themeMessage, setThemeMessage] = useState('');

  // Temas prediseñados para colores PDF
  const pdfThemes = {
    rosa: {
      name: 'Rosa Elegante',
      colors: {
        primary: '#e91e63',
        secondary: '#f8bbd9',
        accent: '#2196f3',
        neutral: '#6b7280'
      }
    },
    azul: {
      name: 'Azul Profesional',
      colors: {
        primary: '#1976d2',
        secondary: '#bbdefb',
        accent: '#0d47a1',
        neutral: '#546e7a'
      }
    },
    verde: {
      name: 'Verde Natural',
      colors: {
        primary: '#388e3c',
        secondary: '#c8e6c9',
        accent: '#1b5e20',
        neutral: '#5d4037'
      }
    },
    rojo: {
      name: 'Rojo Moderno',
      colors: {
        primary: '#d32f2f',
        secondary: '#ffcdd2',
        accent: '#b71c1c',
        neutral: '#616161'
      }
    },
    morado: {
      name: 'Morado Sofisticado',
      colors: {
        primary: '#7b1fa2',
        secondary: '#e1bee7',
        accent: '#4a148c',
        neutral: '#5e35b1'
      }
    },
    naranja: {
      name: 'Naranja Vibrante',
      colors: {
        primary: '#f57c00',
        secondary: '#ffe0b2',
        accent: '#e65100',
        neutral: '#6d4c41'
      }
    },
    turquesa: {
      name: 'Turquesa Fresco',
      colors: {
        primary: '#00acc1',
        secondary: '#b2ebf2',
        accent: '#006064',
        neutral: '#455a64'
      }
    },
    gris: {
      name: 'Gris Corporativo',
      colors: {
        primary: '#424242',
        secondary: '#e0e0e0',
        accent: '#212121',
        neutral: '#757575'
      }
    }
  };

  // Actualizar formData cuando cambien los settings
  useEffect(() => {
    setFormData(getCompanyData());
  }, [settings.companyData]);

  // Actualizar colores PDF cuando cambien los settings
  useEffect(() => {
    if (settings.pdfColors) {
      setPdfColors(settings.pdfColors);
    }
  }, [settings.pdfColors]);

  const handleColorChange = (colorType, value) => {
    setPdfColors(prev => ({
      ...prev,
      [colorType]: value
    }));
    updatePdfColor(colorType, value);
  };

  // Función para aplicar un tema prediseñado
  const applyTheme = (themeKey) => {
    const theme = pdfThemes[themeKey];
    if (theme) {
      setPdfColors(theme.colors);
      // Actualizar cada color individualmente
      Object.entries(theme.colors).forEach(([colorType, value]) => {
        updatePdfColor(colorType, value);
      });
      setMessage({ type: 'success', text: `Tema "${theme.name}" aplicado correctamente` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error de validación para este campo
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validar datos
      const validation = validateCompanyData(formData);
      if (!validation.isValid) {
        const errors = {};
        validation.errors.forEach(error => {
          // Mapear mensajes de error a campos específicos
          if (error.includes('nombre')) errors.nombre = error;
          if (error.includes('dirección')) errors.direccion = error;
          if (error.includes('teléfono')) errors.telefono = error;
          if (error.includes('NIT')) errors.nit = error;
          if (error.includes('email')) errors.email = error;
          if (error.includes('sitio web')) errors.web = error;
        });
        setValidationErrors(errors);
        setMessage({ type: 'error', text: 'Por favor corrige los errores antes de guardar' });
        return;
      }

      // Guardar datos
      const success = updateCompanyData(formData);
      if (success) {
        updateSettingsCompanyData(formData);
        setMessage({ type: 'success', text: 'Datos de empresa guardados exitosamente' });
        setValidationErrors({});
      } else {
        setMessage({ type: 'error', text: 'Error al guardar los datos' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error inesperado al guardar' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    const defaultData = getCompanyData();
    setFormData(defaultData);
    setValidationErrors({});
    setMessage({ type: 'info', text: 'Datos restablecidos a valores predeterminados' });
  };

  const handleExport = () => {
    try {
      exportCompanyData();
      setMessage({ type: 'success', text: 'Datos exportados exitosamente' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al exportar datos' });
    }
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    importCompanyData(file)
      .then((data) => {
        setFormData(data);
        updateSettingsCompanyData(data);
        setMessage({ type: 'success', text: 'Datos importados exitosamente' });
        setValidationErrors({});
      })
      .catch((error) => {
        setMessage({ type: 'error', text: `Error al importar: ${error.message}` });
      })
      .finally(() => {
        setIsLoading(false);
        event.target.value = ''; // Limpiar input
      });
  };

  const getFieldError = (field) => {
    return validationErrors[field] || null;
  };

  const inputClassName = (field) => {
    const baseClasses = "w-full px-3 py-2 bg-theme-surface border rounded-lg text-theme-text placeholder-theme-textSecondary focus:outline-none focus:ring-2 focus:ring-theme-accent focus:border-transparent transition-all duration-200";
    const errorClasses = "border-red-300 focus:ring-red-500/20 focus:border-red-500";
    const normalClasses = "border-theme-border";
    
    return `${baseClasses} ${getFieldError(field) ? errorClasses : normalClasses}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-theme-text">Configuración de Empresa</h3>
          <p className="text-sm text-theme-textSecondary mt-1">
            Personaliza los datos de tu empresa que aparecerán en documentos y facturas
          </p>
        </div>
        
        {/* Botones de acción */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="px-3 py-2 text-sm font-medium text-theme-textSecondary bg-theme-secondary border border-theme-border rounded-lg hover:bg-theme-secondary/80 transition-colors duration-200 disabled:opacity-50"
          >
            <RotateCcw size={16} className="mr-2" />
            Restablecer
          </button>
          
          <label className="px-3 py-2 text-sm font-medium text-theme-textSecondary bg-theme-secondary border border-theme-border rounded-lg hover:bg-theme-secondary/80 transition-colors duration-200 cursor-pointer">
            <Upload size={16} className="mr-2" />
            Importar
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          
          <button
            onClick={handleExport}
            disabled={isLoading}
            className="px-3 py-2 text-sm font-medium text-theme-textSecondary bg-theme-secondary border border-theme-border rounded-lg hover:bg-theme-secondary/80 transition-colors duration-200 disabled:opacity-50"
          >
            <Download size={16} className="mr-2" />
            Exportar
          </button>
          
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-theme-accent rounded-lg hover:bg-theme-accent/90 transition-colors duration-200 disabled:opacity-50 flex items-center"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            Guardar
          </button>
        </div>
      </div>

      {/* Mensaje de estado */}
      {message.text && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : message.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle size={20} className="mr-2" />
            ) : message.type === 'error' ? (
              <AlertCircle size={20} className="mr-2" />
            ) : (
              <AlertCircle size={20} className="mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Información Básica */}
      <div className="bg-theme-secondary rounded-lg border border-theme-border p-6">
        <h4 className="text-lg font-semibold text-theme-text mb-4 flex items-center gap-2">
          <Building2 size={20} />
          Información Básica
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-theme-text">
              Nombre de la empresa *
            </label>
            <input
              type="text"
              value={formData.nombre || ''}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              placeholder="Ej: Localix"
              className={inputClassName('nombre')}
            />
            {getFieldError('nombre') && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {getFieldError('nombre')}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-theme-text">
              NIT *
            </label>
            <input
              type="text"
              value={formData.nit || ''}
              onChange={(e) => handleInputChange('nit', e.target.value)}
              placeholder="Ej: 900.123.456-7"
              className={inputClassName('nit')}
            />
            {getFieldError('nit') && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {getFieldError('nit')}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-theme-text">
              RUC
            </label>
            <input
              type="text"
              value={formData.ruc || ''}
              onChange={(e) => handleInputChange('ruc', e.target.value)}
              placeholder="Ej: 900.123.456-7"
              className={inputClassName('ruc')}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-theme-text">
              Ciudad
            </label>
            <input
              type="text"
              value={formData.ciudad || ''}
              onChange={(e) => handleInputChange('ciudad', e.target.value)}
              placeholder="Ej: Pereira"
              className={inputClassName('ciudad')}
            />
          </div>
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="bg-theme-secondary rounded-lg border border-theme-border p-6">
        <h4 className="text-lg font-semibold text-theme-text mb-4 flex items-center gap-2">
          <Phone size={20} />
          Información de Contacto
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-theme-text">
              Teléfono *
            </label>
            <input
              type="tel"
              value={formData.telefono || ''}
              onChange={(e) => handleInputChange('telefono', e.target.value)}
              placeholder="Ej: (+57) 314 743 5305"
              className={inputClassName('telefono')}
            />
            {getFieldError('telefono') && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {getFieldError('telefono')}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-theme-text">
              Email
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Ej: info@localix.com"
              className={inputClassName('email')}
            />
            {getFieldError('email') && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {getFieldError('email')}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-theme-text">
              Sitio Web
            </label>
            <input
              type="url"
              value={formData.web || ''}
              onChange={(e) => handleInputChange('web', e.target.value)}
              placeholder="Ej: www.localix.com"
              className={inputClassName('web')}
            />
            {getFieldError('web') && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {getFieldError('web')}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-theme-text">
              País
            </label>
            <input
              type="text"
              value={formData.pais || ''}
              onChange={(e) => handleInputChange('pais', e.target.value)}
              placeholder="Ej: Colombia"
              className={inputClassName('pais')}
            />
          </div>
        </div>
      </div>

      {/* Dirección */}
      <div className="bg-theme-secondary rounded-lg border border-theme-border p-6">
        <h4 className="text-lg font-semibold text-theme-text mb-4 flex items-center gap-2">
          <MapPin size={20} />
          Dirección
        </h4>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-theme-text">
              Dirección completa *
            </label>
            <input
              type="text"
              value={formData.direccion || ''}
              onChange={(e) => handleInputChange('direccion', e.target.value)}
              placeholder="Ej: Calle 15 # 7-57 Local 101"
              className={inputClassName('direccion')}
            />
            {getFieldError('direccion') && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {getFieldError('direccion')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Colores para PDF */}
      <div className="bg-theme-secondary rounded-lg border border-theme-border p-6">
        <h4 className="text-lg font-semibold text-theme-text mb-4 flex items-center gap-2">
          <Palette size={20} />
          Colores para PDF
        </h4>
        
        {/* Mensaje de éxito */}
        {themeMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-green-800 text-sm">{themeMessage}</span>
          </div>
        )}
        
        {/* Selector de temas prediseñados */}
        <div className="mb-6">
          <h5 className="text-sm font-medium text-theme-text mb-3">Temas Prediseñados</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(pdfThemes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => applyTheme(key)}
                className="p-3 bg-theme-surface border border-theme-border rounded-lg hover:border-theme-accent transition-colors group"
                title={`Aplicar tema ${theme.name}`}
              >
                <div className="flex gap-1 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full border border-gray-300" 
                    style={{ backgroundColor: theme.colors.primary }}
                  ></div>
                  <div 
                    className="w-3 h-3 rounded-full border border-gray-300" 
                    style={{ backgroundColor: theme.colors.secondary }}
                  ></div>
                  <div 
                    className="w-3 h-3 rounded-full border border-gray-300" 
                    style={{ backgroundColor: theme.colors.accent }}
                  ></div>
                  <div 
                    className="w-3 h-3 rounded-full border border-gray-300" 
                    style={{ backgroundColor: theme.colors.neutral }}
                  ></div>
                </div>
                <span className="text-xs text-theme-textSecondary group-hover:text-theme-text transition-colors">
                  {theme.name}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="border-t border-theme-border pt-6">
          <h5 className="text-sm font-medium text-theme-text mb-4">Personalización Manual</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
              <label className="block text-sm font-medium text-theme-text">
                Color Principal
              </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={pdfColors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="w-12 h-10 rounded-lg border border-theme-border cursor-pointer"
              />
              <input
                type="text"
                value={pdfColors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                placeholder="#e91e63"
                className="flex-1 px-3 py-2 bg-theme-surface border border-theme-border rounded-lg text-theme-text placeholder-theme-textSecondary focus:outline-none focus:ring-2 focus:ring-theme-accent focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="space-y-2">
              <label className="block text-sm font-medium text-theme-text">
                Color Secundario
              </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={pdfColors.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="w-12 h-10 rounded-lg border border-theme-border cursor-pointer"
              />
              <input
                type="text"
                value={pdfColors.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                placeholder="#f8bbd9"
                className="flex-1 px-3 py-2 bg-theme-surface border border-theme-border rounded-lg text-theme-text placeholder-theme-textSecondary focus:outline-none focus:ring-2 focus:ring-theme-accent focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="space-y-2">
              <label className="block text-sm font-medium text-theme-text">
                Color de Acento
              </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={pdfColors.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                className="w-12 h-10 rounded-lg border border-theme-border cursor-pointer"
              />
              <input
                type="text"
                value={pdfColors.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                placeholder="#2196f3"
                className="flex-1 px-3 py-2 bg-theme-surface border border-theme-border rounded-lg text-theme-text placeholder-theme-textSecondary focus:outline-none focus:ring-2 focus:ring-theme-accent focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="space-y-2">
              <label className="block text-sm font-medium text-theme-text">
                Color Neutral
              </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={pdfColors.neutral}
                onChange={(e) => handleColorChange('neutral', e.target.value)}
                className="w-12 h-10 rounded-lg border border-theme-border cursor-pointer"
              />
              <input
                type="text"
                value={pdfColors.neutral}
                onChange={(e) => handleColorChange('neutral', e.target.value)}
                placeholder="#6b7280"
                className="flex-1 px-3 py-2 bg-theme-surface border border-theme-border rounded-lg text-theme-text placeholder-theme-textSecondary focus:outline-none focus:ring-2 focus:ring-theme-accent focus:border-transparent"
              />
            </div>
          </div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-theme-surface rounded-lg border border-theme-border">
          <h5 className="text-sm font-medium text-theme-text mb-2">Vista previa de colores</h5>
          <div className="flex gap-3">
            <div 
              className="w-8 h-8 rounded-lg border border-theme-border" 
              style={{ backgroundColor: pdfColors.primary }}
              title="Color Principal"
            ></div>
            <div 
              className="w-8 h-8 rounded-lg border border-theme-border" 
              style={{ backgroundColor: pdfColors.secondary }}
              title="Color Secundario"
            ></div>
            <div 
              className="w-8 h-8 rounded-lg border border-theme-border" 
              style={{ backgroundColor: pdfColors.accent }}
              title="Color de Acento"
            ></div>
            <div 
              className="w-8 h-8 rounded-lg border border-theme-border" 
              style={{ backgroundColor: pdfColors.neutral }}
              title="Color Neutral"
            ></div>
          </div>
        </div>
      </div>

      {/* Vista previa */}
      <div className="bg-theme-secondary rounded-lg border border-theme-border p-6">
        <h4 className="text-lg font-semibold text-theme-text mb-4 flex items-center gap-2">
          <FileText size={20} />
          Vista Previa
        </h4>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{formData.nombre || 'Nombre de la empresa'}</h2>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Dirección:</strong> {formData.direccion || 'Dirección no especificada'}</p>
            <p><strong>Ciudad:</strong> {formData.ciudad || 'Ciudad no especificada'}</p>
            <p><strong>País:</strong> {formData.pais || 'País no especificado'}</p>
            <p><strong>Teléfono:</strong> {formData.telefono || 'Teléfono no especificado'}</p>
            <p><strong>Email:</strong> {formData.email || 'Email no especificado'}</p>
            <p><strong>NIT:</strong> {formData.nit || 'NIT no especificado'}</p>
            {formData.web && <p><strong>Sitio Web:</strong> {formData.web}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySettings;

