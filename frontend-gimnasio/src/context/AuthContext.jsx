import React, { createContext, useState, useEffect } from 'react';
import { authService, setAuthTokenHeader, parseJwt } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = authService.getStoredToken();
        const storedUser = authService.getStoredUser();

        if (storedToken && storedUser) {
          const decoded = parseJwt(storedToken);
          if (decoded && decoded.exp && decoded.exp * 1000 < Date.now()) {
            console.warn('Token JWT expirado.');
            authService.logout();
          } else {
            setToken(storedToken);
            setUser(storedUser);
            setAuthTokenHeader(storedToken);
          }
        }
      } catch (error) {
        console.error('Error al inicializar sesión:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      setUser(result.user);
      setToken(result.token);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    return await authService.register(formData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
