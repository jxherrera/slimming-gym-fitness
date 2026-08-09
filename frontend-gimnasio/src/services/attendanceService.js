import api from './api';

/**
 * Control de ingreso al gimnasio.
 *
 * El backend responde con informacion util incluso en 403 y 404 (nombre del
 * socio, estado de la membresia y motivo del rechazo), asi que esos casos no se
 * tratan como fallos: se devuelve el cuerpo de la respuesta para mostrarlo.
 */
export const attendanceService = {
  /**
   * Valida y registra el ingreso de un socio por su numero de cedula.
   * @param {string} idNumber
   * @returns {Promise<{accessGranted: boolean, memberName?: string, status?: string, message: string}>}
   */
  registerAccess: async (idNumber) => {
    try {
      const { data } = await api.post('/attendance', { idNumber });
      return data;
    } catch (error) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  },

  /** Bitacora de ingresos del dia en curso. */
  getTodayAttendance: async () => {
    const { data } = await api.get('/attendance/today');
    return data.attendance || [];
  }
};

export default attendanceService;
