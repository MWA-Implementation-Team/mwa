import type { Activity } from '#src/client/activities.js';
import { MiddleAgesCard } from './Card.js';
import { text } from './text.js';

export const middleAgesActivity: Activity = {
    name: 'Micius viduramžiuose',
    Card: MiddleAgesCard,
    text,
};
