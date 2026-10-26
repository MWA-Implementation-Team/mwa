import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import LanguageToggle from './LanguageToggle.js';

// Shared sidebar pane: language select plus session actions (logout when
// signed in).
export default function ActionsPane() {
    const { t, user } = useContext(ClientContext);

    return (
        <section class="landing-section landing-pane-lang">
            <h2>{t('actionsTitle')}</h2>
            <div class="landing-footer">
                <LanguageToggle />
                {user && (
                    <form method="POST" action="/app">
                        <button type="submit" class="mwa-wiki-danger">
                            {t('logOut')}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}
