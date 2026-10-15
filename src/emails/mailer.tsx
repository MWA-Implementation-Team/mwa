import { Mail } from 'nodemailer';
import { renderToString } from 'preact-render-to-string';
import { LoginEmail, loginSubject, loginText } from './login.js';
import { LanguageCode } from '#src/client/language.js';

export type LoginEmailProps = {
    lang: LanguageCode;
    url: string;
    code: string;
};

export type Mailer = {
    sendLoginEmail(to: string, props: LoginEmailProps): Promise<void>;
}

export const consoleMailer: Mailer = {
    async sendLoginEmail(to, props) {
        console.log(`[console mailer] ${to} - ${loginSubject}\n${loginText(props)}`);
    },
}

export const noopMailer: Mailer = {
    async sendLoginEmail(_to, _props) {
    },
}

export function createSmtpMailer(smtpClient: Mail, smtpFrom: string): Mailer {
    return {
        sendLoginEmail: async (to, props) => {
            await smtpClient.sendMail({
                from: smtpFrom,
                to,
                subject: loginSubject,
                text: loginText(props),
                html: '<!DOCTYPE html>' + renderToString(<LoginEmail {...props} />),
            });
        },
    };
}

