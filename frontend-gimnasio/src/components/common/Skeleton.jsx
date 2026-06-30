import React from 'react';
import './Skeleton.css';

const Skeleton = ({ variant = 'text', width, height, className = '', style = {} }) => {
  const customStyles = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style,
  };

  return (
    <div
      className={`skeleton-loader variant-${variant} ${className}`}
      style={customStyles}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
