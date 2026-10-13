import { ComponentChildren } from 'preact';
import { SVGProps } from 'preact/compat';

export type IconProps = SVGProps<SVGSVGElement>;

export function SunMoonIcon(props: IconProps) {
    return (
        // https://lucide.dev/icons/sun-moon
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <path d="M12 2v2" />
            <path d="M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715" />
            <path d="M16 12a4 4 0 0 0-4-4" />
            <path d="m19 5-1.256 1.256" />
            <path d="M20 12h2" />
        </svg>
    );
}

function strokeIcon(props: IconProps, children: ComponentChildren) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            {children}
        </svg>
    );
}

export function MenuIcon(props: IconProps) {
    // https://lucide.dev/icons/menu
    return strokeIcon(
        props,
        <>
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="18" y2="18" />
        </>,
    );
}

export function CloseIcon(props: IconProps) {
    // https://lucide.dev/icons/x
    return strokeIcon(
        props,
        <>
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </>,
    );
}

export function FacebookIcon(props: IconProps) {
    // https://lucide.dev/icons/facebook
    return strokeIcon(
        props,
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
    );
}

export function TwitterIcon(props: IconProps) {
    // https://lucide.dev/icons/twitter
    return strokeIcon(
        props,
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />,
    );
}

export function LinkedinIcon(props: IconProps) {
    // https://lucide.dev/icons/linkedin
    return strokeIcon(
        props,
        <>
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect width="4" height="12" x="2" y="9" />
            <circle cx="4" cy="4" r="2" />
        </>,
    );
}

export function InstagramIcon(props: IconProps) {
    // https://lucide.dev/icons/instagram
    return strokeIcon(
        props,
        <>
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </>,
    );
}
