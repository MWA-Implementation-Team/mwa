import { database } from '#src/state.js';

export type QrCode = {
    id: number;
    user_id: number;
    code: string;
    expires_at: string;
    created_at: string;
};

const listQrCodesQuery = database.prepare(`SELECT * FROM qr ORDER BY id`);

export function listQrCodes(): QrCode[] {
    return listQrCodesQuery.all() as unknown as QrCode[];
}
