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

export function FormsIcon(props: IconProps) {
    return (
        // Simplified Google Forms mark — deep purple document with a folded corner
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <defs>
                <linearGradient id="forms-body" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#3a63c9" />
                    <stop offset="1" stop-color="#16285e" />
                </linearGradient>
            </defs>
            <path
                d="M6.8 1.2h9l4.5 4.5v15.5a1.8 1.8 0 0 1-1.8 1.8H6.8a1.8 1.8 0 0 1-1.8-1.8V3a1.8 1.8 0 0 1 1.8-1.8z"
                fill="url(#forms-body)"
            />
            <path d="M15.8 1.2v4.5h4.5z" fill="#6b93dd" />
            <g fill="#dbe4ff" opacity="0.45">
                <rect x="8.4" y="9" width="7.6" height="1.6" rx="0.8" />
                <rect x="8.4" y="12.6" width="7.6" height="1.6" rx="0.8" />
                <rect x="8.4" y="16.2" width="5" height="1.6" rx="0.8" />
                <rect x="8.4" y="19.4" width="6.2" height="1.6" rx="0.8" />
            </g>
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

export function PhoneIcon(props: IconProps) {
    // https://lucide.dev/icons/phone
    return strokeIcon(
        props,
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
    );
}

export function BookIcon(props: IconProps) {
    // https://lucide.dev/icons/book-open
    return strokeIcon(
        props,
        <>
            <path d="M12 7v14" />
            <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
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
