import { cookieThemeOverride } from '#src/client/constants.js';
import { SunMoonIcon } from './icons.js';

export default function ThemeToggle() {
    function click() {
        let currentTheme = document.body.style.colorScheme;
        if (!currentTheme) {
            currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';
        }

        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.cookie = `${cookieThemeOverride}=${newTheme}; path=/; SameSite=Lax`;
        document.body.style.colorScheme = newTheme;
    }

    return (
        <button onClick={click}>
            <SunMoonIcon />
        </button>
    );
}
