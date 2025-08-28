import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

// Tipos
interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  tienda?: {
    id: number;
    nombre: string;
    descripcion: string;
    logo?: string;
  };
}

interface AuthState {
  user: User | null;
  tokens: {
    access: string | null;
    refresh: string | null;
  };
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Estado inicial
const initialState: AuthState = {
  user: null,
  tokens: {
    access: localStorage.getItem('tienda_access_token') || null,
    refresh: localStorage.getItem('tienda_refresh_token') || null,
  },
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Tipos de acciones
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
} as const;

type AuthAction = 
  | { type: typeof AUTH_ACTIONS.LOGIN_START }
  | { type: typeof AUTH_ACTIONS.LOGIN_SUCCESS; payload: { user: User; tokens: { access: string; refresh: string } } }
  | { type: typeof AUTH_ACTIONS.LOGIN_FAILURE; payload: string }
  | { type: typeof AUTH_ACTIONS.LOGOUT }
  | { type: typeof AUTH_ACTIONS.SET_LOADING; payload: boolean }
  | { type: typeof AUTH_ACTIONS.CLEAR_ERROR };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        tokens: { access: null, refresh: null },
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        tokens: { access: null, refresh: null },
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

// Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Configurar axios interceptors
const setupAxiosInterceptors = (tokens: { access: string | null; refresh: string | null }, dispatch: React.Dispatch<AuthAction>) => {
  // Limpiar interceptors existentes para evitar duplicados
  axios.interceptors.request.clear();
  axios.interceptors.response.clear();
  
  // Configurar timeout por defecto más corto
  axios.defaults.timeout = 10000; // 10 segundos en lugar de 30
  
  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      if (tokens.access) {
        config.headers.Authorization = `Bearer ${tokens.access}`;
      }
      // Asegurar que el timeout esté configurado
      if (!config.timeout) {
        config.timeout = 10000;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor para manejar token refresh
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry && tokens.refresh) {
        originalRequest._retry = true;
        
        try {
          // Usar timeout más corto para refresh token
          const refreshResponse = await axios.post(`${API_CONFIG.API_URL}/auth/token/refresh/`, {
            refresh: tokens.refresh
          }, { timeout: 5000 });
          
          const newAccessToken = refreshResponse.data.access;
          localStorage.setItem('tienda_access_token', newAccessToken);
          
          // Actualizar el token en el header
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          return axios(originalRequest);
        } catch (refreshError) {
          // Si el refresh falla, hacer logout
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
          localStorage.removeItem('tienda_access_token');
          localStorage.removeItem('tienda_refresh_token');
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
};

// Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // Configurar interceptors cuando cambien los tokens
  useEffect(() => {
    setupAxiosInterceptors(state.tokens, dispatch);
  }, [state.tokens]);

  // Verificar autenticación al cargar con optimizaciones
  useEffect(() => {
    const checkAuth = async () => {
      if (state.tokens.access) {
        try {
          // Crear una instancia de axios con timeout reducido para verificación inicial
          const axiosInstance = axios.create({
            timeout: 5000, // 5 segundos en lugar de 30
            baseURL: API_CONFIG.API_URL
          });
          
          const response = await axiosInstance.get('/auth/user/profile/');
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: response.data,
              tokens: state.tokens as { access: string; refresh: string }
            }
          });
        } catch (error) {
          // Token inválido, limpiar
          localStorage.removeItem('tienda_access_token');
          localStorage.removeItem('tienda_refresh_token');
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    // Usar setTimeout para no bloquear el renderizado inicial
    const timeoutId = setTimeout(checkAuth, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  const login = async (username: string, password: string) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      // Usar timeout rápido para login
      const response = await axios.post(`${API_CONFIG.API_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
        username,
        password
      }, {
        timeout: API_CONFIG.FAST_TIMEOUT // 5 segundos para login
      });
      
      const { access, refresh, user } = response.data;
      
      // Guardar tokens
      localStorage.setItem('tienda_access_token', access);
      localStorage.setItem('tienda_refresh_token', refresh);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user,
          tokens: { access, refresh }
        }
      });
      
      // Redirigir al inicio con un pequeño delay para mejor UX
      setTimeout(() => navigate('/'), 100);
    } catch (error: any) {
      let errorMessage = 'Error de autenticación';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'La conexión tardó demasiado. Verifica tu conexión a internet.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Usuario o contraseña incorrectos';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: errorMessage });
    }
  };

  const logout = () => {
    localStorage.removeItem('tienda_access_token');
    localStorage.removeItem('tienda_refresh_token');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    navigate('/login');
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;