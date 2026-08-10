import { useCallback, useSyncExternalStore } from 'react';

/**
 * Devuelve si una media query CSS se cumple, y se actualiza al rotar o
 * redimensionar. Sirve para adaptar en JavaScript lo que no se puede resolver
 * solo con CSS (por ejemplo la altura o el número de ejes de una gráfica).
 *
 * Usa useSyncExternalStore porque matchMedia es una fuente de datos externa:
 * así React lee siempre el valor vigente sin un setState dentro de un efecto.
 *
 * @param {string} query  Media query, p. ej. '(max-width: 768px)'.
 */
export const useMediaQuery = (query) => {
  const subscribe = useCallback(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};

      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener('change', onStoreChange);
      return () => mediaQueryList.removeEventListener('change', onStoreChange);
    },
    [query]
  );

  const getSnapshot = useCallback(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
    [query]
  );

  // En build de servidor no hay ventana: se asume escritorio.
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

/** Atajo para el breakpoint móvil del sistema (768px). */
export const useEsMovil = () => useMediaQuery('(max-width: 768px)');

export default useMediaQuery;
