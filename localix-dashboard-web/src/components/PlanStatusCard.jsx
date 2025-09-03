import React from 'react';
import { usePlanStatus } from '../hooks/usePlanStatus';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PlanStatusCard = () => {
  const { isLoading, planData, needsWarning, refreshPlanStatus, isExpired } = usePlanStatus();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
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

  if (isLoading || !planData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
          <div className="h-6 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const getPlanTypeInfo = (planType) => {
    switch (planType) {
      case 'trial':
        return { 
          name: '🎁 Prueba Gratuita', 
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'basic':
        return { 
          name: '📦 Plan Básico', 
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'premium':
        return { 
          name: '⭐ Plan Premium', 
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      default:
        return { 
          name: '🔧 Plan Personalizado', 
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        };
    }
  };

  const planInfo = getPlanTypeInfo(planData.plan_type);
  const isWarning = needsWarning();
  // Solo considerar expirado si realmente está expirado, no por días restantes
  const isPlanExpired = isExpired;

  return (
    <div className={`rounded-lg shadow-sm border p-4 ${
      isPlanExpired ? 'bg-red-50 border-red-200' :
      isWarning ? 'bg-yellow-50 border-yellow-200' : 
      `${planInfo.bgColor} ${planInfo.borderColor}`
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold text-sm ${
              isPlanExpired ? 'text-red-800' :
              isWarning ? 'text-yellow-800' : planInfo.color
            }`}>
              {planInfo.name}
            </h3>
            {isPlanExpired && (
              <span className="text-red-600 text-xs">⏰</span>
            )}
            {isWarning && !isPlanExpired && (
              <span className="text-yellow-600 text-xs">⚠️</span>
            )}
          </div>
          
          <div className="text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Días restantes:</span>
              <span className={`font-medium ${
                isPlanExpired ? 'text-red-600' :
                planData.days_remaining <= 3 ? 'text-red-600' : 
                planData.days_remaining <= 7 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {isPlanExpired ? '0' : planData.days_remaining}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Expira:</span>
              <span className="font-medium">
                {new Date(planData.end_date).toLocaleDateString('es-ES')}
              </span>
            </div>
          </div>
        </div>

        {!isPlanExpired && (
          <button
            onClick={refreshPlanStatus}
            className="ml-3 p-1 text-slate-400 hover:text-slate-600 transition-colors"
            title="Actualizar estado del plan"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      {/* Barra de progreso */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Progreso del plan</span>
          <span>{Math.round(planData.usage_percentage)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isPlanExpired ? 'bg-red-500' :
              planData.usage_percentage >= 90 ? 'bg-red-500' :
              planData.usage_percentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(100, planData.usage_percentage)}%` }}
          ></div>
        </div>
      </div>

      {/* Mensaje de plan expirado */}
      {isPlanExpired && (
        <div className="mt-3 space-y-2">
          <div className="text-xs text-red-700 font-medium">
            Tu plan ha expirado. Para continuar usando Localix, necesitas renovar tu suscripción.
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      )}

      {/* Mensaje de advertencia */}
      {isWarning && !isPlanExpired && (
        <div className="mt-2 text-xs text-yellow-700">
          {planData.plan_type === 'trial' 
            ? 'Tu período de prueba está por expirar. Considera adquirir un plan.'
            : 'Tu plan está por expirar. Renueva tu suscripción pronto.'
          }
        </div>
      )}
    </div>
  );
};

export default PlanStatusCard;

