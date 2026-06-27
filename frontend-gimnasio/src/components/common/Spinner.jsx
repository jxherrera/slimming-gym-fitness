import React from 'react';
import './Spinner.css';

const Spinner = ({ size = 'md', text = '', fullPage = false }) => {
  const content = (
    <div className={`spinner-container ${fullPage ? 'full-page' : ''}`}>
      <div className={`spinner-ring spinner-${size}`}>
        <div className="spinner-core"></div>
      </div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );

  return content;
};

export default Spinner;
