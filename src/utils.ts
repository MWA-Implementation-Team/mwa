import { Context } from "hono";
import { defaultLanguage, LanguageCode } from "./client/language.js";
import { getCookie } from "hono/cookie";
import { cookieLanguage } from "./client/constants.js";

// Server side utilities that don't belong in any other file

export function getRequestLanguage(ctx: Context): LanguageCode {
    return (getCookie(ctx, cookieLanguage) as LanguageCode) ?? defaultLanguage; // not validated
}
