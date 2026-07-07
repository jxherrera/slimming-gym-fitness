import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const mapIsoToDb = (isoString) => {
  const date = new Date(isoString);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return { 
    dayOfWeek: days[date.getDay()], 
    time: date.toTimeString().substring(0, 5) 
  };
};

const mapDbToIso = (dayOfWeekStr, timeStr) => {
  if (!dayOfWeekStr || !timeStr) return new Date().toISOString();
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const targetDay = days.indexOf(dayOfWeekStr) !== -1 ? days.indexOf(dayOfWeekStr) : 1;
  const now = new Date();
  const distance = targetDay - now.getDay();
  const targetDate = new Date();
  targetDate.setDate(now.getDate() + distance);
  
  // timeStr can be "07:00:00" or a Date string from mssql
  if (typeof timeStr === 'string') {
      const parts = timeStr.includes('T') ? timeStr.split('T')[1].split(':') : timeStr.split(':');
      targetDate.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
  } else if (timeStr instanceof Date) {
      targetDate.setHours(timeStr.getUTCHours(), timeStr.getUTCMinutes(), 0, 0);
  }
  
  const offset = targetDate.getTimezoneOffset();
  return new Date(targetDate.getTime() - (offset * 60000)).toISOString().substring(0, 16);
};

export const scheduleService = {
  // --- CLASES GRUPALES ---
  getClasses: async () => {
    try {
      const response = await axios.get(`${API_BASE}/classes`);
      let classes = response.data.classes || response.data || [];
      return classes.map(c => {
        const startDate = new Date(c.StartTime);
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return {
          ...c,
          id: c.ClassID,
          name: c.ClassName,
          category: c.ClassName.split(' ')[0],
          day: days[startDate.getDay()],
          time: startDate.toTimeString().substring(0, 5),
          instructor: c.CoachName,
          capacity: c.MaxCapacity,
          bookedCount: c.CurrentEnrollment || 0
        };
      });
    } catch (e) {
      console.error('API error in getClasses', e);
      throw e;
    }
  },

  createClass: async (classData) => {
    try {
      const response = await axios.post(`${API_BASE}/classes`, classData);
      return response.data;
    } catch (e) {
      console.error('API error in createClass', e);
      return { success: false, message: e.response?.data?.message || 'Error al crear la clase' };
    }
  },

  updateClass: async (id, classData) => {
    try {
      const response = await axios.put(`${API_BASE}/classes/${id}`, classData);
      return response.data;
    } catch (e) {
      console.error('API error in updateClass', e);
      return { success: false, message: e.response?.data?.message || 'Error al actualizar la clase' };
    }
  },

  deleteClass: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/classes/${id}`);
      return response.data;
    } catch (e) {
      console.error('API error in deleteClass', e);
      return { success: false, message: e.response?.data?.message || 'Error al eliminar la clase' };
    }
  },

  // --- HORARIOS DE TRABAJO DE ENTRENADORES ---
  getCoachSchedules: async () => {
    try {
      const response = await axios.get(`${API_BASE}/coaches/schedules`);
      let schedules = response.data.schedules || response.data || [];
      schedules = schedules.map(s => ({
        ...s,
        startTime: mapDbToIso(s.dayOfWeek, s.startTime),
        endTime: mapDbToIso(s.dayOfWeek, s.endTime)
      }));
      return schedules;
    } catch (e) {
      console.error('API error in getCoachSchedules', e);
      throw e;
    }
  },

  createCoachSchedule: async (scheduleData) => {
    try {
      const dbDates = mapIsoToDb(scheduleData.startTime || scheduleData.StartTime);
      const dbDatesEnd = mapIsoToDb(scheduleData.endTime || scheduleData.EndTime);

      const payload = {
        ...scheduleData,
        dayOfWeek: dbDates.dayOfWeek,
        startTime: dbDates.time,
        endTime: dbDatesEnd.time
      };
      const response = await axios.post(`${API_BASE}/coaches/schedules`, payload);
      return response.data;
    } catch (e) {
      console.error('API error in createCoachSchedule', e);
      return { success: false, message: e.response?.data?.message || 'Error al asignar horario de trabajo' };
    }
  },

  updateCoachSchedule: async (id, scheduleData) => {
    try {
      const response = await axios.put(`${API_BASE}/coaches/schedules/${id}`, scheduleData);
      return response.data;
    } catch (e) {
      console.error('API error in updateCoachSchedule', e);
      return { success: false, message: e.response?.data?.message || 'Error al actualizar horario' };
    }
  },

  deleteCoachSchedule: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/coaches/schedules/${id}`);
      return response.data;
    } catch (e) {
      console.error('API error in deleteCoachSchedule', e);
      return { success: false, message: e.response?.data?.message || 'Error al eliminar horario' };
    }
  },

  // --- RESERVACIONES DE SOCIOS ---
  getUserReservations: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE}/classes/user/${userId}`);
      return response.data.reservations || [];
    } catch (e) {
      console.error('API error in getUserReservations', e);
      throw e;
    }
  },

  bookClass: async (classId, userId) => {
    try {
      const response = await axios.post(`${API_BASE}/classes/reserve`, { ClassID: classId, UserID: userId });
      return response.data;
    } catch (e) {
      console.error('API error in bookClass', e);
      return { success: false, message: e.response?.data?.message || 'Error al reservar clase' };
    }
  },

  cancelBooking: async (classId, userId) => {
    try {
      // Nota: Asumiendo que /cancel está implementado en classController
      const response = await axios.post(`${API_BASE}/classes/cancel`, { ClassID: classId, UserID: userId });
      return response.data;
    } catch (e) {
      console.error('API error in cancelBooking', e);
      return { success: false, message: e.response?.data?.message || 'Error al cancelar reserva' };
    }
  }
};
