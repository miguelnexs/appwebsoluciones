import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { apiService, LoginResponse, User } from '@/services/api';

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
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

// Estado inicial
const initialState: AuthState = {
  user: null,
  tokens: {
    access: localStorage.getItem('access_token') || null,
    refresh: localStorage.getItem('refresh_token') || null,
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (username: string, password: string): Promise<boolean> => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      // Intentar login con la API de softwarebycg.shop
      const response = await apiService.login(username, password);
      
      if (response && response.tokens && response.user) {
        const userData: User = {
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          first_name: response.user.first_name,
          last_name: response.user.last_name
        };
        
        // Guardar en localStorage
        localStorage.setItem('apsoluciones_user', JSON.stringify(userData));
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: userData,
            tokens: response.tokens
          }
        });
        
        return true;
      }
      
      dispatch({ 
        type: AUTH_ACTIONS.LOGIN_FAILURE, 
        payload: 'Credenciales incorrectas' 
      });
      return false;
      
    } catch (error: any) {
      let errorMessage = 'Error de autenticación';
      
      if (error.message?.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (error.message?.includes('401')) {
        errorMessage = 'Usuario o contraseña incorrectos';
      } else if (error.message?.includes('400')) {
        errorMessage = 'Datos de login inválidos';
      }
      
      dispatch({ 
        type: AUTH_ACTIONS.LOGIN_FAILURE, 
        payload: errorMessage 
      });
      return false;
    }
  };

  // Verificar autenticación al cargar y hacer login automático
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (accessToken && refreshToken) {
        try {
          // Simular verificación del token (en una implementación real, harías una llamada a la API)
          // Por ahora, asumimos que si hay tokens, el usuario está autenticado
          const savedUser = localStorage.getItem('apsoluciones_user');
          if (savedUser) {
            const userData = JSON.parse(savedUser);
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: {
                user: userData,
                tokens: { access: accessToken, refresh: refreshToken }
              }
            });
            return;
          }
        } catch (error) {
          // Si hay error, limpiar datos y continuar con login automático
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('apsoluciones_user');
        }
      }
      
      // Si no hay tokens válidos, hacer login automático con credenciales predeterminadas
      try {
        console.log('Iniciando login automático...');
        const success = await login('apsoluciones', 'migel1457');
        if (!success) {
          console.error('Error en login automático');
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Error en login automático:', error);
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    // Usar setTimeout para no bloquear el renderizado inicial
    const timeoutId = setTimeout(checkAuth, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem('apsoluciones_user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Llamar al método logout del API service
    apiService.logout();
    
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
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