// The seam between "we generated a login link" and "the user received it".
// When MWA_SMTP_HOST is set, mail goes out over real SMTP (mailpit in local
// docker, the production server later). Without it, the rendered email prints
// to the server console — the bare-metal dev login flow. Call sites never
// change.
//
// Templates live in emails/*.txt — first line is `Subject: ...`, the rest is
// the body. {{name}} placeholders are filled from a vars object; unknown
// placeholders are left alone so a typo shows up in the output instead of
// silently dropping text. Files are read per send so copy edits are live in dev.

import { readFileSync } from 'node:fs';
import nodemailer from 'nodemailer';

type Transport = (to: string, url: string, code: string) => void | Promise<void>;

const smtpHost = process.env.MWA_SMTP_HOST;
const smtp = smtpHost
    ? nodemailer.createTransport({
          host: smtpHost,
          port: Number(process.env.MWA_SMTP_PORT ?? 25),
          secure: process.env.MWA_SMTP_SECURE === 'true',
      })
    : null;
const from = process.env.MWA_MAIL_FROM ?? 'mwa@localhost';

function renderTemplate(name: string, vars: Record<string, string>) {
    const rendered = readFileSync(`emails/${name}.txt`, 'utf8').replace(
        /\{\{\s*(\w+)\s*\}\}/g,
        (placeholder, key: string) => vars[key] ?? placeholder,
    );
    const newline = rendered.indexOf('\n');
    return {
        subject: rendered.slice(0, newline).replace(/^Subject:\s*/, ''),
        text: rendered.slice(newline + 1).trim(),
    };
}

const consoleTransport: Transport = (to, url, code) => {
    const { subject, text } = renderTemplate('login', { url, code });
    console.log(`[mailer] ${to} — ${subject}\n${text}`);
};

const smtpTransport: Transport = async (to, url, code) => {
    await smtp!.sendMail({ from, to, ...renderTemplate('login', { url, code }) });
};

let transport: Transport = smtp ? smtpTransport : consoleTransport;

export function sendLoginEmail(to: string, url: string, code: string) {
    return transport(to, url, code);
}

// Tests swap in a capture transport.
export function setMailTransport(next: Transport) {
    transport = next;
}
