import { writePage } from '#src/pages.js';
import { Hono } from 'hono';

export function registerLandingRoutes(app: Hono) {
    app.get('/', (ctx) => {
        return writePage(ctx, 'landing', {});
    });
}
