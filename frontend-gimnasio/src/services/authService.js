import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'user_data';

// Decodificar payload de JWT sin librerías externas
export const parseJwt = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error al decodificar JWT token:', e);
    return null;
  }
};

// Verificar si el token JWT ha expirado
export const isTokenExpired = (token) => {
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return false; // Si no tiene exp, se considera vigente por sesión
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

// Configurar encabezado de autorización Axios de manera global
export const setAuthTokenHeader = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const authService = {
  // Iniciar Sesión
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, {
      Email: email,
      Password: password
    });

    const data = response.data;
    if (data.success) {
      const user = data.user;
      // Normalizar nombre de rol
      let role = (user?.role || 'member').toString().trim().toLowerCase();
      if (role === '1') role = 'member';
      if (role === '2') role = 'coach';
      if (role === '3') role = 'admin';
      user.role = role;

      // Si el backend entrega un token real, usaremos ese token. De lo contrario, estructuramos un JWT standard válido
      const token = data.token || authService.generateClientJwt(user);
      
      authService.saveSession(token, user);
      setAuthTokenHeader(token);
      return { user, token, message: data.message };
    }
    throw new Error(data.message || 'Error al iniciar sesión');
  },

  // Registrar Usuario
  register: async (formData) => {
    const response = await axios.post(`${API_URL}/register`, {
      ...formData,
      Email: formData.email,
      Password: formData.password
    });
    return response.data;
  },

  // Guardar Sesión
  saveSession: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    // Mantener compatibilidad previa con localStorage 'user'
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Obtener Token Guardado
  getStoredToken: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    if (isTokenExpired(token)) {
      authService.logout();
      return null;
    }
    return token;
  },

  // Obtener Usuario Guardado
  getStoredUser: () => {
    const userStr = localStorage.getItem(USER_KEY) || localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  },

  // Cerrar Sesión
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('user');
    setAuthTokenHeader(null);
  },

  // Utilidad de simulación de JWT estándar en caso de que el backend expida datos sin firma en dev
  generateClientJwt: (user) => {
    const header = window.btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = window.btoa(JSON.stringify({
      sub: user.userId || user.id,
      email: user.email,
      role: user.role,
      name: user.firstName,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
    }));
    const signature = window.btoa('slimming_gym_secret_signature');
    return `${header}.${payload}.${signature}`;
  }
};
