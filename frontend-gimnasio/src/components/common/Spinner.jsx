import React from 'react';
import './Spinner.css';

const Spinner = ({ size = 'medium', color = 'primary' }) => {
  return (
    <div className={`spinner-wrapper size-${size} color-${color}`} aria-label="Cargando">
      <div className="spinner-ring"></div>
    </div>
  );
};

export default Spinner;
