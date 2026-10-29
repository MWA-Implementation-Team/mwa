// Card (2).tsx

import type { ActivityProps } from '#src/client/activities.js';

export function WorldWar1Card({}: ActivityProps) {
    return (
        <article
            class="card"
            style={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: 180,
                padding: 24,
                borderRadius: 14,
                color: '#e6dfc4',
                background: '#454130',
                border: '2px solid #908971',
            }}
        >
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 8,
                    border: '1px solid #8c8974',
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
                    fontFamily: 'Georgia, serif',
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
                    fontFamily: 'Georgia, serif',
                    fontSize: 27,
                    lineHeight: 1.15,
                }}
            >
                Miciaus fronte nieko naujo
            </h2>
        </article>
    );
}
