import { writePage } from '#src/pages.js';
import { MwaHono } from '#src/state.js';

export function registerLandingRoutes(app: MwaHono) {
    app.get('/', (ctx) => {
        return writePage(ctx, 'landing', {});
    });
}
