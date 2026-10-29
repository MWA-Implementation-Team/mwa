// Card.tsx

import type { ActivityProps } from '#src/client/activities.js';

export function EgyptCard({}: ActivityProps) {
    return (
        <article
            class="card egypt"
            style={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: 180,
                padding: 24,
                borderRadius: 14,
                color: '#dff3ea',
                backgroundImage: 'url("https://i.redd.it/h9q1rf0xtma81.gif")',
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                border: '3px dotted #0000006d',
            }}
        >
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 12,
                    left: 15,
                    right: 15,
                    borderTop: '1px solid #987044',
                    opacity: 0.65,
                }}
            />

            <span
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    right: 23,
                    top: 22,
                    fontSize: 65,
                    lineHeight: 1,
                    opacity: 0.55,
                }}
            >
                𓂀
            </span>

            <span
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    bottom: -13,
                    right: 6,
                    fontSize: 85,
                    color: '#b88e58',
                    opacity: 0.6,
                }}
            >
                △
            </span>

            <h2
                style={{
                    position: 'relative',
                    margin: '82px 0 0',
                    fontSize: 34,
                    letterSpacing: 1,
                }}
            >
                Miauripto piramidės
            </h2>
        </article>
    );
}
