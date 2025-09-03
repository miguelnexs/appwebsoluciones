import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import localixLogo from '../assets/localix-logo.png';

const PlanExpired = ({ planData, onContactSupport }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      // Usar la función logout del contexto de autenticación
      await logout();
      // La función logout ya maneja la redirección al login
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // En caso de error, limpiar manualmente y redirigir
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const getPlanTypeDisplay = (planType) => {
    switch (planType) {
      case 'trial':
        return { name: '🎁 Período de Prueba Gratuita', color: '#4CAF50' };
      case 'basic':
        return { name: '📦 Plan Básico', color: '#2196F3' };
      case 'premium':
        return { name: '⭐ Plan Premium', color: '#FF9800' };
      default:
        return { name: '🔧 Plan Personalizado', color: '#9C27B0' };
    }
  };

  const getPlanMessage = (planType) => {
    switch (planType) {
      case 'trial':
        return 'Tu período de prueba gratuita ha finalizado. Para continuar utilizando Localix, necesitas adquirir un plan de pago.';
      case 'basic':
        return 'Tu plan básico ha finalizado. Para continuar utilizando Localix, necesitas renovar tu suscripción.';
      case 'premium':
        return 'Tu plan premium ha finalizado. Para continuar utilizando Localix, necesitas renovar tu suscripción.';
      default:
        return 'Tu plan personalizado ha finalizado. Para continuar utilizando Localix, necesitas renovar tu suscripción.';
    }
  };

  const planDisplay = getPlanTypeDisplay(planData?.plan_type || 'trial');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center">
        {/* Icono de advertencia */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="text-4xl">⚠️</div>
        </div>

        {/* Logo de Localix */}
        <div className="flex items-center justify-center mb-6">
          <img 
            src={localixLogo} 
            alt="Localix" 
            className="w-12 h-12 rounded-xl shadow-md mr-3"
          />
          <h1 className="text-2xl font-bold text-slate-800">Localix</h1>
        </div>

        {/* Título */}
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          Plan de Uso Expirado
        </h2>

        {/* Mensaje específico */}
        <p className="text-slate-600 mb-6 leading-relaxed">
          {getPlanMessage(planData?.plan_type)}
        </p>

        {/* Información del plan */}
        {planData && (
          <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-slate-800 mb-3 text-center">
              Información de tu Plan
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-slate-600">Tipo de Plan:</span>
                <span 
                  className="font-semibold"
                  style={{ color: planDisplay.color }}
                >
                  {planDisplay.name}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium text-slate-600">Días Permitidos:</span>
                <span className="text-slate-800">{planData.days_allowed} días</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium text-slate-600">Fecha de Expiración:</span>
                <span className="text-slate-800">
                  {new Date(planData.end_date).toLocaleDateString('es-ES')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium text-slate-600">Estado:</span>
                <span className="text-red-600 font-semibold">EXPIRADO</span>
              </div>
            </div>
          </div>
        )}

        {/* Información de contacto */}
        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-800 mb-2">
            ¿Necesitas Ayuda?
          </h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Email:</strong> info@localix.com</p>
            <p><strong>Teléfono:</strong> (+57) 314 743 5305</p>
            <p><strong>Horario:</strong> Lunes a Viernes 8:00 AM - 6:00 PM</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.open('mailto:info@localix.com')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contactar Soporte
          </button>
          
          <button
            onClick={handleLogout}
            className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>

        {/* Mensaje adicional */}
        <p className="text-xs text-slate-500 mt-4">
          Si crees que esto es un error, contacta inmediatamente a nuestro soporte técnico.
        </p>
      </div>
    </div>
  );
};

export default PlanExpired;

