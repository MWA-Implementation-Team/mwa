// Email templates are Preact components — type-checked props, same model as
// the pages. Email HTML is constrained: table layout, inline styles only,
// no classes/flex (Outlook renders with Word's engine). The `text` export is
// the multipart/alternative fallback — clients that block HTML show it, and
// sending both scores better with spam filters. Keep the copy in sync.

export type LoginEmailProps = {
    url: string;
    code: string;
};

export const loginSubject = 'Your MWA sign-in link';

export function LoginEmail({ url, code }: LoginEmailProps) {
    return (
        <table
            role="presentation"
            width="100%"
            cellPadding="0"
            cellSpacing="0"
            style={{ background: '#f4f4f5', padding: '24px 0' }}
        >
            <tr>
                <td align="center">
                    <table
                        role="presentation"
                        width="480"
                        cellPadding="0"
                        cellSpacing="0"
                        style={{
                            background: '#ffffff',
                            borderRadius: '8px',
                            padding: '32px',
                            fontFamily: 'system-ui, sans-serif',
                            color: '#18181b',
                        }}
                    >
                        <tr>
                            <td style={{ fontSize: '18px', fontWeight: 600 }}>Sign in to MWA</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '16px 0' }}>
                                Click the button below to sign in. The link expires in 15 minutes.
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: '8px 0 16px' }}>
                                <a
                                    href={url}
                                    style={{
                                        display: 'inline-block',
                                        background: '#18181b',
                                        color: '#ffffff',
                                        padding: '12px 24px',
                                        borderRadius: '6px',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                    }}
                                >
                                    Sign in
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ paddingBottom: '8px', fontSize: '14px' }}>
                                Or enter this code on the login page:
                            </td>
                        </tr>
                        <tr>
                            <td
                                style={{
                                    fontFamily: 'monospace',
                                    fontSize: '22px',
                                    letterSpacing: '4px',
                                    padding: '8px 0 16px',
                                }}
                            >
                                {code}
                            </td>
                        </tr>
                        <tr>
                            <td
                                style={{
                                    fontSize: '12px',
                                    color: '#71717a',
                                    wordBreak: 'break-all',
                                }}
                            >
                                If the button doesn't work, paste this link into your browser: {url}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    );
}

export function loginText({ url, code }: LoginEmailProps) {
    return `Sign in: ${url}

Or enter this code on the login page: ${code}

The link and code expire in 15 minutes.`;
}
