import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

// Función auxiliar para decodificar JWT sin dependencias externas
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        const decoded = parseJwt(token);
        // Verificar si el token sigue siendo válido y no ha expirado
        if (decoded && decoded.exp * 1000 > Date.now()) {
          setUser(JSON.parse(storedUser));
        } else {
          // Token inválido o expirado, limpiar almacenamiento
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        // En caso de inconsistencia, aseguramos limpiar todo
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (e) {
      console.error('Failed to parse user or token from localStorage', e);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
    
    let role = String(userData.role || 'member').toLowerCase();
    if (role === '1') role = 'member';
    if (role === '2') role = 'coach';
    if (role === '3') role = 'admin';

    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'coach') {
      navigate('/coach');
    } else {
      navigate('/member');
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedData };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const role = user ? String(user.role || 'member').toLowerCase() : null;
  const parsedRole = role === '1' ? 'member' : role === '2' ? 'coach' : role === '3' ? 'admin' : role;

  return (
    <AuthContext.Provider value={{ user, role: parsedRole, login, logout, loading, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
