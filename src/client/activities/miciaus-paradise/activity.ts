import type { Activity } from '#src/client/activities.js';
import { MiciausParadiseCard } from './Card.js';
import { text } from './text.js';

export const miciausParadiseActivity: Activity = {
    name: 'Miciaus rojus',
    Card: MiciausParadiseCard,
    text,
};
