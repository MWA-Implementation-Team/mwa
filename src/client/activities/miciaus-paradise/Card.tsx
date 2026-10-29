// Card (6).tsx

import type { ActivityProps } from '#src/client/activities.js';

export function MiciausParadiseCard({}: ActivityProps) {
    return (
        <article
            class="card miciaus-paradise"
            style={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: 180,
                padding: 24,
                borderRadius: 14,
                color: '#ffffff',
                backgroundImage: 'url("/img/activities/miciaus-paradise.webp")',
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                border: '3px solid #ffffff6d',
            }}
        >
            <span
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 8,
                    right: 20,
                    fontSize: 72,
                    color: '#ffffff',
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
                    fontSize: 34,
                    color: '#ffffff',
                }}
            >
                Miciaus rojus
            </h2>
        </article>
    );
}
