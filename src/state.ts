import { DatabaseSync } from 'node:sqlite';

// Global state for the server.

// In dev mode, sourcemaps and source code are returned to client
// Also, a reload watcher starts listening on the client for auto reload
export let isDevMode: boolean = process.argv[2] === '--dev';

export let database = new DatabaseSync('db.sqlite');

// SQLite leaves FK enforcement off by default; without this every
// FOREIGN KEY in the schema is decorative.
database.exec('PRAGMA foreign_keys = ON');

// Username the app pretends to be logged in as in dev mode.
// Must be a seeded user to simulate logged-in; a nonexistent
// name simulates logged-out.
export let fakeUsername: string = 'alice';
