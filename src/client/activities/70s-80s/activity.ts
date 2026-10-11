import type { Activity } from '#src/client/activities.js';
import { SeventiesEightiesCard } from './Card.js';
import { SeventiesEightiesDetail } from './Detail.js';

export const seventiesEightiesActivity: Activity = {
    name: '70/80',
    Card: SeventiesEightiesCard,
    Detail: SeventiesEightiesDetail,
};
