// Card (8).tsx

import type { ActivityProps } from '#src/client/activities.js';

export function SeventiesEightiesCard({}: ActivityProps) {
    return (
        <article
            class="card"
            style={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: 180,
                padding: 24,
                borderRadius: 14,
                color: '#4b2d49',
                background: 'linear-gradient(160deg, #ffd095, #e5a7a5)',
                border: '2px solid #b97883',
            }}
        >
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 13,
                    background:
                        'linear-gradient(90deg, #cc6985 0 25%, #e6a45e 25% 50%, #8a7db6 50% 75%, #ca6a76 75%)',
                }}
            />

            <span
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    right: 23,
                    top: 18,
                    fontSize: 72,
                }}
            >
                🪩
            </span>

            <h2
                style={{
                    position: 'relative',
                    margin: '81px 0 0',
                    fontFamily: 'Georgia, serif',
                    fontSize: 48,
                    fontWeight: 900,
                    letterSpacing: 2,
                }}
            >
                70/80
            </h2>
        </article>
    );
}
