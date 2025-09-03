import React, { useState } from 'react';
import { 
  Settings, 
  Palette, 
  Bell, 
  Zap, 
  Minimize2, 
  RotateCcw,
  X,
  Check,
  Moon,
  Sun,
  Droplets,
  Leaf,
  Sparkles,
  Image,
  Type,
  Eye,
  EyeOff,
  Building2,
  FileText
} from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import ImageUpload from '../ui/ImageUpload';
import CompanySettings from '../settings/CompanySettings';

const SettingsPanel = ({ isOpen, onClose }) => {
  const { 
    settings, 
    themes, 
    currentTheme, 
    updateTheme, 
    toggleNotifications, 
    toggleAnimations, 
    toggleCompactMode,
    updateLogo,
    updateCompanyName,
    toggleLogoVisibility,
    toggleCompanyNameVisibility,
    updateCompanyField,
    resetSettings 
  } = useSettings();

  const [activeTab, setActiveTab] = useState('themes');

  const tabs = [
    { id: 'themes', label: 'Temas', icon: Palette },
    { id: 'brand', label: 'Marca', icon: Image },
    { id: 'company', label: 'Empresa', icon: Building2 },
    { id: 'interface', label: 'Interfaz', icon: Settings },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
  ];

  const themeIcons = {
    dark: Moon,
    blue: Droplets,
    light: Sun
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-theme-surface border border-theme-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-border bg-theme-secondary">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-theme-accent rounded-lg">
              <Settings size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-theme-text">Configuración</h2>
              <p className="text-sm text-theme-textSecondary">Personaliza tu experiencia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-theme-border rounded-lg transition-all duration-200 text-theme-textSecondary hover:text-theme-text hover:scale-105"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-theme-border bg-theme-secondary">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-theme-accent border-b-2 border-theme-accent bg-theme-surface'
                    : 'text-theme-textSecondary hover:text-theme-text hover:bg-theme-border'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'themes' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-theme-text mb-4">Temas Disponibles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(themes).map(([key, theme]) => {
                    const Icon = themeIcons[key] || Sun; // Fallback a Sun si no hay icono
                    const isActive = settings.theme === key;
                    
                    return (
                      <button
                        key={key}
                        onClick={() => updateTheme(key)}
                        className={`relative p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
                          isActive
                            ? 'border-theme-accent bg-theme-accent/10 shadow-lg'
                            : 'border-theme-border bg-theme-secondary hover:border-theme-accent hover:bg-theme-accent/5'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute top-2 right-2 p-1 bg-theme-accent rounded-full shadow-lg">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg shadow-md" style={{ backgroundColor: theme.colors.primary }}>
                            <Icon size={20} className="text-white" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-medium text-theme-text">{theme.name}</h4>
                            {isActive && (
                              <p className="text-sm text-theme-accent font-medium">Tema activo</p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'brand' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-theme-text mb-4">Configuración de Marca</h3>
                
                {/* Logo */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-theme-secondary rounded-lg border border-theme-border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-theme-accent rounded-lg">
                        <Image size={16} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-theme-text">Logo de la empresa</h4>
                        <p className="text-sm text-theme-textSecondary">Personaliza el logo que aparece en el sidebar</p>
                      </div>
                    </div>
                    <button
                      onClick={toggleLogoVisibility}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.customBrand?.showLogo ? 'bg-theme-accent' : 'bg-theme-border'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.customBrand?.showLogo ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {settings.customBrand?.showLogo && (
                    <div className="p-4 bg-theme-secondary rounded-lg border border-theme-border">
                      <ImageUpload
                        currentImage={settings.customBrand?.logo}
                        onImageChange={updateLogo}
                        onImageRemove={() => updateLogo(null)}
                        placeholder="Subir logo de la empresa"
                        maxSize={2 * 1024 * 1024} // 2MB para logos
                      />
                    </div>
                  )}
                </div>

                {/* Nombre de la empresa */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-theme-secondary rounded-lg border border-theme-border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-theme-primary rounded-lg">
                        <Type size={16} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-theme-text">Nombre de la empresa</h4>
                        <p className="text-sm text-theme-textSecondary">Personaliza el nombre que aparece en el sidebar</p>
                      </div>
                    </div>
                    <button
                      onClick={toggleCompanyNameVisibility}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.customBrand?.showCompanyName ? 'bg-theme-accent' : 'bg-theme-border'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.customBrand?.showCompanyName ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {settings.customBrand?.showCompanyName && (
                    <div className="p-4 bg-theme-secondary rounded-lg border border-theme-border">
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-theme-text">
                          Nombre de la empresa
                        </label>
                        <input
                          type="text"
                          value={settings.customBrand?.companyName || ''}
                          onChange={(e) => updateCompanyName(e.target.value)}
                          placeholder="Ingresa el nombre de tu empresa"
                          className="w-full px-3 py-2 bg-theme-surface border border-theme-border rounded-lg text-theme-text placeholder-theme-textSecondary focus:outline-none focus:ring-2 focus:ring-theme-accent focus:border-transparent"
                        />
                        <p className="text-xs text-theme-textSecondary">
                          Este nombre aparecerá en el encabezado del sidebar
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Vista previa */}
                <div className="p-4 bg-theme-secondary rounded-lg border border-theme-border">
                  <h4 className="font-medium text-theme-text mb-3">Vista previa del sidebar</h4>
                  <div className="bg-theme-sidebar rounded-lg p-4 max-w-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center shadow-xl rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                        {settings.customBrand?.logo && settings.customBrand?.showLogo ? (
                          <img 
                            src={settings.customBrand.logo} 
                            alt="Logo" 
                            className="w-8 h-8 object-cover rounded-lg"
                          />
                        ) : (
                          <Image size={20} className="text-white" />
                        )}
                      </div>
                      {settings.customBrand?.showCompanyName && (
                        <div className="flex flex-col">
                          <h1 className="text-lg font-bold tracking-tight text-white font-serif whitespace-nowrap">
                            {settings.customBrand?.companyName || 'Localix'}
                          </h1>
                          <p className="text-xs text-white/80 font-medium">Administradora</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'company' && (
            <CompanySettings />
          )}

          {activeTab === 'interface' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-theme-text mb-4">Configuración de Interfaz</h3>
                
                {/* Animations */}
                <div className="flex items-center justify-between p-4 bg-theme-secondary rounded-lg border border-theme-border hover:bg-theme-border/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-theme-accent rounded-lg">
                      <Zap size={16} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-theme-text">Animaciones</h4>
                      <p className="text-sm text-theme-textSecondary">Habilitar transiciones y efectos</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleAnimations}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.animations ? 'bg-theme-accent' : 'bg-theme-border'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.animations ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Compact Mode */}
                <div className="flex items-center justify-between p-4 bg-theme-secondary rounded-lg border border-theme-border hover:bg-theme-border/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-theme-success rounded-lg">
                      <Minimize2 size={16} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-theme-text">Modo Compacto</h4>
                      <p className="text-sm text-theme-textSecondary">Reducir espaciado y tamaños</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleCompactMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.compactMode ? 'bg-theme-accent' : 'bg-theme-border'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.compactMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-theme-text mb-4">Configuración de Notificaciones</h3>
                
                {/* Notifications Toggle */}
                <div className="flex items-center justify-between p-4 bg-theme-secondary rounded-lg border border-theme-border hover:bg-theme-border/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-theme-warning rounded-lg">
                      <Bell size={16} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-theme-text">Notificaciones</h4>
                      <p className="text-sm text-theme-textSecondary">Mostrar alertas y notificaciones</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleNotifications}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications ? 'bg-theme-accent' : 'bg-theme-border'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-theme-border bg-theme-secondary">
          <button
            onClick={resetSettings}
            className="flex items-center gap-2 px-4 py-2 text-sm text-theme-textSecondary hover:text-theme-text transition-all duration-200 hover:scale-105"
          >
            <RotateCcw size={16} />
            Restablecer configuración
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-theme-textSecondary hover:text-theme-text transition-all duration-200 hover:scale-105"
            >
              Cancelar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-theme-accent text-white rounded-lg hover:bg-theme-primary transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
