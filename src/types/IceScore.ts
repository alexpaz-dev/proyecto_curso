export interface IceScore {
  impact: number;
  confidence: number;
  effort: number;
}

export type IceField = keyof IceScore;

// IceScoreDraft representa valores ICE que el usuario aun puede no haber indicado.
export type IceScoreDraft = Record<IceField, number | null>;

// IceLevel clasifica una puntuacion ICE segun su prioridad o si la tarea esta completada.
export type IceLevel = 'high' | 'medium' | 'completed';
