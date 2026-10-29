import { TranslateFn } from './language.js';
import type { User } from '#src/client/api/users.js';

// Display rules for usernames: always render capitalized, and the
// logged-in user's own name never renders — it's the localized "you"
// instead. Comparing by name is safe because usernames are unique.
export function displayUsername(username: string): string {
    return username.charAt(0).toUpperCase() + username.slice(1);
}

export function displayActor(username: string, viewer: User | null, t: TranslateFn): string {
    return viewer && username === viewer.username ? t('leaderboardYou') : displayUsername(username);
}
