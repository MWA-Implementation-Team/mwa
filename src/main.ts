import { isDevMode } from '#src/state.js';
import { syncActivities } from '#src/db/activities.js';
import { registerNodeModulesRoutes, writeErrorPage } from '#src/pages.js';
import { registerLoginRoutes } from '#src/routes/pages/login.js';
import { registerAuthRoutes } from '#src/routes/pages/auth.js';
import { registerAppRoutes } from '#src/routes/pages/app.js';
import { registerAdminRoutes } from '#src/routes/pages/admin.js';
import { registerLandingRoutes } from '#src/routes/pages/landing.js';
import { registerUsersRoutes } from '#src/routes/api/users.js';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { csrf } from 'hono/csrf';
import { HTTPException } from 'hono/http-exception';

const app = new Hono();

// SameSite=Lax already blocks cross-site cookie POSTs; this is the second layer.
// Intercepts form-encoded unsafe requests and 403s unless Sec-Fetch-Site or
// Origin proves same-origin — browsers always send one, curl users add -H
// 'Origin: http://localhost:3000' (or send JSON, which browsers can't cross-post).
app.use('*', csrf());

registerLandingRoutes(app);
registerLoginRoutes(app);
registerAuthRoutes(app);
registerAppRoutes(app);
registerAdminRoutes(app);
registerUsersRoutes(app);

registerNodeModulesRoutes(app);

if (isDevMode) {
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

// Insert the registry's activity slugs so queue/badge rows can foreign-key them
syncActivities();

const server = serve(
    {
        port: 3000,
        ...app,
    },
    (info) => {
        let msg = `Server running at http://localhost:${info.port}`;
        if (isDevMode) {
            msg += ' (dev mode)';
        }
        console.log(msg);
    },
);
process.on('SIGINT', () => server.close());
