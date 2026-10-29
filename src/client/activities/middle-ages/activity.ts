import type { Activity } from '#src/client/activities.js';
import { MiddleAgesCard } from './Card.js';
import { MiddleAgesDetail } from './Detail.js';

export const middleAgesActivity: Activity = {
    name: 'Micius viduramžiuose',
    Card: MiddleAgesCard,
    Detail: MiddleAgesDetail,
};
