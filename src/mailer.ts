// The seam between "we generated a login link" and "the user received it".
// Today: print it to the server console — the dev login flow. Real SMTP
// (nodemailer + MWA_SMTP_* env vars) lands behind this same function later;
// call sites never change.

type Transport = (to: string, url: string, code: string) => void;

let transport: Transport = (to, url, code) => {
    console.log(`[mailer] login link for ${to}: ${url}  (code: ${code})`);
};

export function sendLoginEmail(to: string, url: string, code: string) {
    transport(to, url, code);
}

// Tests swap in a capture transport; production keeps the console default.
export function setMailTransport(next: Transport) {
    transport = next;
}
