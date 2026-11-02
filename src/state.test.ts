import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { smtpConfigFromEnv } from './state.js';

describe('smtpConfigFromEnv', () => {
    it('returns null without MWA_SMTP_HOST — console mailer path', () => {
        assert.equal(smtpConfigFromEnv({}), null);
    });

    it('defaults port and secure, and carries no auth key', () => {
        assert.deepEqual(smtpConfigFromEnv({ MWA_SMTP_HOST: 'mailpit' }), {
            host: 'mailpit',
            port: 25,
            secure: false,
        });
    });

    it('reads explicit port and secure', () => {
        const config = smtpConfigFromEnv({
            MWA_SMTP_HOST: 'smtp.example.com',
            MWA_SMTP_PORT: '465',
            MWA_SMTP_SECURE: 'true',
        });
        assert.equal(config?.port, 465);
        assert.equal(config?.secure, true);
    });

    it('adds auth when MWA_SMTP_USER is set', () => {
        const config = smtpConfigFromEnv({
            MWA_SMTP_HOST: 'smtp.example.com',
            MWA_SMTP_USER: 'mwa',
            MWA_SMTP_PASS: 's3cret',
        });
        assert.deepEqual(config?.auth, { user: 'mwa', pass: 's3cret' });
    });

    it('treats a missing password as empty rather than dropping auth', () => {
        const config = smtpConfigFromEnv({
            MWA_SMTP_HOST: 'smtp.example.com',
            MWA_SMTP_USER: 'mwa',
        });
        assert.deepEqual(config?.auth, { user: 'mwa', pass: '' });
    });
});
