import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';

// Typed-entry pane under the QR — your 5-letter "sąveikos kodas" plus a field
// for a friend's code; Enter submits the GET form and lands on their page.
export default function InteractCodePane() {
    const { t, qr } = useContext(ClientContext);
    if (!qr) return null;

    return (
        <section class="landing-section landing-pane-extra landing-pane-code">
            <h2>{t('interactCodeTitle')}</h2>
            <div class="landing-code">
                <p class="landing-code-label">{t('interactCodeYours')}</p>
                <p class="landing-code-own">{qr.code}</p>
                <form method="GET" action="/app/interact" class="landing-code-form">
                    <input
                        type="text"
                        name="code"
                        placeholder={t('interactCodeInput')}
                        aria-label={t('interactCodeInput')}
                        maxLength={5}
                        autoComplete="off"
                        required
                    />
                </form>
                <form method="POST" action="/app/you/reset-code">
                    <button type="submit" class="lang-link">
                        {t('interactCodeReset')}
                    </button>
                </form>
            </div>
        </section>
    );
}
