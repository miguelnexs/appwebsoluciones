import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// Estado inicial
const initialState = {
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
  UPDATE_USER: 'UPDATE_USER',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
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
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
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

// Crear contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();
  const isRefreshing = useRef(false);
  const failedQueue = useRef([]);

  const processQueue = (error, token = null) => {
    failedQueue.current.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    failedQueue.current = [];
  };

  // Configurar interceptores de Axios
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (state.tokens.access) {
          config.headers.Authorization = `Bearer ${state.tokens.access}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing.current) {
            // Si ya se está refrescando, agregar a la cola
            return new Promise((resolve, reject) => {
              failedQueue.current.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          isRefreshing.current = true;

          try {
            const response = await api.post('usuarios/refresh/', {
              refresh: state.tokens.refresh,
            });

            const { access } = response.data;
            localStorage.setItem('access_token', access);
            
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: {
                user: state.user,
                tokens: { ...state.tokens, access },
              },
            });

            processQueue(null, access);
            originalRequest.headers.Authorization = `Bearer ${access}`;
            return api(originalRequest);
          } catch (refreshError) {
            // Si el refresh token también expiró, hacer logout
            processQueue(refreshError, null);
            logout();
            return Promise.reject(refreshError);
          } finally {
            isRefreshing.current = false;
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [state.tokens.access, state.tokens.refresh, state.user]);

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const verifyToken = async () => {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      // Si no hay tokens válidos, marcar como no autenticado
      if (!accessToken || accessToken.trim() === '') {
        console.log('No access token found, user not authenticated');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return;
      }
      
      // Verificar el token de acceso
      if (accessToken && accessToken.trim() !== '') {
        try {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
          
          // Intentar obtener el perfil del usuario con timeout
          const response = await Promise.race([
            api.get('usuarios/profile/'),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 10000)
            )
          ]);
          
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: response.data.user,
              tokens: {
                access: accessToken,
                refresh: refreshToken
              },
            },
          });
        } catch (error) {
          console.log('Token verification failed:', error.response?.status || error.message);
          
          // Si es un error 401, intentar refrescar el token primero
          if (error.response?.status === 401 && refreshToken && refreshToken.trim() !== '') {
            try {
              console.log('Attempting to refresh token...');
              const refreshResponse = await Promise.race([
                api.post('usuarios/refresh/', {
                  refresh: refreshToken,
                }),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Timeout')), 10000)
                )
              ]);
              
              const { access } = refreshResponse.data;
              localStorage.setItem('access_token', access);
              
              // Intentar obtener el perfil nuevamente con el nuevo token
              const profileResponse = await api.get('usuarios/profile/');
              
              dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: {
                  user: profileResponse.data.user,
                  tokens: {
                    access: access,
                    refresh: refreshToken
                  },
                },
              });
            } catch (refreshError) {
              console.log('Token refresh failed, clearing invalid tokens...');
              // Si el refresh también falla, limpiar tokens inválidos
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              dispatch({ type: AUTH_ACTIONS.LOGOUT });
            }
          } else {
            // Para otros errores o si no hay refresh token, limpiar tokens
            console.log('No valid tokens found, clearing invalid tokens...');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
          }
        } finally {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } else {
        // No hay token, simplemente marcar como no autenticado
        console.log('No access token found, user not authenticated');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    verifyToken();
  }, []);

  // Función de login
  const login = async (username, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      
      const response = await api.post('usuarios/login/', {
        username,
        password,
      });

      const { user, tokens } = response.data;

      // Guardar tokens en localStorage
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, tokens },
      });

      return { success: true, tokens, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error en el login';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Función de logout
  const logout = async () => {
    try {
      if (state.tokens.refresh) {
        await api.post('usuarios/logout/', {
          refresh_token: state.tokens.refresh,
        });
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      navigate('/login');
    }
  };

  // Función para actualizar perfil
  const updateProfile = async (userData) => {
    try {
      const response = await api.put('usuarios/profile/', userData);
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.data.user,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar perfil';
      return { success: false, error: errorMessage };
    }
  };

  // Función para cambiar contraseña
  const changePassword = async (oldPassword, newPassword, newPasswordConfirm) => {
    try {
      await api.post('usuarios/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al cambiar contraseña';
      return { success: false, error: errorMessage };
    }
  };

  // Función para limpiar errores
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Log de debugging para ver el estado actual
  console.log('🔍 AuthContext - Estado actual:', {
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    user: state.user?.username,
    hasAccessToken: !!state.tokens.access,
    hasRefreshToken: !!state.tokens.refresh,
    accessTokenLength: state.tokens.access?.length || 0
  });

  const value = {
    ...state,
    login,
    logout,
    updateProfile,
    changePassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
