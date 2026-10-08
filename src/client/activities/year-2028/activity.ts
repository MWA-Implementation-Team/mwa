import type { Activity } from '#src/client/activities.js';
import { Year2028Card } from './Card.js';
import { Year2028Detail } from './Detail.js';

export const year2028Activity: Activity = {
    name: '2028',
    Card: Year2028Card,
    Detail: Year2028Detail,
};
