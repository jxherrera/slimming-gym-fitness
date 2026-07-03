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
    // Si paymentData es un FormData, axios configurará automáticamente Content-Type: multipart/form-data
    const isFormData = paymentData instanceof FormData;
    const config = isFormData ? {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    } : {};
    
    const response = await axios.post(`${API_BASE}/payments/upload`, paymentData, config);
    return response.data;
  },

  // Verificar comprobante de pago (Aprobar / Rechazar)
  verifyPayment: async (paymentId, status, notes = '') => {
    try {
      const response = await axios.put(`${API_BASE}/payments/${paymentId}/verify`, { status, notes });
      return response.data;
    } catch (e) {
      console.warn('API error in verifyPayment, using approve/reject fallbacks', e);
      // Fallback a los endpoints individuales si PUT /verify falla o no está implementado en el backend
      if (status === 'A') {
        const response = await axios.put(`${API_BASE}/payments/${paymentId}/approve`);
        return response.data;
      } else {
        const response = await axios.put(`${API_BASE}/payments/${paymentId}/reject`);
        return response.data;
      }
    }
  },

  // Obtener Ficha Deportiva PDF
  getMemberPdfReport: async (memberId) => {
    try {
      const response = await axios.get(`${API_BASE}/reports/member-pdf/${memberId}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (e) {
      console.warn('API error fetching member PDF, generating local client PDF fallback', e);
      // Retornar null o propagar para generar una descarga local desde la librería jsPDF
      throw e;
    }
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
