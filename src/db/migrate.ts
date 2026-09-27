import { database } from '#src/state.js';
import { readdirSync, readFileSync } from 'fs';
import path from 'path';

export function migrateDatabase() {
    database.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS migration_status (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        current_version INTEGER NOT NULL
    );
    `);

    const getCurrentQuery = database.prepare(`
    SELECT current_version FROM migration_status
    `);
    const value = getCurrentQuery.get();
    let currentVersion = (value?.current_version as number) ?? -1;

    const dir = 'migrations';
    const migrations = readdirSync(dir)
        .map((file) => [Number(file.split('_')[0]), file] satisfies [number, string])
        .sort(([a], [b]) => a - b);

    console.log('migrations', JSON.stringify(migrations));
    for (const [ver, file] of migrations) {
        if (currentVersion >= ver) {
            continue;
        }

        const sql = readFileSync(path.join(dir, file), 'utf8');
        database.exec('BEGIN');
        try {
            database.exec(sql);
            database
                .prepare(
                    `
            INSERT INTO migration_status (id, current_version)
            VALUES (1, ?)
            ON CONFLICT(id) DO UPDATE
            SET current_version = excluded.current_version;
            `,
                )
                .run(ver);
            database.exec('COMMIT');
        } catch (err) {
            database.exec('ROLLBACK');
            throw err;
        }
        console.log(`[migrate] applied ${file}`);
    }
}
