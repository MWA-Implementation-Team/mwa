import { TranslateFn } from './language.js';
import type { User } from '#src/client/api/users.js';

// The logged-in user's own name never renders — it's the localized "you"
// instead. Comparing by name is safe because usernames are unique.
export function displayActor(username: string, viewer: User | null, t: TranslateFn): string {
    return viewer && username === viewer.username ? t('leaderboardYou') : username;
}
