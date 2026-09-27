import { cookieUsername } from './constants.js';

// Forces the auth cookie to the fake user; real logins get overwritten on next page load.
export function ensureFakeLogin(username: string): string {
    document.cookie = `${cookieUsername}=${username}; path=/`;
    return username;
}
