import type { LeaderboardBoard } from '#src/db/leaderboard/index.js';
import type { Language } from '#src/client/language.js';

// Board → language key maps shared by the standings tables (home, interact)
// and the leaderboard page.
export const boardLabelKey = {
    activity: 'leaderboardActivity',
    gambling: 'leaderboardGambling',
    combined: 'leaderboardCombined',
} as const satisfies Record<LeaderboardBoard, keyof Language>;

export const boardHintKey = {
    activity: 'leaderboardActivityHint',
    gambling: 'leaderboardGamblingHint',
    combined: 'leaderboardCombinedHint',
} as const satisfies Record<LeaderboardBoard, keyof Language>;
