import { useContext, useState } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';

// Personal QR sidebar pane — the code plus a quiet copy-link control.
export default function QrPane() {
    const { t, qr } = useContext(ClientContext);
    const [copied, setCopied] = useState(false);
    if (!qr) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(qr.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <section class="landing-section landing-pane-extra">
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
