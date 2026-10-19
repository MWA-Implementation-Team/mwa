import { registerNodeModulesRoutes, writeErrorPage } from '#src/pages.js';
import { registerLoginRoutes } from '#src/routes/pages/login.js';
import { registerAuthRoutes } from '#src/routes/pages/auth.js';
import { registerAppRoutes } from '#src/routes/pages/app.js';
import { registerAdminRoutes } from '#src/routes/pages/admin.js';
import { registerLandingRoutes } from '#src/routes/pages/landing.js';
import { registerUsersRoutes } from '#src/routes/api/users.js';
import { registerGroupsRoutes } from '#src/routes/api/groups.js';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { csrf } from 'hono/csrf';
import { HTTPException } from 'hono/http-exception';
import { FeatureId } from './features.js';
import { MwaHono, MwaState, setupHonoState } from './state.js';

// Feature id → route group (SPEC-feature-gating.md). A gated group is never
// registered, so its routes fall through to notFound and look unbuilt.
const FEATURE_ROUTES = [
    ['landing', registerLandingRoutes],
    ['auth', registerLoginRoutes],
    ['auth', registerAuthRoutes],
    ['app', registerAppRoutes],
    ['admin', registerAdminRoutes],
    ['api', registerUsersRoutes],
    ['api', registerGroupsRoutes],
] satisfies [FeatureId, (app: MwaHono) => void][];

export function createApp(state: MwaState): MwaHono {
    const app: MwaHono = new Hono();
    setupHonoState(app, state);

    // SameSite=Lax already blocks cross-site cookie POSTs; this is the second layer.
    // Intercepts form-encoded unsafe requests and 403s unless Sec-Fetch-Site or
    // Origin proves same-origin — browsers always send one, curl users add -H
    // 'Origin: http://localhost:3000' (or send JSON, which browsers can't cross-post).
    app.use('*', csrf());

    for (const [feature, register] of FEATURE_ROUTES) {
        if (state.features.has(feature)) {
            register(app);
        }
    }

    registerNodeModulesRoutes(app);

    if (state.isDevMode) {
        app.use('/*', serveStatic({ root: './' }));
    } else {
        app.use('/client/*', async (c, next) => {
            if (c.req.path.endsWith('.js.map')) {
                // don't send sourcemaps in production
                return c.notFound();
            }
            await next();
        });
    }

    app.use('/*', serveStatic({ root: './static' }));
    app.use('/client/*', serveStatic({ root: './dist' }));

    app.notFound(async (ctx) => {
        return writeErrorPage(ctx, 404);
    });

    app.onError(async (error, ctx) => {
        // Middleware (e.g. csrf) throws HTTPException carrying its intended response —
        // don't flatten it into a 500.
        if (error instanceof HTTPException) {
            return error.getResponse();
        }
        console.error('Error during request', error);
        return writeErrorPage(ctx, 500);
    });

    return app;
}
