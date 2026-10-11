import type { Activity } from '#src/client/activities.js';
import { CellsCard } from './Card.js';
import { CellsDetail } from './Detail.js';

export const cellsActivity: Activity = {
    name: 'Ląstelės',
    Card: CellsCard,
    Detail: CellsDetail,
};
