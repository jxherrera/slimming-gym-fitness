import api from './api';

export const memberService = {
  // Obtener todos los planes del gimnasio
  getPlans: async () => {
    const response = await api.get('/plans');
    return response.data;
  },

  // Obtener la suscripción actual de un usuario
  getSubscription: async (userId) => {
    const response = await api.get(`/users/${userId}/subscription`);
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
    
    const response = await api.post('/payments/upload', paymentData, config);
    return response.data;
  },

  // Verificar comprobante de pago (Aprobar / Rechazar)
  verifyPayment: async (paymentId, status, notes = '') => {
    console.log(`Verifying payment ${paymentId} with status ${status}. Admin notes: ${notes}`);
    if (status === 'A') {
      const response = await api.patch(`/payments/${paymentId}/approve`, { userId: 1 });
      return response.data;
    } else {
      const response = await api.patch(`/payments/${paymentId}/reject`, { userId: 1 });
      return response.data;
    }
  },

  // Obtener Ficha Deportiva PDF
  getMemberPdfReport: async (memberId) => {
    try {
      const response = await api.get(`/reports/member-pdf/${memberId}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.warn('API error fetching member PDF, generating local client PDF fallback', error);
      throw error;
    }
  },

  // Obtener entrenadores disponibles
  getCoaches: async () => {
    try {
      const response = await api.get('/coaches');
      return response.data;
    } catch (error) {
      console.warn('Error fetching coaches direct route, falling back to role query:', error);
      const response = await api.get('/users/role/Coach');
      return response.data;
    }
  },

  // Asignar o solicitar Entrenador
  assignCoach: async (coachId, memberId, userInitiated = false) => {
    const response = await api.post(`/coaches/${coachId}/assign`, { MemberID: memberId, userInitiated });
    return response.data;
  },

  // Actualizar perfil de usuario
  updateProfile: async (userId, userData) => {
    const response = await api.patch(`/users/${userId}`, userData);
    return response.data;
  },

  // Cambiar contraseña
  changePassword: async (userId, currentPassword, newPassword) => {
    const response = await api.patch(`/users/${userId}/password`, { currentPassword, newPassword });
    return response.data;
  }
};
