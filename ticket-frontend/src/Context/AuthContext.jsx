import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserInfo } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const data = await getUserInfo.getInfo();
          const userData = data?.data || data?.user || data;
          setUser(userData);
        } catch (error) {
          console.error('Error al recuperar perfil:', error);
          if (error.message === 'Sesión expirada' || error.message.includes('401')) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};