import { writePage } from '#src/pages.js';
import { Hono } from 'hono';

export function registerHomeRoutes(app: Hono) {
    app.get('/', (ctx) => {
        return writePage(ctx, 'home', {});
    });
}
