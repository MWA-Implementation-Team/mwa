import { ComponentType } from 'preact/compat';
import { cellsActivity } from '#src/client/activities/cells/activity.js';
import { stoneAgeActivity } from '#src/client/activities/stone-age/activity.js';
import { egyptActivity } from '#src/client/activities/egypt/activity.js';
import { middleAgesActivity } from '#src/client/activities/middle-ages/activity.js';
import { miciausRevolutionActivity } from '#src/client/activities/miciaus-revolution/activity.js';
import { worldWar1Activity } from '#src/client/activities/world-war-1/activity.js';
import { seventiesEightiesActivity } from '#src/client/activities/70s-80s/activity.js';
import { year2028Activity } from '#src/client/activities/year-2028/activity.js';
import { miciausParadiseActivity } from '#src/client/activities/miciaus-paradise/activity.js';

// Each activity is an irl station. Its key here — the slug — is its
// identity everywhere: the /app/activities/<slug> url, the activities
// table, and any queue/badge rows that reference it later.
// Keys also set the display order on the list page — avoid integer-like
// slugs ('2028'), which would sort to the front regardless of order here.
export const registeredActivities = {
    cells: cellsActivity,
    'stone-age': stoneAgeActivity,
    egypt: egyptActivity,
    'middle-ages': middleAgesActivity,
    'miciaus-revolution': miciausRevolutionActivity,
    'world-war-1': worldWar1Activity,
    '70s-80s': seventiesEightiesActivity,
    'year-2028': year2028Activity,
    'miciaus-paradise': miciausParadiseActivity,
} satisfies Record<string, Activity>;

export type ActivitySlug = keyof typeof registeredActivities;

// Standard props every activity component receives. Extend this when
// shared data lands (queue length, completions) — it applies to all
// activities at once. Must stay JSON-serializable (see pageProps rules
// in docs/guides/load-data-in-a-page.md).
export type ActivityProps = {
    slug: ActivitySlug;
};

export type Activity = {
    // Display name — used for the <title> and anywhere the app refers
    // to the station generically. Proper noun, not translated.
    name: string;
    // Rendered inside a link on the activities list page.
    Card: ComponentType<ActivityProps>;
    // Rendered below the header on /app/activities/<slug>. This is where
    // the station's unique decorations live.
    Detail: ComponentType<ActivityProps>;
};

export function isActivitySlug(value: string): value is ActivitySlug {
    // hasOwn, not `in`: `in` walks the prototype chain, so
    // /app/activities/toString would pass a plain-membership check
    return Object.hasOwn(registeredActivities, value);
}
