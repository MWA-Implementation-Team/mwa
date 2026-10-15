import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Hono } from 'hono';
import { redeemLoginToken } from '#src/db/sessions.js';
import { createUser } from '#src/db/users.js';
import { registerLoginRoutes } from './login.js';
import { LoginEmailProps, Mailer } from '#src/emails/mailer.js';
import { createTestMwaState, MwaHono, setupHonoState } from '#src/state.js';

let isMailerDown = false;

const mailer: Mailer = {
    async sendLoginEmail(to, props) {
        if (isMailerDown) {
            throw new Error('smtp down');
        }
        sent.push({ to, props });
    },
};

const state = createTestMwaState({
    mailer,
});

const app: MwaHono = new Hono();
setupHonoState(app, state);

registerLoginRoutes(app);

let sent: { to: string; props: LoginEmailProps }[] = [];

function postLogin(fields: Record<string, string>, query = '') {
    return app.request(`/login${query}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email: 'login@example.com', ...fields }).toString(),
    });
}

describe('POST /login — registered email', () => {
    it('sends a login link + code and says so', async () => {
        createUser(state, 'login@example.com', 'login_user');
        sent = [];
        const res = await postLogin({});
        assert.equal(res.status, 200);
        assert.match(await res.text(), /sent a login link/);
        assert.equal(sent.length, 1);
        assert.equal(sent[0].to, 'login@example.com');
        assert.match(sent[0].props.url, /\/auth\/verify\?token=.+/);
        assert.match(sent[0].props.code, /^[A-Z2-9]{8}$/);
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
        createUser(state, 'cap@example.com', 'cap_user');
        sent = [];
        await postLogin({ email: 'cap@example.com' });
        await postLogin({ email: 'cap@example.com' });
        assert.equal(sent.length, 1);

        // Age the last send past the cooldown — a retry then sends again.
        state.db
            .prepare(
                `UPDATE login_tokens SET created_at = '2000-01-01T00:00:00.000Z' WHERE email = ?`,
            )
            .run('cap@example.com');
        await postLogin({ email: 'cap@example.com' });
        assert.equal(sent.length, 2);
    });

    it('forwards ?goto into the verify link', async () => {
        createUser(state, 'goto@example.com', 'goto_user');
        sent = [];
        await postLogin({ email: 'goto@example.com' }, '?goto=%2Fapp%2Fcasino');
        assert.match(sent[0].props.url, /goto=%2Fapp%2Fcasino/);
    });

    it('a failed send errors, keeps the old link alive, and does not arm the cap', async () => {
        createUser(state, 'smtpdown@example.com', 'smtpdown_user');
        sent = [];
        await postLogin({ email: 'smtpdown@example.com' });
        const firstToken = new URL(sent[0].props.url).searchParams.get('token')!;

        // Age the send past the cooldown so a second request tries to send.
        state.db
            .prepare(
                `UPDATE login_tokens SET created_at = '2000-01-01T00:00:00.000Z' WHERE email = ?`,
            )
            .run('smtpdown@example.com');

        isMailerDown = true;
        const res = await postLogin({ email: 'smtpdown@example.com' });
        assert.match(await res.text(), /Could not send/);

        // The failed send discarded its row — the previous link still redeems.
        assert.equal(redeemLoginToken(state, firstToken), 'smtpdown@example.com');
        isMailerDown = false;

        // And the discarded row left no trace for the resend cap — an
        // immediate retry sends again.
        sent = [];
        await postLogin({ email: 'smtpdown@example.com' });
        assert.equal(sent.length, 1);
    });
});
