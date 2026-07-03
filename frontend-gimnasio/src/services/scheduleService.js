import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const DEFAULT_CLASSES = [
  { ClassID: 1, ClassName: 'Spinning HIIT Extreme', Description: 'Cardio de alta intensidad en bicicleta.', CoachID: 1, CoachName: 'Juan Pérez', MaxCapacity: 15, CurrentEnrollment: 9, StartTime: '2026-07-06T07:00:00', EndTime: '2026-07-06T08:00:00' },
  { ClassID: 2, ClassName: 'Power Cross Training', Description: 'Entrenamiento de fuerza funcional.', CoachID: 2, CoachName: 'María López', MaxCapacity: 20, CurrentEnrollment: 16, StartTime: '2026-07-06T18:00:00', EndTime: '2026-07-06T19:30:00' },
  { ClassID: 3, ClassName: 'Pilates & Core Balance', Description: 'Trabajo de core y flexibilidad.', CoachID: 1, CoachName: 'Juan Pérez', MaxCapacity: 12, CurrentEnrollment: 12, StartTime: '2026-07-07T08:30:00', EndTime: '2026-07-07T09:30:00' },
  { ClassID: 4, ClassName: 'Yoga Vinyasa Flow', Description: 'Fluidez y respiración consciente.', CoachID: 2, CoachName: 'María López', MaxCapacity: 15, CurrentEnrollment: 8, StartTime: '2026-07-09T07:30:00', EndTime: '2026-07-09T08:30:00' }
];

const DEFAULT_COACH_SCHEDULES = [
  { id: 1, coachId: 1, coachName: 'Juan Pérez', startTime: '2026-07-06T07:00:00', endTime: '2026-07-06T12:00:00', title: 'Turno Mañana - Juan' },
  { id: 2, coachId: 2, coachName: 'María López', startTime: '2026-07-06T14:00:00', endTime: '2026-07-06T20:00:00', title: 'Turno Tarde - María' },
  { id: 3, coachId: 1, coachName: 'Juan Pérez', startTime: '2026-07-07T07:00:00', endTime: '2026-07-07T12:00:00', title: 'Turno Mañana - Juan' },
  { id: 4, coachId: 2, coachName: 'María López', startTime: '2026-07-07T14:00:00', endTime: '2026-07-07T20:00:00', title: 'Turno Tarde - María' }
];

const RESERVATIONS_KEY = 'member_class_reservations';
const CLASSES_LOCAL_KEY = 'admin_local_classes';
const SCHEDULES_LOCAL_KEY = 'admin_coach_schedules';

