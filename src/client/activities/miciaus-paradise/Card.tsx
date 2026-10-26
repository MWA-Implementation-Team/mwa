// Card (6).tsx

import type { ActivityProps } from '#src/client/activities.js';

export function MiciausParadiseCard({}: ActivityProps) {
    return (
        <article
            class="card"
            style={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: 180,
                padding: 24,
                borderRadius: 14,
                color: '#000000',
                background: 'linear-gradient(160deg, #ffd500, #e3ff55)',
                border: '2px solid #3a6b52',
            }}
        >
            <span
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 8,
                    right: 20,
                    fontSize: 72,
                    color: '#ebc576',
                    opacity: 0.8,
                }}
            >
                ☼
            </span>

            <span
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 36,
                    left: 27,
                    fontSize: 46,
                    opacity: 0.85,
                }}
            >
                🌴
            </span>

            <h2
                style={{
                    position: 'relative',
                    margin: '92px 0 0',
                    fontFamily: 'Georgia, serif',
                    fontSize: 34,
                    color: '#000000',
                }}
            >
                Miciaus rojus
            </h2>
        </article>
    );
}