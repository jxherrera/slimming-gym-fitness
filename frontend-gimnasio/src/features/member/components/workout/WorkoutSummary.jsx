import React from 'react';
import { FaTrophy, FaCheckCircle } from 'react-icons/fa';

const WorkoutSummary = ({ completedList, isSaving, onClose }) => {
  return (
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
  );
};

export default WorkoutSummary;
