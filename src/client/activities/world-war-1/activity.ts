import type { Activity } from '#src/client/activities.js';
import { WorldWar1Card } from './Card.js';
import { WorldWar1Detail } from './Detail.js';

export const worldWar1Activity: Activity = {
    name: 'Pirmasis pasaulinis karas',
    Card: WorldWar1Card,
    Detail: WorldWar1Detail,
};
