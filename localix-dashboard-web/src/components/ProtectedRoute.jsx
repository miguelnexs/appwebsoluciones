import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePlanStatus } from '../hooks/usePlanStatus';
import { useToast } from '../hooks/useToast';
import PlanExpired from './PlanExpired';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isActive, isExpired, isLoading: planLoading, planData, refreshPlanStatus } = usePlanStatus();
  const { showToast } = useToast();
  const location = useLocation();
  const [hasShownWarning, setHasShownWarning] = useState(false);

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

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading || planLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700 font-medium">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Redirigir al login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Mostrar página de plan expirado si el plan no está activo
  if (!isActive || isExpired) {
    return (
      <PlanExpired 
        planData={planData}
        onRefresh={refreshPlanStatus}
      />
    );
  }

  // Renderizar los children si todo está bien
  return children;
};

export default ProtectedRoute;


