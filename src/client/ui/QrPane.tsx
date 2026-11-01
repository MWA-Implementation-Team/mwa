import { useContext, useState } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';

// navigator.clipboard only exists in secure contexts (https / localhost); over
// plain http (e.g. opening the dev server by LAN IP) fall back to a selected
// textarea + execCommand.
async function copyText(text: string) {
    if (navigator.clipboard) return navigator.clipboard.writeText(text);
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
        if (!document.execCommand('copy')) throw new Error('copy failed');
    } finally {
        ta.remove();
    }
}

// Personal QR sidebar pane — the code plus a quiet copy-link control.
export default function QrPane() {
    const { t, qr } = useContext(ClientContext);
    const [copied, setCopied] = useState(false);
    if (!qr) return null;

    const handleCopy = async () => {
        try {
            await copyText(qr.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <section class="landing-section landing-pane-extra landing-pane-qr">
            <h2>{t('dashQrTitle')}</h2>
            <div class="landing-qr">
                <div class="qr-code" dangerouslySetInnerHTML={{ __html: qr.svg }} />
                <button type="button" class="lang-link" onClick={handleCopy}>
                    {copied ? t('qrCopied') : t('qrCopyLink')}
                </button>
            </div>
        </section>
    );
}
