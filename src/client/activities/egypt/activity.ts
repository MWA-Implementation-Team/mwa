import type { Activity } from '#src/client/activities.js';
import { EgyptCard } from './Card.js';
import { EgyptDetail } from './Detail.js';

export const egyptActivity: Activity = {
    name: 'Egiptas',
    Card: EgyptCard,
    Detail: EgyptDetail,
};
