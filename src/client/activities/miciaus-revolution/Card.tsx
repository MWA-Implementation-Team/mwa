// Card (5).tsx

import type { ActivityProps } from '#src/client/activities.js';

export function MiciausRevolutionCard({}: ActivityProps) {
    return (
        <article
            class="card"
            style={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: 180,
                padding: 24,
                borderRadius: 14,
                color: '#fff1df',
                background: 'linear-gradient(125deg, #a34848, #7d353e)',
                border: '2px solid #662e35',
            }}
        >
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    left: -20,
                    top: 32,
                    width: 190,
                    height: 15,
                    background: '#e5b6a0',
                    opacity: 0.25,
                    transform: 'rotate(-24deg)',
                }}
            />

            <span
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    right: 22,
                    top: 5,
                    fontSize: 88,
                    color: '#f3bf8a',
                    opacity: 0.8,
                }}
            >
                ★
            </span>

            <h2
                style={{
                    position: 'relative',
                    margin: '79px 0 0',
                    maxWidth: 280,
                    fontFamily: 'Georgia, serif',
                    fontSize: 29,
                    lineHeight: 1.1,
                }}
            >
                Didžioji Miciaus revoliucija
            </h2>
        </article>
    );
}
