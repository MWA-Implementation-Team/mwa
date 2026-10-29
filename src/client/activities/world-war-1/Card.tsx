// Card (2).tsx

import type { ActivityProps } from '#src/client/activities.js';

export function WorldWar1Card({}: ActivityProps) {
    return (
        <article
            class="card world-war-1"
            style={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: 180,
                padding: 24,
                borderRadius: 14,
                color: '#dff3ea',
                backgroundImage: 'url("/img/activities/world-war-1.webp")',
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                border: '3px solid #ffffff6d',
            }}
        >
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 8,
                    border: '2px solid #8c8974',
                    opacity: 0.6,
                    pointerEvents: 'none',
                }}
            />

            <span
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 25,
                    left: 24,
                    fontSize: 15,
                    letterSpacing: 3,
                    opacity: 0.8,
                }}
            >
                1914 · 1918
            </span>

            <span
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    right: 24,
                    top: 15,
                    fontSize: 49,
                    opacity: 0.65,
                }}
            >
                ✦
            </span>

            <h2
                style={{
                    position: 'relative',
                    margin: '83px 0 0',
                    maxWidth: 290,
                    fontSize: 27,
                    lineHeight: 1.15,
                }}
            >
                Miciaus fronte nieko naujo
            </h2>
        </article>
    );
}
