// The seam between "we generated a login link" and "the user received it".
// When MWA_SMTP_HOST is set, mail goes out over real SMTP (mailpit in local
// docker, the production server later). Without it, the rendered email prints
// to the server console — the bare-metal dev login flow. Call sites never
// change.
//
// Templates are Preact components in src/emails/ — one file exports the HTML
// component and a text fallback sharing the same props. Both are always sent
// (multipart/alternative): HTML for clients that render it, text otherwise.

import nodemailer from 'nodemailer';
import { renderToString } from 'preact-render-to-string';
import { LoginEmail, loginSubject, loginText } from './emails/login.js';

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

const consoleTransport: Transport = (to, url, code) => {
    console.log(`[mailer] ${to} — ${loginSubject}\n${loginText({ url, code })}`);
};

const smtpTransport: Transport = async (to, url, code) => {
    const props = { url, code };
    await smtp!.sendMail({
        from,
        to,
        subject: loginSubject,
        text: loginText(props),
        html: '<!DOCTYPE html>' + renderToString(<LoginEmail {...props} />),
    });
};

let transport: Transport = smtp ? smtpTransport : consoleTransport;

export function sendLoginEmail(to: string, url: string, code: string) {
    return transport(to, url, code);
}

// Tests swap in a capture transport.
export function setMailTransport(next: Transport) {
    transport = next;
}
