import { DatabaseSync, StatementSync } from 'node:sqlite';
import { consoleMailer, createSmtpMailer, Mailer, noopMailer } from '#src/emails/mailer.js';
import { Context, Hono } from 'hono';
import { FEATURE_IDS, FeatureId, parseFeatures } from './features.js';
import { migrateDatabase } from './db/migrate.js';
import nodemailer from 'nodemailer';

export type MwaState = {
    isDevMode: boolean;
    db: DatabaseSync;
    mailer: Mailer;
    features: Set<FeatureId>;

    prepare(sql: string): StatementSync;
};

export type MwaContext = Context<{ Variables: MwaState }>;
export type MwaHono = Hono<{ Variables: MwaState }>;

export function setupHonoState(app: MwaHono, state: MwaState) {
    app.use('*', async (ctx, next) => {
        ctx.set('isDevMode', state.isDevMode);
        ctx.set('db', state.db);
        ctx.set('mailer', state.mailer);
        ctx.set('features', state.features);
        ctx.set('prepare', state.prepare);
        await next();
    });
}

export function smtpConfigFromEnv(env: NodeJS.ProcessEnv) {
    const host = env.MWA_SMTP_HOST;
    if (!host) {
        return null;
    }
    const user = env.MWA_SMTP_USER;
    return {
        host,
        port: Number(env.MWA_SMTP_PORT ?? 25),
        secure: env.MWA_SMTP_SECURE === 'true',
        // auth only when a user is configured — plain `auth: undefined` would
        // still create the key and change nodemailer's greeting
        ...(user ? { auth: { user, pass: env.MWA_SMTP_PASS ?? '' } } : {}),
    };
}

export function createDefaultMwaState(isDevMode: boolean): MwaState {
    const smtpConfig = smtpConfigFromEnv(process.env);
    const smtpClient = smtpConfig ? nodemailer.createTransport(smtpConfig) : null;
    const smtpFrom = process.env.MWA_MAIL_FROM ?? 'mwa@localhost';

    const mailer = smtpClient ? createSmtpMailer(smtpClient, smtpFrom) : consoleMailer;

    const db = createDatabase(process.env.MWA_DB_PATH ?? 'db.sqlite');

    return createMwaState({
        isDevMode,
        db,
        mailer,
        features: parseFeatures(process.env.MWA_FEATURES),
    });
}

export function createTestMwaState(init: { mailer?: Mailer; features?: Set<FeatureId> }): MwaState {
    return createMwaState({
        isDevMode: false,
        db: createDatabase(':memory:'),
        mailer: init.mailer ?? noopMailer,
        features: init.features ?? new Set(FEATURE_IDS),
    });
}

function createDatabase(path: string) {
    const db = new DatabaseSync(path);
    db.exec('PRAGMA foreign_keys = ON;');
    migrateDatabase(db);
    return db;
}

function createMwaState(init: {
    isDevMode: boolean;
    db: DatabaseSync;
    mailer: Mailer;
    features: Set<FeatureId>;
}): MwaState {
    const statements: Record<string, StatementSync> = {};
    return {
        isDevMode: init.isDevMode,
        db: init.db,
        mailer: init.mailer,
        features: init.features,

        prepare(sql) {
            const existing = statements[sql];
            if (existing) {
                return existing;
            }
            const statement = init.db.prepare(sql);
            statements[sql] = statement;
            return statement;
        },
    };
}
