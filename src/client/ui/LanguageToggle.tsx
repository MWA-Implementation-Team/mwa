import { Fragment } from 'preact';
import { useContext } from 'preact/hooks';
import { LanguageCode, languages } from '#src/client/language.js';
import { ClientContext } from '#src/client/context.js';
import { cookieLanguage } from '#src/client/constants.js';

export default function LanguageToggle() {
    const { lang, updateLang } = useContext(ClientContext);

    function handleChange(newLang: string) {
        document.cookie = `${cookieLanguage}=${newLang}`;
        updateLang(newLang as LanguageCode);
    }

    return (
        <span class="lang-links">
            {Object.keys(languages).map((code, i) => (
                <Fragment key={code}>
                    {i > 0 && <span class="lang-links-sep">·</span>}
                    <button
                        type="button"
                        class="lang-link"
                        aria-pressed={code === lang}
                        onClick={() => handleChange(code)}
                    >
                        {code.toUpperCase()}
                    </button>
                </Fragment>
            ))}
        </span>
    );
}
