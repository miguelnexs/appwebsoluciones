import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback, ReactNode } from 'react';
import { authService, LoginResponse } from '@/services/api';

// Tipos
interface User {
  id: number;
  username: string;
  email: string;
  nombre_completo: string;
  rol: string;
  es_activo: boolean;
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
  login: (username: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
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
  SET_USER: 'SET_USER',
} as const;

type AuthAction =
  | { type: typeof AUTH_ACTIONS.LOGIN_START }
  | { type: typeof AUTH_ACTIONS.LOGIN_SUCCESS; payload: { user: User; tokens: { access: string; refresh: string } } }
  | { type: typeof AUTH_ACTIONS.LOGIN_FAILURE; payload: string }
  | { type: typeof AUTH_ACTIONS.LOGOUT }
  | { type: typeof AUTH_ACTIONS.SET_LOADING; payload: boolean }
  | { type: typeof AUTH_ACTIONS.CLEAR_ERROR }
  | { type: typeof AUTH_ACTIONS.SET_USER; payload: User };

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

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };

    default:
      return state;
  }
};

// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar el contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Provider del contexto
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const isRefreshing = useRef(false);

  // Verificar token al cargar la aplicación y auto-login
  useEffect(() => {
    const verifyTokenOrAutoLogin = async () => {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const userData = localStorage.getItem('user');

      // Si no hay tokens, hacer auto-login automáticamente
      if (!accessToken || !refreshToken) {
        try {
          console.log('Iniciando sesión automáticamente...');
          const response = await authService.login('cafe', 'cafe1457');
          
          if (response.success && response.tokens && response.user) {
            // Guardar en localStorage
            localStorage.setItem('access_token', response.tokens.access);
            localStorage.setItem('refresh_token', response.tokens.refresh);
            localStorage.setItem('user', JSON.stringify(response.user));

            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: {
                user: response.user,
                tokens: response.tokens,
              },
            });
          } else {
            console.error('Error en auto-login:', response.message);
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
          }
        } catch (error) {
          console.error('Error en auto-login:', error);
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
        return;
      }

      try {
        // Verificar si el token existente es válido
        const isValid = await authService.verifyToken();
        
        if (isValid && userData) {
          const user = JSON.parse(userData);
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user,
              tokens: { access: accessToken, refresh: refreshToken },
            },
          });
        } else {
          // Token inválido, hacer auto-login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          
          try {
            console.log('Token inválido, reautenticando automáticamente...');
            const response = await authService.login('cafe', 'cafe1457');
            
            if (response.success && response.tokens && response.user) {
              localStorage.setItem('access_token', response.tokens.access);
              localStorage.setItem('refresh_token', response.tokens.refresh);
              localStorage.setItem('user', JSON.stringify(response.user));

              dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: {
                  user: response.user,
                  tokens: response.tokens,
                },
              });
            } else {
              dispatch({ type: AUTH_ACTIONS.LOGOUT });
            }
          } catch (autoLoginError) {
            console.error('Error en reautenticación automática:', autoLoginError);
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
          }
        }
      } catch (error) {
        console.error('Error verificando token:', error);
        // En caso de error, intentar auto-login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        try {
          const response = await authService.login('cafe', 'cafe1457');
          
          if (response.success && response.tokens && response.user) {
            localStorage.setItem('access_token', response.tokens.access);
            localStorage.setItem('refresh_token', response.tokens.refresh);
            localStorage.setItem('user', JSON.stringify(response.user));

            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: {
                user: response.user,
                tokens: response.tokens,
              },
            });
          } else {
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
          }
        } catch (autoLoginError) {
          console.error('Error en auto-login de emergencia:', autoLoginError);
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } finally {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    verifyTokenOrAutoLogin();
  }, []);

  // Función de login
  const login = useCallback(async (username: string, password: string): Promise<LoginResponse> => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await authService.login(username, password);

      if (response.success && response.tokens && response.user) {
        // Guardar en localStorage
        localStorage.setItem('access_token', response.tokens.access);
        localStorage.setItem('refresh_token', response.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(response.user));

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.user,
            tokens: response.tokens,
          },
        });
      } else {
        const errorMessage = response.message || 'Error de autenticación';
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: errorMessage,
        });
      }

      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error de conexión';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  }, []);

  // Función de logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error durante logout:', error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  // Limpiar errores
  const clearError = useCallback((): void => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

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