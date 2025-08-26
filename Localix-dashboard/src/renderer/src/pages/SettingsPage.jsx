import React, { useState } from 'react';
import { 
  Settings, 
  Palette, 
  Bell, 
  Zap, 
  Minimize2, 
  RotateCcw,
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
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import ImageUpload from '../components/ui/ImageUpload';
import CompanySettings from '../components/settings/CompanySettings';

const SettingsPage = () => {
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen bg-theme-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-theme-accent rounded-xl shadow-lg">
              <Settings size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-theme-text">Configuración</h1>
              <p className="text-theme-textSecondary">Personaliza tu experiencia en Localix</p>
            </div>
          </div>
        </div>

        <div className="bg-theme-surface border border-theme-border rounded-xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-theme-border bg-theme-secondary overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-8 py-6 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-theme-accent border-b-2 border-theme-accent bg-theme-surface'
                      : 'text-theme-textSecondary hover:text-theme-text hover:bg-theme-border'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-8">
            {activeTab === 'themes' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-theme-text mb-2">Temas Disponibles</h2>
                  <p className="text-theme-textSecondary mb-6">Elige el tema que mejor se adapte a tu estilo de trabajo</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(themes).map(([key, theme]) => {
                      const Icon = themeIcons[key] || Sun;
                      const isActive = settings.theme === key;
                      
                      return (
                        <button
                          key={key}
                          onClick={() => updateTheme(key)}
                          className={`relative p-6 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] ${
                            isActive
                              ? 'border-theme-accent bg-theme-accent/10 shadow-lg'
                              : 'border-theme-border bg-theme-secondary hover:border-theme-accent hover:bg-theme-accent/5'
                          }`}
                        >
                          {isActive && (
                            <div className="absolute top-3 right-3 p-1.5 bg-theme-accent rounded-full shadow-lg">
                              <Check size={14} className="text-white" />
                            </div>
                          )}
                          
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-4 rounded-xl shadow-md" style={{ backgroundColor: theme.colors.primary }}>
                              <Icon size={24} className="text-white" />
                            </div>
                            <div className="text-center">
                              <h3 className="font-semibold text-theme-text text-lg">{theme.name}</h3>
                              {isActive && (
                                <p className="text-sm text-theme-accent font-medium mt-1">Tema activo</p>
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
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-theme-text mb-2">Configuración de Marca</h2>
                  <p className="text-theme-textSecondary mb-6">Personaliza la apariencia de tu marca en el sistema</p>
                  
                  {/* Logo */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-theme-secondary rounded-xl border border-theme-border">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-theme-accent rounded-xl">
                          <Image size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-theme-text text-lg">Logo de la empresa</h3>
                          <p className="text-theme-textSecondary">Personaliza el logo que aparece en el sidebar</p>
                        </div>
                      </div>
                      <button
                        onClick={toggleLogoVisibility}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                          settings.customBrand?.showLogo ? 'bg-theme-accent' : 'bg-theme-border'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            settings.customBrand?.showLogo ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {settings.customBrand?.showLogo && (
                      <div className="p-6 bg-theme-secondary rounded-xl border border-theme-border">
                        <ImageUpload
                          currentImage={settings.customBrand?.logo}
                          onImageChange={updateLogo}
                          onImageRemove={() => updateLogo(null)}
                          placeholder="Subir logo de la empresa"
                          maxSize={2 * 1024 * 1024}
                        />
                      </div>
                    )}
                  </div>

                  {/* Nombre de la empresa */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-theme-secondary rounded-xl border border-theme-border">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-theme-primary rounded-xl">
                          <Type size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-theme-text text-lg">Nombre de la empresa</h3>
                          <p className="text-theme-textSecondary">Personaliza el nombre que aparece en el sidebar</p>
                        </div>
                      </div>
                      <button
                        onClick={toggleCompanyNameVisibility}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                          settings.customBrand?.showCompanyName ? 'bg-theme-accent' : 'bg-theme-border'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            settings.customBrand?.showCompanyName ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {settings.customBrand?.showCompanyName && (
                      <div className="p-6 bg-theme-secondary rounded-xl border border-theme-border">
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-theme-text">
                            Nombre de la empresa
                          </label>
                          <input
                            type="text"
                            value={settings.customBrand?.companyName || ''}
                            onChange={(e) => updateCompanyName(e.target.value)}
                            placeholder="Ingresa el nombre de tu empresa"
                            className="w-full px-4 py-3 bg-theme-surface border border-theme-border rounded-lg text-theme-text placeholder-theme-textSecondary focus:outline-none focus:ring-2 focus:ring-theme-accent focus:border-transparent"
                          />
                          <p className="text-sm text-theme-textSecondary">
                            Este nombre aparecerá en el encabezado del sidebar
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Vista previa */}
                  <div className="p-6 bg-theme-secondary rounded-xl border border-theme-border">
                    <h3 className="font-semibold text-theme-text text-lg mb-4">Vista previa del sidebar</h3>
                    <div className="bg-theme-sidebar rounded-xl p-6 max-w-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex items-center justify-center shadow-xl rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                          {settings.customBrand?.logo && settings.customBrand?.showLogo ? (
                            <img 
                              src={settings.customBrand.logo} 
                              alt="Logo" 
                              className="w-10 h-10 object-cover rounded-lg"
                            />
                          ) : (
                            <Image size={24} className="text-white" />
                          )}
                        </div>
                        {settings.customBrand?.showCompanyName && (
                          <div className="flex flex-col">
                            <h1 className="text-xl font-bold tracking-tight text-white font-serif whitespace-nowrap">
                              {settings.customBrand?.companyName || 'Localix'}
                            </h1>
                            <p className="text-sm text-white/80 font-medium">Administradora</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'company' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-theme-text mb-2">Información de la Empresa</h2>
                  <p className="text-theme-textSecondary mb-6">Configura los datos de tu empresa</p>
                </div>
                <CompanySettings />
              </div>
            )}

            {activeTab === 'interface' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-theme-text mb-2">Configuración de Interfaz</h2>
                  <p className="text-theme-textSecondary mb-6">Personaliza la apariencia y comportamiento de la interfaz</p>
                  
                  <div className="space-y-4">
                    {/* Animations */}
                    <div className="flex items-center justify-between p-6 bg-theme-secondary rounded-xl border border-theme-border hover:bg-theme-border/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-theme-accent rounded-xl">
                          <Zap size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-theme-text text-lg">Animaciones</h3>
                          <p className="text-theme-textSecondary">Habilitar transiciones y efectos visuales</p>
                        </div>
                      </div>
                      <button
                        onClick={toggleAnimations}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                          settings.animations ? 'bg-theme-accent' : 'bg-theme-border'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            settings.animations ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Compact Mode */}
                    <div className="flex items-center justify-between p-6 bg-theme-secondary rounded-xl border border-theme-border hover:bg-theme-border/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-theme-success rounded-xl">
                          <Minimize2 size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-theme-text text-lg">Modo Compacto</h3>
                          <p className="text-theme-textSecondary">Reducir espaciado y tamaños para mayor densidad</p>
                        </div>
                      </div>
                      <button
                        onClick={toggleCompactMode}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                          settings.compactMode ? 'bg-theme-accent' : 'bg-theme-border'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            settings.compactMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-theme-text mb-2">Configuración de Notificaciones</h2>
                  <p className="text-theme-textSecondary mb-6">Controla cómo y cuándo recibir notificaciones</p>
                  
                  {/* Notifications Toggle */}
                  <div className="flex items-center justify-between p-6 bg-theme-secondary rounded-xl border border-theme-border hover:bg-theme-border/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-theme-warning rounded-xl">
                        <Bell size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-theme-text text-lg">Notificaciones</h3>
                        <p className="text-theme-textSecondary">Mostrar alertas y notificaciones del sistema</p>
                      </div>
                    </div>
                    <button
                      onClick={toggleNotifications}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        settings.notifications ? 'bg-theme-accent' : 'bg-theme-border'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
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
          <div className="flex items-center justify-between p-8 border-t border-theme-border bg-theme-secondary">
            <button
              onClick={resetSettings}
              className="flex items-center gap-2 px-6 py-3 text-sm text-theme-textSecondary hover:text-theme-text transition-all duration-200 hover:scale-105 rounded-lg hover:bg-theme-border"
            >
              <RotateCcw size={16} />
              Restablecer configuración
            </button>
            
            <button
              className="px-6 py-3 text-sm bg-theme-accent text-white rounded-lg hover:bg-theme-primary transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;