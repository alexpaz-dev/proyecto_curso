import type { IceLevel } from '../types/IceScore';
import type { TaskStatus } from '../types/Task';

export const HIGH_ICE_THRESHOLD = 10;

// getIceLevel devuelve el nivel de una puntuacion ICE segun el umbral y el estado de la tarea.
export function getIceLevel(score: number, status: TaskStatus): IceLevel {
  if (status === 'completed') {
    return 'completed';
  }

  return score >= HIGH_ICE_THRESHOLD ? 'high' : 'medium';
}
