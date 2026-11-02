import type { Activity } from '#src/client/activities.js';
import { MiciausRevolutionCard } from './Card.js';
import { text } from './text.js';

export const miciausRevolutionActivity: Activity = {
    name: 'Didžioji Miciaus revoliucija',
    Card: MiciausRevolutionCard,
    text,
};
