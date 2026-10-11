import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Hono } from 'hono';
import { database } from '#src/state.js';
import { redeemLoginToken } from '#src/db/sessions.js';
import { createUser } from '#src/db/users.js';
import { setMailTransport } from '#src/mailer.js';
import { registerLoginRoutes } from './login.js';

const app = new Hono();
registerLoginRoutes(app);

let sent: { to: string; url: string; code: string }[] = [];
setMailTransport((to, url, code) => {
    sent.push({ to, url, code });
});

function postLogin(fields: Record<string, string>, query = '') {
    return app.request(`/login${query}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email: 'login@example.com', ...fields }).toString(),
    });
}

describe('POST /login — registered email', () => {
    it('sends a login link + code and says so', async () => {
        createUser('login@example.com', 'login_user');
        sent = [];
        const res = await postLogin({});
        assert.equal(res.status, 200);
        assert.match(await res.text(), /sent a login link/);
        assert.equal(sent.length, 1);
        assert.equal(sent[0].to, 'login@example.com');
        assert.match(sent[0].url, /\/auth\/verify\?token=.+/);
        assert.match(sent[0].code, /^[A-Z2-9]{8}$/);
    });

    it('the response page carries a code input for manual entry', async () => {
        const res = await postLogin({});
        const html = await res.text();
        assert.match(html, /name="code"/);
        assert.match(html, /action="\/auth\/verify"/);
    });
});

describe('POST /login — unregistered email', () => {
    it('sends a signup link and says so', async () => {
        sent = [];
        const res = await postLogin({ email: 'newbie@example.com' });
        assert.match(await res.text(), /sent a signup link/);
        assert.equal(sent.length, 1);
        assert.equal(sent[0].to, 'newbie@example.com');
    });
});

describe('POST /login — validation and caps', () => {
    it('rejects a non-email', async () => {
        const res = await postLogin({ email: 'not-an-email' });
        assert.match(await res.text(), /valid email/);
    });

    it('caps resends — a second request within a minute sends nothing', async () => {
        createUser('cap@example.com', 'cap_user');
        sent = [];
        await postLogin({ email: 'cap@example.com' });
        await postLogin({ email: 'cap@example.com' });
        assert.equal(sent.length, 1);

        // Age the last send past the cooldown — a retry then sends again.
        database
            .prepare(
                `UPDATE login_tokens SET created_at = '2000-01-01T00:00:00.000Z' WHERE email = ?`,
            )
            .run('cap@example.com');
        await postLogin({ email: 'cap@example.com' });
        assert.equal(sent.length, 2);
    });

    it('forwards ?goto into the verify link', async () => {
        createUser('goto@example.com', 'goto_user');
        sent = [];
        await postLogin({ email: 'goto@example.com' }, '?goto=%2Fapp%2Fcasino');
        assert.match(sent[0].url, /goto=%2Fapp%2Fcasino/);
    });

    it('a failed send errors, keeps the old link alive, and does not arm the cap', async () => {
        createUser('smtpdown@example.com', 'smtpdown_user');
        sent = [];
        await postLogin({ email: 'smtpdown@example.com' });
        const firstToken = new URL(sent[0].url).searchParams.get('token')!;

        // Age the send past the cooldown so a second request tries to send.
        database
            .prepare(
                `UPDATE login_tokens SET created_at = '2000-01-01T00:00:00.000Z' WHERE email = ?`,
            )
            .run('smtpdown@example.com');

        setMailTransport(() => {
            throw new Error('smtp down');
        });
        const res = await postLogin({ email: 'smtpdown@example.com' });
        assert.match(await res.text(), /Could not send/);

        // The failed send discarded its row — the previous link still redeems.
        assert.equal(redeemLoginToken(firstToken), 'smtpdown@example.com');

        setMailTransport((to, url, code) => {
            sent.push({ to, url, code });
        });

        // And the discarded row left no trace for the resend cap — an
        // immediate retry sends again.
        sent = [];
        await postLogin({ email: 'smtpdown@example.com' });
        assert.equal(sent.length, 1);
    });
});
