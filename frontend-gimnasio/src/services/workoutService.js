import api from './api';

export const workoutService = {
  /**
   * Guarda el resumen del entrenamiento en la BD
   * @param {Object} data 
   */
  saveWorkout: async (data) => {
    try {
      const response = await api.post('/workouts/complete', data);
      return response.data;
    } catch (error) {
      console.error('Error guardando el entrenamiento:', error);
      throw error;
    }
  }
};
