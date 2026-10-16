import { DatabaseSync, StatementSync } from 'node:sqlite';
import { consoleMailer, createSmtpMailer, Mailer, noopMailer } from '#src/emails/mailer.js';
import { Context, Hono } from 'hono';
import { migrateDatabase } from './db/migrate.js';
import nodemailer from 'nodemailer';

export type MwaState = {
    isDevMode: boolean;
    db: DatabaseSync;
    mailer: Mailer;

    prepare(sql: string): StatementSync;
};

export type MwaContext = Context<{ Variables: MwaState }>;
export type MwaHono = Hono<{ Variables: MwaState }>;

export function setupHonoState(app: MwaHono, state: MwaState) {
    app.use('*', async (ctx, next) => {
        ctx.set('isDevMode', state.isDevMode);
        ctx.set('db', state.db);
        ctx.set('mailer', state.mailer);
        ctx.set('prepare', state.prepare);
        await next();
    });
}

export function createDefaultMwaState(isDevMode: boolean): MwaState {
    const smtpHost = process.env.MWA_SMTP_HOST;
    const smtpClient = smtpHost
        ? nodemailer.createTransport({
              host: smtpHost,
              port: Number(process.env.MWA_SMTP_PORT ?? 25),
              secure: process.env.MWA_SMTP_SECURE === 'true',
          })
        : null;
    const smtpFrom = process.env.MWA_MAIL_FROM ?? 'mwa@localhost';

    const mailer = smtpClient ? createSmtpMailer(smtpClient, smtpFrom) : consoleMailer;

    const db = createDatabase(process.env.MWA_DB_PATH ?? 'db.sqlite');

    return createMwaState({
        isDevMode,
        db,
        mailer,
    });
}

export function createTestMwaState(init: { mailer?: Mailer }): MwaState {
    return createMwaState({
        isDevMode: false,
        db: createDatabase(':memory:'),
        mailer: init.mailer ?? noopMailer,
    });
}

function createDatabase(path: string) {
    const db = new DatabaseSync(path);
    db.exec('PRAGMA foreign_keys = ON;');
    migrateDatabase(db);
    return db;
}

function createMwaState(init: { isDevMode: boolean; db: DatabaseSync; mailer: Mailer }): MwaState {
    const statements: Record<string, StatementSync> = {};
    return {
        isDevMode: init.isDevMode,
        db: init.db,
        mailer: init.mailer,

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
