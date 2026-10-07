import type { Activity } from '#src/client/activities.js';
import { MiciausRevolutionCard } from './Card.js';
import { MiciausRevolutionDetail } from './Detail.js';

export const miciausRevolutionActivity: Activity = {
    name: 'Didžioji Miciaus revoliucija',
    Card: MiciausRevolutionCard,
    Detail: MiciausRevolutionDetail,
};
