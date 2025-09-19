import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/services/api';

interface User {
  username: string;
  isAuthenticated: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedUser = localStorage.getItem('apsoluciones_user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Primero intentar con el backend de Django
      const response = await apiService.login(username, password);
      if (response && response.token) {
        const userData: User = {
          username: username,
          isAuthenticated: true
        };
        
        setUser(userData);
        localStorage.setItem('apsoluciones_user', JSON.stringify(userData));
        setIsLoading(false);
        return true;
      }
      
      // Si falla, usar credenciales hardcodeadas como fallback
      if (username === 'apsoluciones' && password === 'migel1457') {
        const userData: User = {
          username: 'apsoluciones',
          isAuthenticated: true
        };
        
        setUser(userData);
        localStorage.setItem('apsoluciones_user', JSON.stringify(userData));
        // Crear un token dummy para que funcione con la API
        localStorage.setItem('token', 'dummy-token-for-apsoluciones');
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Error en login:', error);
      
      // Fallback a credenciales hardcodeadas
      if (username === 'apsoluciones' && password === 'migel1457') {
        const userData: User = {
          username: 'apsoluciones',
          isAuthenticated: true
        };
        
        setUser(userData);
        localStorage.setItem('apsoluciones_user', JSON.stringify(userData));
        localStorage.setItem('token', 'dummy-token-for-apsoluciones');
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('apsoluciones_user');
    localStorage.removeItem('token');
    apiService.logout();
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};