export const scheduleService = {
  // --- CLASES GRUPALES ---
  getClasses: async () => {
    try {
      const response = await axios.get(`${API_BASE}/classes`);
      return response.data.classes || response.data || DEFAULT_CLASSES;
    } catch (e) {
      console.warn('API error in getClasses, using fallback', e);
      const local = localStorage.getItem(CLASSES_LOCAL_KEY);
      if (!local) {
        localStorage.setItem(CLASSES_LOCAL_KEY, JSON.stringify(DEFAULT_CLASSES));
        return DEFAULT_CLASSES;
      }
      return JSON.parse(local);
    }
  },

  createClass: async (classData) => {
    try {
      const response = await axios.post(`${API_BASE}/classes`, classData);
      return response.data;
    } catch (e) {
      console.warn('API error in createClass, storing locally', e);
      const local = localStorage.getItem(CLASSES_LOCAL_KEY);
      const classes = local ? JSON.parse(local) : DEFAULT_CLASSES;
      const newClass = {
        ClassID: Date.now(),
        ClassName: classData.ClassName || classData.className,
        Description: classData.Description || classData.description,
        CoachID: Number(classData.CoachID || classData.coachId),
        CoachName: classData.CoachName || 'Entrenador Asignado',
        MaxCapacity: Number(classData.MaxCapacity || classData.maxCapacity || 20),
        CurrentEnrollment: 0,
        StartTime: classData.StartTime || classData.startTime,
        EndTime: classData.EndTime || classData.endTime
      };
      const updated = [...classes, newClass];
      localStorage.setItem(CLASSES_LOCAL_KEY, JSON.stringify(updated));
      return { success: true, message: 'Clase creada exitosamente (Local).', class: newClass };
    }
  },

  updateClass: async (id, classData) => {
    try {
      const response = await axios.put(`${API_BASE}/classes/${id}`, classData);
      return response.data;
    } catch (e) {
      console.warn('API error in updateClass, updating locally', e);
      const local = localStorage.getItem(CLASSES_LOCAL_KEY);
      const classes = local ? JSON.parse(local) : DEFAULT_CLASSES;
      const updated = classes.map(c => {
        if (Number(c.ClassID) === Number(id)) {
          return {
            ...c,
            ClassName: classData.ClassName || classData.className || c.ClassName,
            Description: classData.Description || classData.description || c.Description,
            CoachID: Number(classData.CoachID || classData.coachId || c.CoachID),
            MaxCapacity: Number(classData.MaxCapacity || classData.maxCapacity || c.MaxCapacity),
            StartTime: classData.StartTime || classData.startTime || c.StartTime,
            EndTime: classData.EndTime || classData.endTime || c.EndTime
          };
        }
        return c;
      });
      localStorage.setItem(CLASSES_LOCAL_KEY, JSON.stringify(updated));
      return { success: true, message: 'Clase actualizada con éxito (Local).' };
    }
  },

  deleteClass: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/classes/${id}`);
      return response.data;
    } catch (e) {
      console.warn('API error in deleteClass, deleting locally', e);
      const local = localStorage.getItem(CLASSES_LOCAL_KEY);
      const classes = local ? JSON.parse(local) : DEFAULT_CLASSES;
      const updated = classes.filter(c => Number(c.ClassID) !== Number(id));
      localStorage.setItem(CLASSES_LOCAL_KEY, JSON.stringify(updated));
      return { success: true, message: 'Clase eliminada con éxito (Local).' };
    }
  },

  // --- HORARIOS DE TRABAJO DE ENTRENADORES ---
  getCoachSchedules: async () => {
    try {
      const response = await axios.get(`${API_BASE}/coaches/schedules`);
      return response.data.schedules || response.data || DEFAULT_COACH_SCHEDULES;
    } catch (e) {
      console.warn('API error in getCoachSchedules, using fallback', e);
      const local = localStorage.getItem(SCHEDULES_LOCAL_KEY);
      if (!local) {
        localStorage.setItem(SCHEDULES_LOCAL_KEY, JSON.stringify(DEFAULT_COACH_SCHEDULES));
        return DEFAULT_COACH_SCHEDULES;
      }
      return JSON.parse(local);
    }
  },

  createCoachSchedule: async (scheduleData) => {
    try {
      const response = await axios.post(`${API_BASE}/coaches/schedules`, scheduleData);
      return response.data;
    } catch (e) {
      console.warn('API error in createCoachSchedule, storing locally', e);
      const local = localStorage.getItem(SCHEDULES_LOCAL_KEY);
      const schedules = local ? JSON.parse(local) : DEFAULT_COACH_SCHEDULES;
      const newSchedule = {
        id: Date.now(),
        coachId: Number(scheduleData.coachId || scheduleData.CoachID),
        coachName: scheduleData.coachName || 'Entrenador',
        startTime: scheduleData.startTime || scheduleData.StartTime,
        endTime: scheduleData.endTime || scheduleData.EndTime,
        title: scheduleData.title || `Horario - ${scheduleData.coachName}`
      };
      const updated = [...schedules, newSchedule];
      localStorage.setItem(SCHEDULES_LOCAL_KEY, JSON.stringify(updated));
      return { success: true, message: 'Horario de trabajo asignado (Local).', schedule: newSchedule };
    }
  },

  updateCoachSchedule: async (id, scheduleData) => {
    try {
      const response = await axios.put(`${API_BASE}/coaches/schedules/${id}`, scheduleData);
      return response.data;
    } catch (e) {
      console.warn('API error in updateCoachSchedule, updating locally', e);
      const local = localStorage.getItem(SCHEDULES_LOCAL_KEY);
      const schedules = local ? JSON.parse(local) : DEFAULT_COACH_SCHEDULES;
      const updated = schedules.map(s => {
        if (Number(s.id) === Number(id)) {
          return {
            ...s,
            coachId: Number(scheduleData.coachId || scheduleData.CoachID || s.coachId),
            startTime: scheduleData.startTime || scheduleData.StartTime || s.startTime,
            endTime: scheduleData.endTime || scheduleData.EndTime || s.endTime,
            title: scheduleData.title || s.title
          };
        }
        return s;
      });
      localStorage.setItem(SCHEDULES_LOCAL_KEY, JSON.stringify(updated));
      return { success: true, message: 'Horario actualizado con éxito (Local).' };
    }
  },

  deleteCoachSchedule: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/coaches/schedules/${id}`);
      return response.data;
    } catch (e) {
      console.warn('API error in deleteCoachSchedule, deleting locally', e);
      const local = localStorage.getItem(SCHEDULES_LOCAL_KEY);
      const schedules = local ? JSON.parse(local) : DEFAULT_COACH_SCHEDULES;
      const updated = schedules.filter(s => Number(s.id) !== Number(id));
      localStorage.setItem(SCHEDULES_LOCAL_KEY, JSON.stringify(updated));
      return { success: true, message: 'Horario eliminado con éxito (Local).' };
    }
  },

  // --- RESERVACIONES DE SOCIOS ---
  getUserReservations: (userId) => {
    const data = localStorage.getItem(`${RESERVATIONS_KEY}_${userId}`);
    return data ? JSON.parse(data) : [];
  },

  bookClass: async (classId, userId) => {
    try {
      await axios.post(`${API_BASE}/classes/reserve`, { ClassID: classId, UserID: userId });
    } catch (e) {
      console.warn('API error in bookClass, using local reservation fallback', e);
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
      await axios.post(`${API_BASE}/classes/cancel`, { ClassID: classId, UserID: userId });
    } catch (e) {
      console.warn('API error in cancelBooking, using local reservation fallback', e);
    }
    const current = scheduleService.getUserReservations(userId);
    const updated = current.filter(id => id !== classId);
    localStorage.setItem(`${RESERVATIONS_KEY}_${userId}`, JSON.stringify(updated));
    return { success: true, message: 'Reserva cancelada exitosamente.' };
  }
};
