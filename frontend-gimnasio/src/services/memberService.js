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

  // Obtener entrenadores disponibles.
  //
  // Usa /coaches/disponibles, la unica ruta que un socio puede consultar:
  // /coaches y /users/role/Coach exigen rol Admin o Coach, asi que desde el
  // perfil del socio ambas respondian 403 y el desplegable quedaba vacio.
  getCoaches: async () => {
    const response = await api.get('/coaches/disponibles');
    return response.data.coaches || [];
  },

  // Elegir el propio entrenador.
  //
  // Usa /coaches/mi-entrenador y no /coaches/:id/assign: esa ruta permite
  // asignar a cualquier socio y esta reservada al administrador, por lo que
  // desde el perfil respondia 403. El socio se identifica con su token, asi que
  // no hace falta enviar su id.
  assignCoach: async (coachId) => {
    const response = await api.post('/coaches/mi-entrenador', { coachId });
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
