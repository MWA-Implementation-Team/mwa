import type { Activity } from '#src/client/activities.js';
import { StoneAgeCard } from './Card.js';
import { StoneAgeDetail } from './Detail.js';

export const stoneAgeActivity: Activity = {
    name: 'Akmens amžius',
    Card: StoneAgeCard,
    Detail: StoneAgeDetail,
};
