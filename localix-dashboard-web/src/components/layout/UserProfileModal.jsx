import React from 'react';
import { X, User, Mail, Phone, Calendar, Shield, Settings, LogOut } from 'lucide-react';

const UserProfileModal = ({ isOpen, onClose, user, onLogout }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'from-red-500 to-red-600';
      case 'vendedor':
        return 'from-blue-500 to-blue-600';
      case 'gerente':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return '👑';
      case 'vendedor':
        return '💼';
      case 'gerente':
        return '🎯';
      default:
        return '👤';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-theme-surface border border-theme-border rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative">
          <div className={`h-24 bg-gradient-to-r ${getRoleColor(user?.rol)}`}></div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200 hover:scale-105"
          >
            <X size={20} />
          </button>
        </div>

        {/* Avatar */}
        <div className="relative -mt-12 px-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl mx-auto border-4 border-theme-surface">
            <span className="text-white text-2xl font-bold">
              {user?.nombre_completo?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </span>
          </div>
          
          {/* Indicador de estado online */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="w-6 h-6 bg-green-400 border-4 border-theme-surface rounded-full flex items-center justify-center animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Información del usuario */}
        <div className="px-6 py-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-theme-text mb-1">
              {user?.nombre_completo || user?.username}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">{getRoleIcon(user?.rol)}</span>
              <span className="text-sm font-medium text-theme-textSecondary capitalize">
                {user?.rol || 'Usuario'}
              </span>
            </div>
          </div>

          {/* Detalles del perfil */}
          <div className="space-y-4">
            <div className="bg-theme-secondary rounded-lg p-4 border border-theme-border">
              <h3 className="text-sm font-semibold text-theme-text mb-3 flex items-center gap-2">
                <User size={16} />
                Información Personal
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-theme-textSecondary" />
                  <div>
                    <p className="text-sm font-medium text-theme-text">
                      {user?.email || 'No disponible'}
                    </p>
                    <p className="text-xs text-theme-textSecondary">Correo electrónico</p>
                  </div>
                </div>

                {user?.telefono && (
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-theme-textSecondary" />
                    <div>
                      <p className="text-sm font-medium text-theme-text">
                        {user.telefono}
                      </p>
                      <p className="text-xs text-theme-textSecondary">Teléfono</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-theme-textSecondary" />
                  <div>
                    <p className="text-sm font-medium text-theme-text">
                      {formatDate(user?.fecha_registro || user?.date_joined)}
                    </p>
                    <p className="text-xs text-theme-textSecondary">Miembro desde</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Shield size={16} className="text-theme-textSecondary" />
                  <div>
                    <p className="text-sm font-medium text-theme-text capitalize">
                      {user?.rol || 'Usuario'}
                    </p>
                    <p className="text-xs text-theme-textSecondary">Rol en el sistema</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="bg-gradient-to-r from-theme-accent/10 to-theme-primary/10 rounded-lg p-4 border border-theme-border">
              <h3 className="text-sm font-semibold text-theme-text mb-3">
                Actividad Reciente
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-theme-accent">0</p>
                  <p className="text-xs text-theme-textSecondary">Ventas hoy</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-theme-primary">0</p>
                  <p className="text-xs text-theme-textSecondary">Pedidos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="px-6 py-4 border-t border-theme-border">
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-theme-secondary text-theme-text rounded-lg hover:bg-theme-border transition-all duration-200 hover:scale-[1.02]">
              <Settings size={16} />
              Configuración
            </button>
            <button
              onClick={onLogout}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 hover:scale-[1.02] shadow-md hover:shadow-lg"
            >
              <LogOut size={16} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal; 
