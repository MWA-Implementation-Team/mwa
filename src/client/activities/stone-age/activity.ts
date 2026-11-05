import type { Activity } from '#src/client/activities.js';
import { StoneAgeCard } from './Card.js';
import { text } from './text.js';

export const stoneAgeActivity: Activity = {
    name: 'Urvinio Miciaus laikai',
    Card: StoneAgeCard,
    text,
};
