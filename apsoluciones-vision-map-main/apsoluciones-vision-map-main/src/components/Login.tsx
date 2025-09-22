import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({
    username: false,
    password: false
  });

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Limpiar errores cuando el componente se monta
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (error) {
      clearError();
    }
  };

  const handleFocus = (field: string) => {
    setIsFocused(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleBlur = (field: string) => {
    setIsFocused(prev => ({
      ...prev,
      [field]: false
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      return;
    }

    const success = await login(formData.username, formData.password);
    
    if (success) {
      navigate('/');
    }
  };

  // Limpiar error cuando el usuario empiece a escribir
  useEffect(() => {
    if (error && (formData.username || formData.password)) {
      clearError();
    }
  }, [formData, error, clearError]);

  return (
    <div className="min-h-screen flex">
      {/* Columna izquierda - Información de la empresa */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Contenido principal */}
        <div className="relative z-10">
          {/* Logo y título */}
          <div className="flex items-center mb-12">
            <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center mr-4">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Apsoluciones</h1>
              <p className="text-slate-300 text-sm">Sistema de Gestión Empresarial</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Transforma tu negocio con tecnología inteligente
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            Apsoluciones es la solución integral que tu empresa necesita para optimizar procesos, 
            controlar inventarios y aumentar ventas de manera eficiente.
          </p>
        </div>

        {/* Características principales */}
        <div className="space-y-6 mb-12 relative z-10">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center mr-4 mt-1">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Gestión de Inventario Inteligente</h3>
              <p className="text-slate-400 text-sm">Control total de productos, categorías y stock en tiempo real</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center mr-4 mt-1">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Análisis de Ventas Avanzado</h3>
              <p className="text-slate-400 text-sm">Reportes detallados y métricas para tomar mejores decisiones</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center mr-4 mt-1">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Interfaz Intuitiva</h3>
              <p className="text-slate-400 text-sm">Diseño moderno y fácil de usar para todos los usuarios</p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-8 mb-12 relative z-10">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">99%</div>
            <div className="text-slate-400 text-sm">Tiempo Activo</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">500+</div>
            <div className="text-slate-400 text-sm">Empresas Confían</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">24/7</div>
            <div className="text-slate-400 text-sm">Soporte Técnico</div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 border-t border-slate-700 relative z-10">
          <p className="text-slate-400 text-sm">
            © 2025 Apsoluciones. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Columna derecha - Formulario de login */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Logo para móvil */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Apsoluciones</h1>
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
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-700">
                      {error}
                    </p>
                  </div>
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
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className={`h-5 w-5 transition-colors ${
                      isFocused.username ? 'text-slate-600' : 'text-slate-400'
                    }`} />
                  </div>
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
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all ${
                      isFocused.username 
                        ? 'border-slate-300 bg-slate-50/50' 
                        : 'border-slate-300 bg-white hover:border-slate-400'
                    }`}
                    placeholder="Ingresa tu usuario"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Campo Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 transition-colors ${
                      isFocused.password ? 'text-slate-600' : 'text-slate-400'
                    }`} />
                  </div>
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
                    className={`block w-full pl-10 pr-12 py-3 border rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all ${
                      isFocused.password 
                        ? 'border-slate-300 bg-slate-50/50' 
                        : 'border-slate-300 bg-white hover:border-slate-400'
                    }`}
                    placeholder="Ingresa tu contraseña"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Botón de submit */}
              <Button
                type="submit"
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>

            {/* Credenciales de prueba */}
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-800 font-medium mb-2">
                Credenciales de acceso:
              </p>
              <p className="text-sm text-slate-700">
                <strong>Usuario:</strong> apsoluciones
              </p>
              <p className="text-sm text-slate-700">
                <strong>Contraseña:</strong> migel1457
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;