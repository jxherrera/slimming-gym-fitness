import React, { useState } from 'react';

/**
 * Componente OptimizedImage para optimizar la carga y renderizado de imágenes.
 * Admite formatos modernos (WebP/AVIF) mediante la etiqueta <picture>,
 * carga diferida (lazy loading) nativa, y muestra un placeholder o skeleton
 * mientras la imagen se está descargando.
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  fallbackExtension = 'jpg',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Si la imagen tiene una ruta que no requiere procesamiento dinámico (e.g. SVG, Base64 o URL absoluta)
  const isSpecialUrl = !src || src.startsWith('data:') || src.endsWith('.svg') || src.startsWith('http') || src.startsWith('https');

  if (isSpecialUrl) {
    return (
      <div 
        className={`optimized-image-wrapper ${isLoaded ? 'loaded' : 'loading'} ${className}`} 
        style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}
      >
        {!isLoaded && !hasError && (
          <div 
            className="optimized-image-skeleton" 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, #1e1e1e 25%, #2a2a2a 50%, #1e1e1e 75%)',
              backgroundSize: '200% 100%',
              animation: 'loading-skeleton 1.5s infinite',
            }}
          />
        )}
        <img
          src={src}
          alt={alt}
          loading={loading}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`optimized-image-element ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{
            transition: 'opacity 0.3s ease-in-out',
            display: 'block',
            width: '100%',
            height: 'auto',
          }}
          {...props}
        />
        <style>{`
          @keyframes loading-skeleton {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          .opacity-0 { opacity: 0; }
          .opacity-100 { opacity: 1; }
        `}</style>
      </div>
    );
  }

  // Generación de rutas locales optimizadas (WebP, AVIF)
  const srcWebp = `${src}.webp`;
  const srcAvif = `${src}.avif`;
  const srcFallback = `${src}.${fallbackExtension}`;

  return (
    <div 
      className={`optimized-image-wrapper ${isLoaded ? 'loaded' : 'loading'} ${className}`} 
      style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}
    >
      {!isLoaded && !hasError && (
        <div 
          className="optimized-image-skeleton" 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, #1e1e1e 25%, #2a2a2a 50%, #1e1e1e 75%)',
            backgroundSize: '200% 100%',
            animation: 'loading-skeleton 1.5s infinite',
          }}
        />
      )}
      
      <picture>
        <source srcSet={srcAvif} type="image/avif" />
        <source srcSet={srcWebp} type="image/webp" />
        <img
          src={srcFallback}
          alt={alt}
          loading={loading}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`optimized-image-element ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{
            transition: 'opacity 0.3s ease-in-out',
            display: 'block',
            width: '100%',
            height: 'auto',
          }}
          {...props}
        />
      </picture>
      
      <style>{`
        @keyframes loading-skeleton {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .opacity-0 { opacity: 0; }
        .opacity-100 { opacity: 1; }
      `}</style>
    </div>
  );
};

export default OptimizedImage;
