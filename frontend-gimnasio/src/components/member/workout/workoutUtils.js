export const getTodayInSpanish = () => {
  const daysMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return daysMap[new Date().getDay()];
};
