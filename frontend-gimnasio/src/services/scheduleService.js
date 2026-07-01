import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const DEFAULT_CLASSES = [
  { id: 1, name: 'Spinning HIIT Extreme', day: 'Lunes', time: '07:00 - 08:00', instructor: 'Coach Carlos', capacity: 15, bookedCount: 9, category: 'Cardio' },
  { id: 2, name: 'Power Cross Training', day: 'Lunes', time: '18:00 - 19:30', instructor: 'Coach Maria', capacity: 20, bookedCount: 16, category: 'Fuerza' },
  { id: 3, name: 'Pilates & Core Balance', day: 'Martes', time: '08:30 - 09:30', instructor: 'Coach Ana', capacity: 12, bookedCount: 12, category: 'Flexibilidad' },
  { id: 4, name: 'Boxeo & Kickboxing', day: 'Martes', time: '19:00 - 20:30', instructor: 'Coach Carlos', capacity: 18, bookedCount: 11, category: 'Cardio' },
  { id: 5, name: 'Hipertrofia Pierna & Glúteo', day: 'Miércoles', time: '17:30 - 19:00', instructor: 'Coach Maria', capacity: 25, bookedCount: 20, category: 'Fuerza' },
  { id: 6, name: 'Yoga Vinyasa Flow', day: 'Jueves', time: '07:30 - 08:30', instructor: 'Coach Ana', capacity: 15, bookedCount: 8, category: 'Flexibilidad' },
  { id: 7, name: 'Crossfit WOD Challenge', day: 'Viernes', time: '18:00 - 19:30', instructor: 'Coach Carlos', capacity: 20, bookedCount: 19, category: 'Fuerza' },
  { id: 8, name: 'Zumba & Ritmos Latinos', day: 'Sábado', time: '10:00 - 11:30', instructor: 'Coach Ana', capacity: 30, bookedCount: 22, category: 'Cardio' }
];

const RESERVATIONS_KEY = 'member_class_reservations';

export const scheduleService = {
  getClasses: async () => {
    try {
      const response = await axios.get(`${API_BASE}/schedules`);
      return response.data.classes || response.data;
    } catch (e) {
      return DEFAULT_CLASSES;
    }
  },

  getUserReservations: (userId) => {
    const data = localStorage.getItem(`${RESERVATIONS_KEY}_${userId}`);
    return data ? JSON.parse(data) : [];
  },

  bookClass: async (classId, userId) => {
    try {
      await axios.post(`${API_BASE}/schedules/${classId}/book`, { userId });
    } catch (e) {
      // Fallback a almacenamiento local para garantizar persistencia en demo
    }
    const current = scheduleService.getUserReservations(userId);
    if (!current.includes(classId)) {
      const updated = [...current, classId];
      localStorage.setItem(`${RESERVATIONS_KEY}_${userId}`, JSON.stringify(updated));
    }
    return { success: true, message: 'Cupo reservado con éxito.' };
  },

  cancelBooking: async (classId, userId) => {
    try {
      await axios.delete(`${API_BASE}/schedules/${classId}/book/${userId}`);
    } catch (e) {
      // Fallback local
    }
    const current = scheduleService.getUserReservations(userId);
    const updated = current.filter(id => id !== classId);
    localStorage.setItem(`${RESERVATIONS_KEY}_${userId}`, JSON.stringify(updated));
    return { success: true, message: 'Reserva cancelada exitosamente.' };
  }
};
