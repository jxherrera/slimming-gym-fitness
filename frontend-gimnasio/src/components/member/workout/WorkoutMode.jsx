import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useToast } from '../../../hooks/useToast';
import { workoutService } from '../../../services/workoutService';
import { getTodayInSpanish } from './workoutUtils';
import DaySelector from './DaySelector';
import ExerciseCard from './ExerciseCard';
import WorkoutSummary from './WorkoutSummary';
import './WorkoutMode.css';

const WorkoutMode = ({ routine, user, onClose }) => {
  const toast = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exercises, setExercises] = useState([]);
  const [allExercises, setAllExercises] = useState([]);
  const [completedList, setCompletedList] = useState([]);
  const [currentWeight, setCurrentWeight] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [daySelectionMode, setDaySelectionMode] = useState(false);
  const [availableDays, setAvailableDays] = useState([]);

  useEffect(() => {
    if (routine && routine.exercises) {
      setAllExercises(routine.exercises);
      
      const today = getTodayInSpanish();
      const daysInRoutine = [...new Set(routine.exercises.map(ex => ex.day).filter(Boolean))];
      setAvailableDays(daysInRoutine);

      const todayExercises = routine.exercises.filter(ex => 
        ex.day && ex.day.toLowerCase() === today.toLowerCase()
      );

      if (todayExercises.length > 0) {
        setExercises(todayExercises);
        setDaySelectionMode(false);
      } else {
        setDaySelectionMode(true);
      }
    }
  }, [routine]);

  const handleSelectDay = (day) => {
    const selectedDayExercises = allExercises.filter(ex => 
      ex.day && ex.day.toLowerCase() === day.toLowerCase()
    );
    setExercises(selectedDayExercises);
    setDaySelectionMode(false);
    resetWorkoutState();
  };

  const resetWorkoutState = () => {
    setCurrentIndex(0);
    setCompletedList([]);
    setIsFinished(false);
    setCurrentWeight('');
  };

  const handleNext = () => {
    const currentEx = exercises[currentIndex];
    const recordedExercise = {
      ...currentEx,
      weight: currentWeight || currentEx.weight || 0
    };

    const newCompletedList = [...completedList, recordedExercise];
    setCompletedList(newCompletedList);

    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentWeight('');
    } else {
      setIsFinished(true);
      saveWorkoutSession(newCompletedList);
    }
  };

  const saveWorkoutSession = async (finalList) => {
    setIsSaving(true);
    try {
      await workoutService.saveWorkout({
        userId: user?.userId || user?.id || user?.UserID,
        routineId: routine?.RoutineID || routine?.id,
        exercises: finalList
      });
      toast.success('¡Entrenamiento guardado con éxito! Gran trabajo hoy.');
    } catch (error) {
      toast.error('Hubo un problema guardando tu progreso, pero puedes cerrar esta ventana.');
    } finally {
      setIsSaving(false);
    }
  };

  if (daySelectionMode) {
    return (
      <DaySelector 
        onClose={onClose} 
        availableDays={availableDays} 
        onSelectDay={handleSelectDay} 
      />
    );
  }

  const currentExercise = exercises[currentIndex];
  if (!currentExercise && !isFinished) return null;
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
          <ExerciseCard 
            currentExercise={currentExercise}
            currentWeight={currentWeight}
            onWeightChange={setCurrentWeight}
            onNext={handleNext}
          />
        ) : (
          <WorkoutSummary 
            completedList={completedList}
            isSaving={isSaving}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};

export default WorkoutMode;
