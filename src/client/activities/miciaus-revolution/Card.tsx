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
                color: '#a4ff2d',
                background: 'linear-gradient(125deg, #ff0000, #860000)',
                border: '2px solid #63000c',
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
                    background: '#8b2c00',
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
                    color: '#ff1616',
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
