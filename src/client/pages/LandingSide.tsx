import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import { FacebookIcon, InstagramIcon, TiktokIcon } from '#src/client/ui/icons.js';
import LanguageToggle from '#src/client/ui/LanguageToggle.js';

const socials = [
    {
        Icon: FacebookIcon,
        name: 'landingSocialEvent' as const,
        href: 'https://www.facebook.com/events/4498349217053329',
    },
    {
        Icon: InstagramIcon,
        name: 'Instagram',
        href: 'https://www.instagram.com/vumif.firstyearevent/',
    },
    { Icon: TiktokIcon, name: 'TikTok', href: 'https://www.tiktok.com/@vumif.firstyearevent' },
];

const sponsors = [
    { name: 'Eckes-Granini Baltic', href: 'https://www.eckes-granini.lt/' },
    { name: 'SKALVIJA', href: 'https://skalvija.lt/' },
    { name: 'EUREKA knygynas', href: 'https://knygynas.biz/' },
    { name: 'VERTICAL', href: 'https://www.vertical.lt/' },
    { name: 'ŠMC', href: 'https://cac.lt/' },
];

// The landing frame's sidebar — logo, login, socials, sponsors, language.
// Shared with the activity detail pages, which render in the same layout.
export function LandingSide() {
    const { t, user } = useContext(ClientContext);
    return (
        <>
            <section class="landing-section landing-pane-welcome">
                <div class="landing-welcome">
                    <a href="/" class="mwa-logo" aria-label={t('shellLogoAlt')}>
                        <img src="/logo.webp" alt={t('shellLogoAlt')} />
                    </a>
                </div>
            </section>

            <section class="landing-section landing-pane-login">
                <h2>{t('landingLoginTitle')}</h2>
                <div class="landing-footer">
                    {user ? (
                        <>
                            <a href="/app" class="mwa-button">
                                {t('landingGoApp')}
                            </a>
                            <form method="POST" action="/app" class="landing-login-form">
                                <button type="submit" class="mwa-button">
                                    {t('logOut')}
                                </button>
                            </form>
                        </>
                    ) : (
                        <a href="/login" class="mwa-button">
                            {t('landingLogin')}
                        </a>
                    )}
                </div>
            </section>

            <section class="landing-section landing-pane-socials">
                <h2>{t('landingSocialTitle')}</h2>
                <ul class="landing-socials">
                    {socials.map(({ Icon, name, href }) => (
                        <li key={name}>
                            <a href={href} target="_blank" rel="noopener noreferrer">
                                <Icon />{' '}
                                <span>{name === 'landingSocialEvent' ? t(name) : name}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </section>

            <section class="landing-section landing-pane-sponsors">
                <h2>{t('sponsorsTitle')}</h2>
                <ul class="landing-sponsors">
                    {sponsors.map(({ name, href }) => (
                        <li key={name}>
                            <a
                                href={href}
                                class="mwa-mini"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span class="mwa-mini-title">{name}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </section>

            <section class="landing-section landing-pane-lang">
                <h2>{t('landingLangTitle')}</h2>
                <div class="landing-footer">
                    <LanguageToggle />
                </div>
            </section>
        </>
    );
}
