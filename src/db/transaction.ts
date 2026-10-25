import { DatabaseSync } from 'node:sqlite';

export function runTransaction<T>(db: DatabaseSync, task: () => T): T {
    db.exec('BEGIN');
    try {
        const result = task();
        db.exec('COMMIT');
        return result;
    } catch (err) {
        db.exec('ROLLBACK');
        throw err;
    }
}
