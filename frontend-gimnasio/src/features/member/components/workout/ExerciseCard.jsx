import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const ExerciseCard = ({ currentExercise, currentWeight, onWeightChange, onNext }) => {
  return (
    <div className="exercise-card-focus" key={currentExercise.name}>
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
          onChange={(e) => onWeightChange(e.target.value)}
        />
      </div>

      <button className="btn-giant-done" onClick={onNext}>
        <FaCheckCircle /> LISTO
      </button>
    </div>
  );
};

export default ExerciseCard;
