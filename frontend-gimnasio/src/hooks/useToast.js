import { useContext } from 'react';
import { ToastContext, ToastAccionesContext } from '../context/ToastContext';

/**
 * Acceso a los avisos emergentes.
 *
 * Devuelve solo las acciones (success, error, warning, info...), cuya identidad
 * no cambia nunca. Eso permite ponerlo como dependencia de un useCallback o un
 * useEffect sin provocar ejecuciones en cadena: antes, al devolver tambien la
 * lista de avisos, mostrar uno cambiaba el contexto y disparaba de nuevo el
 * efecto que lo habia mostrado.
 */
export const useToast = () => {
  const context = useContext(ToastAccionesContext);
  if (!context) {
    throw new Error('useToast debe utilizarse dentro de un ToastProvider');
  }
  return context;
};

/**
 * Lista de avisos activos. La usa unicamente el componente que los dibuja; el
 * resto de la aplicacion no debe suscribirse a ella.
 */
export const useToastList = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastList debe utilizarse dentro de un ToastProvider');
  }
  return context;
};
