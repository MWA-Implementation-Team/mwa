import { syncActivities } from '#src/db/activities.js';
import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { createDefaultMwaState } from './state.js';

const isDevMode: boolean = process.argv[2] === '--dev';
if (isDevMode) {
    try {
        process.loadEnvFile('.env');
    } catch {}
}

const state = createDefaultMwaState(isDevMode);

// Insert the registry's activity slugs so queue/badge rows can foreign-key them
syncActivities(state);

const server = serve(
    {
        port: 3000,
        ...createApp(state),
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
