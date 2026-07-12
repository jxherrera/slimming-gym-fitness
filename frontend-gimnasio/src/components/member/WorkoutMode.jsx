import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimes, FaTrophy, FaDumbbell } from 'react-icons/fa';
import { useToast } from '../../hooks/useToast';
import { workoutService } from '../../services/workoutService';
import './WorkoutMode.css';

const WorkoutMode = ({ routine, user, onClose }) => {
  const toast = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exercises, setExercises] = useState([]);
  const [completedList, setCompletedList] = useState([]);
  const [currentWeight, setCurrentWeight] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (routine && routine.exercises) {
      setExercises(routine.exercises);
    }
  }, [routine]);

  const handleNext = () => {
    const currentEx = exercises[currentIndex];

    const recordedExercise = {
      ...currentEx,
      weight: currentWeight || currentEx.weight || 0
    };

    setCompletedList(prev => [...prev, recordedExercise]);

    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentWeight(exercises[currentIndex + 1]?.weight || '');
    } else {
      setIsFinished(true);
      saveWorkoutSession([...completedList, recordedExercise]);
    }
  };

  const saveWorkoutSession = async (finalList) => {
    setIsSaving(true);
    try {
      await workoutService.saveWorkout({
        userId: user.UserID || user.id,
        routineId: routine.RoutineID || routine.id,
        exercises: finalList
      });
      toast.success('¡Entrenamiento guardado con éxito! Gran trabajo hoy.');
    } catch (error) {
      toast.error('Hubo un problema guardando tu progreso, pero puedes cerrar esta ventana.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentExercise = exercises[currentIndex];

  if (!currentExercise && !isFinished) {
    return null;
  }

  const progressPercentage = (currentIndex / exercises.length) * 100;

  return (
    <div className="workout-mode-overlay">
      <div className="workout-header">
        <h2>{isFinished ? '¡Entrenamiento Completado!' : 'Modo Enfoque'}</h2>
        <button className="btn-close-workout" onClick={onClose} title="Salir del entrenamiento">
          <FaTimes />
        </button>
      </div>

      {!isFinished && (
        <div className="workout-progress-bar">
          <div className="workout-progress-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      )}

      <div className="workout-content">
        {!isFinished ? (
          <div className="exercise-card-focus" key={currentIndex}> {/* forzar re-animación */}
            <h3 className="exercise-name-large">{currentExercise.name}</h3>

            <div className="exercise-metrics-large">
              <div className="metric-box">
                <span className="metric-value">{currentExercise.sets}</span>
                <span className="metric-label">Series</span>
              </div>
              <div className="metric-box">
                <span className="metric-value">{currentExercise.reps}</span>
                <span className="metric-label">Reps</span>
              </div>
            </div>

            <div className="weight-input-container">
              <label>Peso a levantar (kg):</label>
              <input
                type="number"
                className="weight-input-large"
                placeholder={currentExercise.weight || '0'}
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
              />
            </div>

            <button className="btn-giant-done" onClick={handleNext}>
              <FaCheckCircle /> LISTO
            </button>
          </div>
        ) : (
          <div className="summary-panel">
            <h2 className="summary-title"><FaTrophy /> ¡Día Terminado!</h2>
            <p className="summary-subtitle">
              {isSaving ? 'Registrando tu progreso en la base de datos...' : 'Aquí tienes el resumen de tu sesión.'}
            </p>

            <ul className="summary-list">
              {completedList.map((ex, idx) => (
                <li className="summary-item" key={idx}>
                  <FaCheckCircle className="check-icon-green" />
                  <div className="summary-item-details">
                    <h4>{ex.name}</h4>
                    <p>{ex.sets} series x {ex.reps} reps | {ex.weight ? `${ex.weight} kg` : 'Sin peso'}</p>
                  </div>
                </li>
              ))}
            </ul>

            <button className="btn-finish-workout" onClick={onClose} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Volver al Perfil'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutMode;
