import React from 'react';
import './Skeleton.css';

const Skeleton = ({ type = 'text', width, height, borderRadius, count = 1, className = '' }) => {
  const elements = Array.from({ length: count });

  const style = {
    ...(width && { width }),
    ...(height && { height }),
    ...(borderRadius && { borderRadius })
  };

  return (
    <>
      {elements.map((_, index) => (
        <div 
          key={index} 
          className={`skeleton-loader skeleton-${type} ${className}`}
          style={style}
        />
      ))}
    </>
  );
};

export default Skeleton;
