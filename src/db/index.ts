// Importing each module executes its CREATE TABLE statements.
// Import order doesn't matter — SQLite allows a FOREIGN KEY to
// reference a table that doesn't exist yet.
import '#src/db/users.js';
import '#src/db/transactions.js';
import '#src/db/activities.js';
import '#src/db/badges.js';
import '#src/db/qr.js';
