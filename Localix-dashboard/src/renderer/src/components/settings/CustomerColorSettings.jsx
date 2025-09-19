import React, { useState } from 'react';
import { Palette, Save } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { toast } from 'react-toastify';

const CustomerColorSettings = () => {
  const { settings, updateCustomerColors, updateCustomerColor } = useSettings();
  const [tempColors, setTempColors] = useState(settings.customerColors);


  const colorLabels = {
    activeBg: 'Fondo Cliente Activo',
    activeText: 'Texto Cliente Activo',
    activeIcon: 'Icono Cliente Activo',
    activeBadgeBg: 'Fondo Badge Activo',
    activeBadgeText: 'Texto Badge Activo',
    inactiveBg: 'Fondo Cliente Inactivo',
    inactiveText: 'Texto Cliente Inactivo',
    inactiveIcon: 'Icono Cliente Inactivo'
  };

  const handleColorChange = (colorType, value) => {
    setTempColors(prev => ({
      ...prev,
      [colorType]: value
    }));
  };

  const handleSave = () => {
    updateCustomerColors(tempColors);
    toast.success('Colores de cliente guardados exitosamente');
  };





  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Palette className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Colores de Cliente</h3>
            <p className="text-sm text-gray-600">Personaliza los colores para la visualización de datos del cliente</p>
          </div>
        </div>

      </div>



      {/* Configuración de Colores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Colores para Clientes Activos */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            Clientes Activos
          </h4>
          <div className="space-y-4">
            {['activeBg', 'activeText', 'activeIcon', 'activeBadgeBg', 'activeBadgeText'].map((colorType) => (
              <div key={colorType} className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  {colorLabels[colorType]}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={tempColors[colorType]}
                    onChange={(e) => handleColorChange(colorType, e.target.value)}
                    className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={tempColors[colorType]}
                    onChange={(e) => handleColorChange(colorType, e.target.value)}
                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#000000"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Colores para Clientes Inactivos */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            Clientes Inactivos
          </h4>
          <div className="space-y-4">
            {['inactiveBg', 'inactiveText', 'inactiveIcon'].map((colorType) => (
              <div key={colorType} className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  {colorLabels[colorType]}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={tempColors[colorType]}
                    onChange={(e) => handleColorChange(colorType, e.target.value)}
                    className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={tempColors[colorType]}
                    onChange={(e) => handleColorChange(colorType, e.target.value)}
                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#000000"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botón de Acción */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

export default CustomerColorSettings;