import { Context } from 'hono';
import { defaultLanguage, LanguageCode } from './client/language.js';
import { getCookie } from 'hono/cookie';
import { cookieLanguage } from './client/constants.js';
import { randomBytes } from 'node:crypto';

// Server side utilities that don't belong in any other file

export function getRequestLanguage(ctx: Context): LanguageCode {
    return (getCookie(ctx, cookieLanguage) as LanguageCode) ?? defaultLanguage; // not validated
}

// [0, 1) like Math.random()
export function secureRandom(): number {
    return randomBytes(4).readUInt32BE(0) / (2 ** 32);
}

