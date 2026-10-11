// The seam between "we generated a login link" and "the user received it".
// When MWA_SMTP_HOST is set, mail goes out over real SMTP (mailpit in local
// docker, the production server later). Without it, the link prints to the
// server console — the bare-metal dev login flow. Call sites never change.

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

const consoleTransport: Transport = async (to, url, code) => {
    console.log(`[mailer] login link for ${to}: ${url}  (code: ${code})`);
};

const smtpTransport: Transport = async (to, url, code) => {
    await smtp!.sendMail({
        from,
        to,
        subject: 'Your MWA sign-in link',
        text: `Sign in: ${url}\n\nOr enter this code on the login page: ${code}\n\nThe link and code expire in 15 minutes.`,
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
