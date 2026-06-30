import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DEFAULT_PROGRESS_HISTORY = [
  { date: '2026-01-15', weight: 82.5, bodyFat: 24.2, muscleMass: 33.1 },
  { date: '2026-02-15', weight: 80.8, bodyFat: 22.8, muscleMass: 33.8 },
  { date: '2026-03-15', weight: 79.1, bodyFat: 21.4, muscleMass: 34.5 },
  { date: '2026-04-15', weight: 77.9, bodyFat: 20.1, muscleMass: 35.0 },
  { date: '2026-05-15', weight: 76.4, bodyFat: 18.9, muscleMass: 35.6 },
  { date: '2026-06-15', weight: 75.2, bodyFat: 17.8, muscleMass: 36.2 }
];

const PROGRESS_KEY = 'member_progress_history';

export const progressService = {
  getProgressHistory: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE}/progress/user/${userId}`);
      if (response.data && response.data.success) {
        return response.data.history;
      }
    } catch (e) {
      // Fallback a almacenamiento local
    }
    const local = localStorage.getItem(`${PROGRESS_KEY}_${userId}`);
    return local ? JSON.parse(local) : DEFAULT_PROGRESS_HISTORY;
  },

  addProgressRecord: async (userId, record) => {
    try {
      await axios.post(`${API_BASE}/progress`, { userId, ...record });
    } catch (e) {
      // Fallback local
    }
    const current = await progressService.getProgressHistory(userId);
    const updated = [...current, { date: record.date || new Date().toISOString().split('T')[0], ...record }];
    localStorage.setItem(`${PROGRESS_KEY}_${userId}`, JSON.stringify(updated));
    return { success: true, message: 'Registro de progreso físico guardado.' };
  }
};
