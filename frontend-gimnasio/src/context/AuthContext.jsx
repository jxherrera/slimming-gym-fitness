import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
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
    setUser(null);
    navigate('/login');
  };

  const role = user ? String(user.role || 'member').toLowerCase() : null;
  const parsedRole = role === '1' ? 'member' : role === '2' ? 'coach' : role === '3' ? 'admin' : role;

  return (
    <AuthContext.Provider value={{ user, role: parsedRole, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
