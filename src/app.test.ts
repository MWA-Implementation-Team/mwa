import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createApp } from './app.js';
import { FeatureId } from './features.js';
import { createTestMwaState } from './state.js';

function appWith(...features: FeatureId[]) {
    return createApp(createTestMwaState({ features: new Set(features) }));
}

describe('feature gating', () => {
    it('landing-only mode serves / and 404s every gated group', async () => {
        const app = appWith('landing');
        assert.equal((await app.request('/')).status, 200);
        for (const path of ['/login', '/app', '/admin', '/api/users']) {
            assert.equal((await app.request(path)).status, 404, `${path} should 404`);
        }
    });

    it('all features on keeps today’s behaviour for anonymous visitors', async () => {
        const app = createApp(createTestMwaState({}));
        assert.equal((await app.request('/')).status, 200);
        assert.equal((await app.request('/login')).status, 200);
        assert.equal((await app.request('/app')).status, 303); // login redirect
        assert.equal((await app.request('/admin')).status, 303);
        assert.equal((await app.request('/api/users')).status, 401);
    });

    it('a partial set exposes only its groups', async () => {
        const app = appWith('landing', 'auth');
        assert.equal((await app.request('/')).status, 200);
        assert.equal((await app.request('/login')).status, 200);
        assert.equal((await app.request('/auth/verify')).status, 200); // route exists, bad token → login page
        assert.equal((await app.request('/app')).status, 404);
        assert.equal((await app.request('/admin')).status, 404);
        assert.equal((await app.request('/api/users')).status, 404);
    });

    it('gated 404s render the error page, not a bare response', async () => {
        const app = appWith('landing');
        const res = await app.request('/app');
        assert.equal(res.status, 404);
        assert.match(await res.text(), /id="ssr-data"/);
    });

    it('serializes the enabled features into #ssr-data', async () => {
        const res = await appWith('landing').request('/');
        assert.match(await res.text(), /"features":\["landing"\]/);
    });
});
