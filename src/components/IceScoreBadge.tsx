import { Chip } from '@mui/material';

import { getIceLevel } from '../utils/getIceLevel';

import type { TaskStatus } from '../types/Task';
import type { ChipProps } from '@mui/material';

interface IceScoreBadgeProps {
  score: number | null;
  status?: TaskStatus;
}

// formatIceScore muestra la puntuacion ICE con una precision estable, o un guion si aun no existe.
function formatIceScore(score: number | null): string {
  return score === null ? 'ICE —' : `ICE ${score.toFixed(1)}`;
}

// getIceBadgeColor elige el color del tema segun el nivel ICE, o gris si la puntuacion aun no existe.
function getIceBadgeColor(
  score: number | null,
  status: TaskStatus,
): ChipProps['color'] {
  if (score === null) {
    return 'default';
  }

  switch (getIceLevel(score, status)) {
    case 'high':
      return 'success';
    case 'medium':
      return 'warning';
    case 'completed':
      return 'default';
  }
}

// IceScoreBadge muestra la puntuacion ICE calculada con el color de su nivel.
function IceScoreBadge({ score, status = 'pending' }: IceScoreBadgeProps) {
  return (
    <Chip
      color={getIceBadgeColor(score, status)}
      label={formatIceScore(score)}
      size="small"
      sx={{ fontWeight: 700 }}
    />
  );
}

export default IceScoreBadge;
