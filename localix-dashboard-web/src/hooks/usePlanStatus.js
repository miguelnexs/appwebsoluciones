import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../api/apiConfig';

export const usePlanStatus = () => {
  const [planStatus, setPlanStatus] = useState({
    isLoading: true,
    isActive: true,
    isExpired: false,
    planData: null,
    error: null
  });

  const auth = useAuth();
  const { isAuthenticated, user } = auth;
  const token = auth.tokens?.access; // Corregir: obtener el token correctamente
  
  // Debug: ver qué está recibiendo del AuthContext
  console.log('🔍 usePlanStatus - AuthContext completo:', {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user?.username,
    hasAccessToken: !!auth.tokens?.access,
    hasRefreshToken: !!auth.tokens?.refresh,
    accessTokenLength: auth.tokens?.access?.length || 0,
    token: token ? 'Presente' : 'Ausente',
    tokens: auth.tokens ? 'Presente' : 'Ausente'
  });

  const fetchPlanStatus = useCallback(async () => {
    console.log('🔍 fetchPlanStatus - Verificando autenticación:');
    console.log('  - isAuthenticated:', isAuthenticated);
    console.log('  - token:', token ? 'Presente' : 'Ausente');
    console.log('  - user:', user);
    
    if (!isAuthenticated || !token) {
      console.log('❌ fetchPlanStatus - Usuario no autenticado o sin token');
      setPlanStatus(prev => ({
        ...prev,
        isLoading: false,
        isActive: false,
        error: 'No autenticado'
      }));
      return;
    }

    // Si el usuario es admin (superusuario), no aplicar restricciones de plan
    if (user && user.is_superuser) {
      console.log('🔧 Usuario superusuario detectado, acceso sin restricciones');
      setPlanStatus({
        isLoading: false,
        isActive: true,
        isExpired: false,
        planData: {
          plan_type: 'premium',
          days_remaining: 3650,
          is_active: true,
          is_expired: false,
          end_date: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
          usage_percentage: 0
        },
        error: null
      });
      return;
    }

    try {
      setPlanStatus(prev => ({ ...prev, isLoading: true, error: null }));

      console.log('🔍 Verificando estado del plan...');
      console.log('Token:', token ? 'Presente' : 'Ausente');
      console.log('Usuario:', user);

      const response = await fetch(API_URL('usuarios/usage/status/'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Respuesta del servidor:', response.status);

      if (response.ok) {
        const planData = await response.json();
        console.log('📊 Datos del plan:', planData);
        
        // Solo considerar expirado si realmente está expirado
        const isExpired = planData.is_expired === true;
        const isActive = !isExpired; // Solo bloquear si está realmente expirado
        
        console.log('🔍 Análisis del plan:');
        console.log('  - is_expired (API):', planData.is_expired);
        console.log('  - isExpired (calculado):', isExpired);
        console.log('  - isActive (calculado):', isActive);
        console.log('  - days_remaining:', planData.days_remaining);
        
        setPlanStatus({
          isLoading: false,
          isActive: isActive,
          isExpired: isExpired,
          planData: planData,
          error: null
        });
      } else {
        console.error('❌ Error en la respuesta:', response.status, response.statusText);
        
        // Si no se puede verificar el plan, asumir que está activo para no bloquear al usuario
        setPlanStatus({
          isLoading: false,
          isActive: true,
          isExpired: false,
          planData: null,
          error: `Error HTTP: ${response.status}`
        });
      }
    } catch (error) {
      console.error('❌ Error fetching plan status:', error);
      
      // En caso de error, asumir que está activo para no bloquear al usuario
      setPlanStatus({
        isLoading: false,
        isActive: true,
        isExpired: false,
        planData: null,
        error: error.message
      });
    }
  }, [isAuthenticated, token, user]);

  // Verificar el estado del plan cuando se monta el componente
  useEffect(() => {
    fetchPlanStatus();
  }, [fetchPlanStatus]);

  // Función para refrescar el estado del plan
  const refreshPlanStatus = useCallback(() => {
    fetchPlanStatus();
  }, [fetchPlanStatus]);

  // Función para verificar si el plan necesita advertencia
  const needsWarning = useCallback(() => {
    if (!planStatus.planData) return false;
    return planStatus.planData.days_remaining <= 3 && planStatus.planData.days_remaining > 0;
  }, [planStatus.planData]);

  // Función para obtener el mensaje de advertencia
  const getWarningMessage = useCallback(() => {
    if (!planStatus.planData || !needsWarning()) return null;
    
    const { plan_type, days_remaining } = planStatus.planData;
    
    if (plan_type === 'trial') {
      return `⚠️ Tu período de prueba gratuita expira en ${days_remaining} días. Considera adquirir un plan para continuar.`;
    } else {
      return `⚠️ Tu plan expira en ${days_remaining} días. Renueva tu suscripción para evitar interrupciones.`;
    }
  }, [planStatus.planData, needsWarning]);

  // Función para obtener el mensaje de bienvenida
  const getWelcomeMessage = useCallback(() => {
    if (!planStatus.planData) return null;
    
    const { plan_type, days_remaining } = planStatus.planData;
    
    switch (plan_type) {
      case 'trial':
        return `🎉 ¡Bienvenido! Tienes ${days_remaining} días restantes en tu período de prueba gratuita.`;
      case 'basic':
        return `👋 ¡Bienvenido! Tu plan básico tiene ${days_remaining} días restantes.`;
      case 'premium':
        return `👋 ¡Bienvenido! Tu plan premium tiene ${days_remaining} días restantes.`;
      default:
        return `👋 ¡Bienvenido! Tu plan personalizado tiene ${days_remaining} días restantes.`;
    }
  }, [planStatus.planData]);

  // Log del estado actual para debugging
  console.log('🔄 Estado actual del plan:', {
    isLoading: planStatus.isLoading,
    isActive: planStatus.isActive,
    isExpired: planStatus.isExpired,
    planData: planStatus.planData,
    error: planStatus.error
  });

  return {
    ...planStatus,
    refreshPlanStatus,
    needsWarning,
    getWarningMessage,
    getWelcomeMessage
  };
};

