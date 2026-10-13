import type { Activity } from '#src/client/activities.js';
import { MiciausParadiseCard } from './Card.js';
import { MiciausParadiseDetail } from './Detail.js';

export const miciausParadiseActivity: Activity = {
    name: 'Miciaus rojus',
    Card: MiciausParadiseCard,
    Detail: MiciausParadiseDetail,
};
