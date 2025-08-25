import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import localixLogo from '../img/localix-logo.png';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({ username: false, password: false });

  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Limpiar errores cuando cambie el formulario
  useEffect(() => {
    if (error) {
      clearError();
    }
    if (authError && (formData.username || formData.password)) {
      setAuthError('');
    }
  }, [formData, clearError, authError]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      const card = document.querySelector('.login-card');
      if (card) {
        card.classList.add('shake');
        setTimeout(() => {
          card.classList.remove('shake');
        }, 600);
      }
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    if (authError) {
      setAuthError('');
    }
  };

  const handleFocus = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setAuthError('');
    
    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        // Verificar el estado del plan después del login exitoso
        try {
          const planResponse = await fetch('http://localhost:8000/api/usuarios/usage/status/', {
            headers: {
              'Authorization': `Bearer ${result.tokens.access}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (planResponse.ok) {
            const planData = await planResponse.json();
            
            // Verificar si el plan está expirado o inactivo
            if (!planData.is_active) {
              // Plan desactivado
              if (planData.plan_type === 'trial') {
                setAuthError('❌ Tu período de prueba gratuita ha sido desactivado. Contacta al administrador para reactivar tu cuenta.');
                showToast('Período de prueba desactivado', 'Plan desactivado', 'error');
              } else if (planData.plan_type === 'basic') {
                setAuthError('❌ Tu plan básico ha sido desactivado. Contacta al administrador para reactivar tu cuenta.');
                showToast('Plan básico desactivado', 'Plan desactivado', 'error');
              } else if (planData.plan_type === 'premium') {
                setAuthError('❌ Tu plan premium ha sido desactivado. Contacta al administrador para reactivar tu cuenta.');
                showToast('Plan premium desactivado', 'Plan desactivado', 'error');
              } else {
                setAuthError('❌ Tu plan personalizado ha sido desactivado. Contacta al administrador para reactivar tu cuenta.');
                showToast('Plan desactivado', 'Plan desactivado', 'error');
              }
              
              const card = document.querySelector('.login-card');
              if (card) {
                card.classList.add('shake');
                setTimeout(() => card.classList.remove('shake'), 600);
              }
              return;
            }
            
            if (planData.is_expired) {
              // Plan expirado
              if (planData.plan_type === 'trial') {
                setAuthError('⏰ Tu período de prueba gratuita ha expirado. Para continuar usando Localix, necesitas adquirir un plan de pago.');
                showToast('Período de prueba expirado', 'Plan expirado', 'error');
              } else if (planData.plan_type === 'basic') {
                setAuthError('⏰ Tu plan básico ha expirado. Renueva tu suscripción para continuar usando Localix.');
                showToast('Plan básico expirado', 'Plan expirado', 'error');
              } else if (planData.plan_type === 'premium') {
                setAuthError('⏰ Tu plan premium ha expirado. Renueva tu suscripción para continuar usando Localix.');
                showToast('Plan premium expirado', 'Plan expirado', 'error');
              } else {
                setAuthError('⏰ Tu plan personalizado ha expirado. Renueva tu suscripción para continuar usando Localix.');
                showToast('Plan personalizado expirado', 'Plan expirado', 'error');
              }
              
              const card = document.querySelector('.login-card');
              if (card) {
                card.classList.add('shake');
                setTimeout(() => card.classList.remove('shake'), 600);
              }
              return;
            }
            
            // Plan activo - mostrar mensaje de bienvenida
            if (planData.plan_type === 'trial') {
              showToast(`🎉 ¡Bienvenido! Tienes ${planData.days_remaining} días restantes en tu período de prueba gratuita.`, 'Bienvenido', 'success');
            } else if (planData.plan_type === 'basic') {
              showToast(`👋 ¡Bienvenido! Tu plan básico tiene ${planData.days_remaining} días restantes.`, 'Bienvenido', 'success');
            } else if (planData.plan_type === 'premium') {
              showToast(`👋 ¡Bienvenido! Tu plan premium tiene ${planData.days_remaining} días restantes.`, 'Bienvenido', 'success');
            } else {
              showToast(`👋 ¡Bienvenido! Tu plan personalizado tiene ${planData.days_remaining} días restantes.`, 'Bienvenido', 'success');
            }
            
            // Mostrar advertencia si quedan pocos días
            if (planData.days_remaining <= 3 && planData.days_remaining > 0) {
              setTimeout(() => {
                if (planData.plan_type === 'trial') {
                  showToast(`⚠️ Tu período de prueba gratuita expira en ${planData.days_remaining} días. Considera adquirir un plan para continuar.`, 'Advertencia', 'warning');
                } else {
                  showToast(`⚠️ Tu plan expira en ${planData.days_remaining} días. Renueva tu suscripción para evitar interrupciones.`, 'Advertencia', 'warning');
                }
              }, 2000);
            }
            
            // Solo navegar si el plan está activo
            navigate('/');
            
          } else {
            // Si no se puede verificar el plan, permitir acceso pero mostrar advertencia
            showToast('⚠️ No se pudo verificar el estado de tu plan. Si tienes problemas, contacta al administrador.', 'Advertencia', 'warning');
            navigate('/');
          }
        } catch (planError) {
          console.error('Error verificando plan:', planError);
          showToast('⚠️ No se pudo verificar el estado de tu plan. Si tienes problemas, contacta al administrador.', 'Advertencia', 'warning');
          navigate('/');
        }
        
      } else {
        if (result.error && result.error.includes('credentials')) {
          setAuthError('Usuario o contraseña incorrecta');
          showToast('Usuario o contraseña incorrecta', 'Error de autenticación', 'error');
        } else if (result.error && result.error.includes('network')) {
          setAuthError('Error de conexión. Verifica tu internet.');
          showToast('Error de conexión', 'Error de red', 'error');
        } else {
          setAuthError('Error al iniciar sesión. Intenta nuevamente.');
          showToast(result.error || 'Error en el login', 'Error', 'error');
        }
        
        const card = document.querySelector('.login-card');
        if (card) {
          card.classList.add('shake');
          setTimeout(() => {
            card.classList.remove('shake');
          }, 600);
        }
      }
    } catch (error) {
      setAuthError('Error de conexión. Verifica tu internet.');
      showToast('Error de conexión', 'Error de red', 'error');
      
      const card = document.querySelector('.login-card');
      if (card) {
        card.classList.add('shake');
        setTimeout(() => {
          card.classList.remove('shake');
        }, 600);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="spin-smooth rounded-full h-16 w-16 border-4 border-slate-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-700 text-lg font-medium">Cargando Localix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Columna izquierda - Información de la empresa */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
        {/* Fondo sutil con patrón */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 py-12">
          {/* Logo y título */}
          <div className="mb-12">
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg mr-4">
                <img src={localixLogo} alt="Localix" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Localix</h1>
                <p className="text-slate-300 text-sm">Sistema de Gestión Empresarial</p>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Transforma tu negocio con tecnología inteligente
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed">
              Localix es la solución integral que tu empresa necesita para optimizar procesos, 
              controlar inventarios y aumentar ventas de manera eficiente.
            </p>
          </div>

          {/* Características principales */}
          <div className="space-y-6 mb-12">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center mr-4 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Gestión de Inventario Inteligente</h3>
                <p className="text-slate-400 text-sm">Control total de stock con alertas automáticas y reportes detallados</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center mr-4 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Sistema de Ventas Profesional</h3>
                <p className="text-slate-400 text-sm">Facturación rápida, múltiples métodos de pago y control de caja</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center mr-4 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">CRM Avanzado</h3>
                <p className="text-slate-400 text-sm">Gestión completa de clientes con historial de compras y seguimiento</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center mr-4 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Dashboard en Tiempo Real</h3>
                <p className="text-slate-400 text-sm">Métricas clave y reportes automáticos para tomar mejores decisiones</p>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">500+</div>
              <div className="text-slate-400 text-sm">Empresas Activas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">40%</div>
              <div className="text-slate-400 text-sm">Aumento en Ventas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">24/7</div>
              <div className="text-slate-400 text-sm">Soporte Técnico</div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-8 border-t border-slate-700">
            <p className="text-slate-400 text-sm">
              © 2025 Localix. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>

      {/* Columna derecha - Formulario de login */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Logo para móvil */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mr-3">
                <img src={localixLogo} alt="Localix" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Localix</h1>
                <p className="text-slate-600 text-sm">Sistema de Gestión Empresarial</p>
              </div>
            </div>
          </div>

          {/* Card del login */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 login-card">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Bienvenido de vuelta
              </h2>
              <p className="text-slate-600">
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>

            {/* Mensaje de error de autenticación */}
            {authError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-700">
                      {authError}
                    </p>
                  </div>
                  <button
                    onClick={() => setAuthError('')}
                    className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Username */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                  Usuario
                </label>
                <div className="relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus('username')}
                    onBlur={() => handleBlur('username')}
                    onKeyPress={handleKeyPress}
                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 border-2 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all duration-300 ${
                      errors.username 
                        ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                        : isFocused.username 
                          ? 'border-slate-400' 
                          : 'border-slate-200 hover:border-slate-300'
                    }`}
                    placeholder="Ingresa tu usuario"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                {errors.username && (
                  <p className="text-sm text-red-600 flex items-center animate-fade-in">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Campo Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus('password')}
                    onBlur={() => handleBlur('password')}
                    onKeyPress={handleKeyPress}
                    className={`w-full pl-12 pr-12 py-3 bg-slate-50 border-2 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all duration-300 ${
                      errors.password 
                        ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                        : isFocused.password 
                          ? 'border-slate-400' 
                          : 'border-slate-200 hover:border-slate-300'
                    }`}
                    placeholder="Ingresa tu contraseña"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-200 z-10"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center animate-fade-in">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Botón de envío */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 relative overflow-hidden group"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="spin-smooth -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Iniciando sesión...
                    </div>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <div className="flex items-center justify-center relative z-10">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Iniciar Sesión
                      </div>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Información adicional */}
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center space-x-2 text-slate-500 text-sm mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Sistema seguro y confiable</span>
              </div>
              <p className="text-xs text-slate-400">
                ¿Necesitas ayuda? Contacta soporte técnico
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
