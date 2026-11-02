import type { Activity } from '#src/client/activities.js';
import { CellsCard } from './Card.js';
import { text } from './text.js';

export const cellsActivity: Activity = {
    name: 'Miautohondrija',
    Card: CellsCard,
    text,
};
