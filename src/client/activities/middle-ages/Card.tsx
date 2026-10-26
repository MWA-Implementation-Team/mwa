// Card (4).tsx

import type { ActivityProps } from '#src/client/activities.js';

export function MiddleAgesCard({}: ActivityProps) {
    return (
        <article
            class="card"
            style={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: 180,
                padding: 24,
                borderRadius: 14,
                color: '#f5e9cd',
                background: '#555555',
                border: '2px solid #b4916f',
            }}
        >
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 9,
                    border: '1px solid #3e3e3e',
                    opacity: 0.65,
                    pointerEvents: 'none',
                }}
            />

            <span
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    right: 28,
                    top: 17,
                    fontSize: 66,
                    color: '#e5cb94',
                    opacity: 0.85,
                }}
            >
                ⚜
            </span>

            <h2
                style={{
                    position: 'relative',
                    margin: '88px 0 0',
                    fontFamily: 'Georgia, serif',
                    fontSize: 34,
                }}
            >
                Viduramžiai
            </h2>
        </article>
    );
}
