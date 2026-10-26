import { useContext } from 'preact/hooks';
import { LanguageCode, languages } from '#src/client/language.js';
import { ClientContext } from '#src/client/context.js';
import { cookieLanguage } from '#src/client/constants.js';

export default function LanguageToggle() {
    const { lang, updateLang, t } = useContext(ClientContext);

    function handleChange(newLang: string) {
        document.cookie = `${cookieLanguage}=${newLang}`;
        updateLang(newLang as LanguageCode);
    }

    return (
        <select
            class="lang-select"
            aria-label={t('landingLangTitle')}
            value={lang}
            onChange={(e) => handleChange((e.target as HTMLSelectElement).value)}
        >
            {Object.entries(languages).map(([code, { displayName }]) => (
                <option key={code} value={code}>
                    {displayName}
                </option>
            ))}
        </select>
    );
}
