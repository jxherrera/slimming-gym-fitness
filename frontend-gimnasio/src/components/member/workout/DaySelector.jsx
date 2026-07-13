import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { getTodayInSpanish } from './workoutUtils';

const DaySelector = ({ onClose, availableDays, onSelectDay }) => {
  return (
    <div className="workout-mode-overlay">
      <div className="workout-header">
        <h2>Seleccionar Día</h2>
        <button className="btn-close-workout" onClick={onClose} title="Salir del entrenamiento">
          <FaTimes />
        </button>
      </div>
      <div className="workout-content day-selector-content">
        <h3 className="day-selector-title">
          No tienes rutina asignada para hoy ({getTodayInSpanish()}).
        </h3>
        <p className="day-selector-subtitle">
          ¿Deseas reemplazarla por la rutina de otro día?
        </p>
        
        <div className="day-selector-buttons">
          {availableDays.length > 0 ? availableDays.map(day => (
            <button 
              key={day} 
              onClick={() => onSelectDay(day)}
              className="btn-select-day"
            >
              {day}
            </button>
          )) : (
            <p className="no-days-msg">Tu rutina no tiene días configurados.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DaySelector;
