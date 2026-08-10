import { useEffect } from 'react';

/**
 * Comportamiento compartido de los paneles deslizantes (drawers) en móvil:
 * mientras el panel está abierto bloquea el scroll del fondo y permite
 * cerrarlo con la tecla Escape.
 *
 * @param {boolean} isOpen  Si el panel está visible.
 * @param {() => void} onClose  Función que cierra el panel.
 */
export const useDrawer = (isOpen, onClose) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    document.body.classList.add('no-scroll');

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
};

export default useDrawer;
