import type { Activity } from '#src/client/activities.js';
import { Year2028Card } from './Card.js';
import { text } from './text.js';

export const year2028Activity: Activity = {
    name: 'Miciaus dabartis',
    Card: Year2028Card,
    text,
};
