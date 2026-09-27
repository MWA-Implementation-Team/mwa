import { database } from '#src/state.js';

export type QrCode = {
    id: number;
    user_id: number;
    code: string;
    expires_at: string;
    created_at: string;
};

database.exec(`
CREATE TABLE IF NOT EXISTS "qr" (
	"id" INTEGER NOT NULL,
	"user_id" INTEGER NOT NULL,
	"code" TEXT NOT NULL UNIQUE,
	"expires_at" TIMESTAMP NOT NULL,
	"created_at" TIMESTAMP NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
`);

const listQrCodesQuery = database.prepare(`SELECT * FROM qr ORDER BY id`);

export function listQrCodes(): QrCode[] {
    return listQrCodesQuery.all() as unknown as QrCode[];
}
