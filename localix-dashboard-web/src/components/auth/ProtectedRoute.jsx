import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePlanStatus } from '../../hooks/usePlanStatus';
import { useToast } from '../../hooks/useToast';
import PlanExpired from '../PlanExpired';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { isActive, isExpired, isLoading: planLoading, planData, refreshPlanStatus } = usePlanStatus();
  const { showToast } = useToast();
  const location = useLocation();
  const [hasShownWarning, setHasShownWarning] = useState(false);

  // Log de debugging
  console.log('🛡️ ProtectedRoute - Estado actual:', {
    isAuthenticated,
    authLoading,
    user: user?.username,
    isActive,
    isExpired,
    planLoading,
    planData: planData ? {
      plan_type: planData.plan_type,
      days_remaining: planData.days_remaining,
      is_expired: planData.is_expired,
      is_active: planData.is_active
    } : null
  });

  // Mostrar advertencias de plan solo una vez por sesión
  useEffect(() => {
    if (!planLoading && isActive && planData && !hasShownWarning) {
      // Mostrar advertencia si quedan pocos días
      if (planData.days_remaining <= 3 && planData.days_remaining > 0) {
        const warningMessage = planData.plan_type === 'trial' 
          ? `⚠️ Tu período de prueba gratuita expira en ${planData.days_remaining} días. Considera adquirir un plan para continuar.`
          : `⚠️ Tu plan expira en ${planData.days_remaining} días. Renueva tu suscripción para evitar interrupciones.`;
        
        setTimeout(() => {
          showToast(warningMessage, 'warning');
        }, 1000);
        
        setHasShownWarning(true);
      }
    }
  }, [planLoading, isActive, planData, hasShownWarning, showToast]);

  // Mostrar loading mientras se verifica la autenticación y el plan
  if (authLoading || planLoading) {
    console.log('🔄 ProtectedRoute - Mostrando loading...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700 font-medium">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    console.log('❌ ProtectedRoute - Usuario no autenticado, redirigiendo al login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Mostrar página de plan expirado si el plan no está activo
  if (!isActive || isExpired) {
    console.log('❌ ProtectedRoute - Plan inactivo o expirado, mostrando PlanExpired');
    console.log('  - isActive:', isActive);
    console.log('  - isExpired:', isExpired);
    console.log('  - planData:', planData);
    return (
      <PlanExpired 
        planData={planData}
        onRefresh={refreshPlanStatus}
      />
    );
  }

  // Si se requiere un rol específico y el usuario no lo tiene
  if (requiredRole && user?.rol !== requiredRole && user?.rol !== 'admin') {
    console.log('❌ ProtectedRoute - Rol requerido no encontrado');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Acceso Denegado</h2>
          <p className="mt-2 text-gray-600">
            No tienes permisos para acceder a esta página.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Si todo está bien, mostrar el contenido
  console.log('✅ ProtectedRoute - Acceso permitido, mostrando contenido');
  return children;
};

export default ProtectedRoute;
