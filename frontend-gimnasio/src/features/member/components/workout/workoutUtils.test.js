import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getTodayInSpanish } from './workoutUtils';

describe('workoutUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "Lunes" when today is Monday', () => {
    // 1 de Enero de 2024 fue Lunes (meses en JS empiezan en 0)
    const date = new Date(2024, 0, 1);
    vi.setSystemTime(date);
    expect(getTodayInSpanish()).toBe('Lunes');
  });

  it('should return "Domingo" when today is Sunday', () => {
    // 7 de Enero de 2024 fue Domingo
    const date = new Date(2024, 0, 7);
    vi.setSystemTime(date);
    expect(getTodayInSpanish()).toBe('Domingo');
  });

  it('should return a valid day of the week with real time', () => {
    vi.useRealTimers();
    const daysMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const today = getTodayInSpanish();
    expect(daysMap).toContain(today);
  });
});
