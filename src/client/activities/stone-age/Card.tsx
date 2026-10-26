// Card (3).tsx

import type { ActivityProps } from '#src/client/activities.js';

export function StoneAgeCard({}: ActivityProps) {
    return (
        <article
            class="card"
            style={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: 180,
                padding: 24,
                borderRadius: 14,
                color: '#f0dbc8',
                background: 'linear-gradient(150deg, #7a4a30, #452616)',
                border: '2px solid #6b4530',
            }}
        >
            <span
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 13,
                    left: 22,
                    fontSize: 25,
                    letterSpacing: 7,
                    opacity: 0.5,
                }}
            >
                ∧ ∧ ∧
            </span>

            <span
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 18,
                    right: 24,
                    fontSize: 66,
                    transform: 'rotate(-12deg)',
                }}
            >
                🪨
            </span>

            <h2
                style={{
                    position: 'relative',
                    margin: '83px 0 0',
                    fontFamily: 'Georgia, serif',
                    fontSize: 33,
                    fontWeight: 800,
                }}
            >
                Akmens amžius
            </h2>
        </article>
    );
}
