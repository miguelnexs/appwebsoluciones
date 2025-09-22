import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Building2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Login = () => {
  const [formData, setFormData] = useState({
    username: 'apsoluciones',
    password: 'migel1457'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isAutoLogging, setIsAutoLogging] = useState(true);
  
  const { login, isLoading, error, user, clearError } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user?.isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  // Manejar el login automático y limpiar errores cuando el componente se monta
  useEffect(() => {
    clearError();
    
    // Simular un pequeño delay para mostrar el estado de carga del login automático
    const timer = setTimeout(() => {
      setIsAutoLogging(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error de validación del campo específico
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFocus = () => {
    clearError();
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validación en tiempo real
    if (!value.trim()) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: name === 'username' ? 'El usuario es requerido' : 'La contraseña es requerida'
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación
    const errors: {[key: string]: string} = {};
    if (!formData.username.trim()) {
      errors.username = 'El usuario es requerido';
    }
    if (!formData.password.trim()) {
      errors.password = 'La contraseña es requerida';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    const success = await login(formData.username, formData.password);
    if (success) {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Información de la empresa */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12 flex-col justify-center">
        <div className="max-w-md">
          <div className="flex items-center mb-8">
            <Building2 className="h-12 w-12 mr-4" />
            <h1 className="text-3xl font-bold">APSoluciones</h1>
          </div>
          
          <h2 className="text-2xl font-semibold mb-6">
            Soluciones Integrales para tu Empresa
          </h2>
          
          <p className="text-blue-100 mb-8 leading-relaxed">
            Accede al panel de administración para gestionar productos, categorías y 
            toda la información de tu catálogo empresarial.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
              <span className="text-blue-100">Gestión de productos y servicios</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
              <span className="text-blue-100">Control de categorías</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
              <span className="text-blue-100">Administración completa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario de login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">APSoluciones</h1>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
              <p className="text-gray-600">
                {isAutoLogging ? 'Iniciando sesión automáticamente...' : 'Accede al panel de administración'}
              </p>
            </div>

            {/* Indicador de login automático */}
            {isAutoLogging && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
                <Loader2 className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 animate-spin" />
                <span className="text-blue-700 text-sm">Iniciando sesión con credenciales guardadas...</span>
              </div>
            )}

            {/* Error general */}
            {error && !isAutoLogging && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Usuario */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa tu usuario"
                  disabled={isLoading || isAutoLogging}
                />
                {validationErrors.username && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
                )}
              </div>

              {/* Campo Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      validationErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Ingresa tu contraseña"
                    disabled={isLoading || isAutoLogging}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={isLoading || isAutoLogging}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>

              {/* Botón de envío */}
              <Button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isAutoLogging}
              >
                {isLoading || isAutoLogging ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isAutoLogging ? 'Iniciando automáticamente...' : 'Iniciando sesión...'}
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>

            {/* Información de login automático */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-2">Login Automático Activado</p>
              <p className="text-sm text-green-700">Usuario: apsoluciones</p>
              <p className="text-sm text-green-700">La aplicación iniciará sesión automáticamente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;