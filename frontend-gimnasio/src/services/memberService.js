import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const memberService = {
  // Obtener todos los planes del gimnasio
  getPlans: async () => {
    const response = await axios.get(`${API_BASE}/plans`);
    return response.data;
  },

  // Obtener la suscripción actual de un usuario
  getSubscription: async (userId) => {
    const response = await axios.get(`${API_BASE}/users/${userId}/subscription`);
    return response.data;
  },

  // Subir comprobante de pago
  uploadPayment: async (paymentData) => {
    const response = await axios.post(`${API_BASE}/payments/upload`, paymentData);
    return response.data;
  },

  // Obtener entrenadores disponibles
  getCoaches: async () => {
    try {
      const response = await axios.get(`${API_BASE}/coaches`);
      return response.data;
    } catch (e) {
      // Fallback a ruta por rol si /coaches no está habilitado directamente
      const response = await axios.get(`${API_BASE}/users/role/Coach`);
      return response.data;
    }
  },

  // Asignar o solicitar Entrenador
  assignCoach: async (coachId, memberId) => {
    const response = await axios.post(`${API_BASE}/coaches/${coachId}/assign`, { memberId });
    return response.data;
  },

  // Actualizar perfil de usuario
  updateProfile: async (userId, userData) => {
    const response = await axios.patch(`${API_BASE}/users/${userId}`, userData);
    return response.data;
  }
};
