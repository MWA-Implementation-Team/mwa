// Card (5).tsx

import type { ActivityProps } from '#src/client/activities.js';

export function MiciausRevolutionCard({}: ActivityProps) {
    return (
        <article
            class="card miciaus-revolution"
            style={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: 180,
                padding: 24,
                borderRadius: 14,
                color: '#f3ff47',
                backgroundImage: 'url("https://i.redd.it/mew5vf5yssd61.gif")',
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
                    fontSize: 29,
                    lineHeight: 1.1,
                    color: '#f3ff47',
                }}
            >
                Didžioji Miciaus revoliucija
            </h2>
        </article>
    );
}
