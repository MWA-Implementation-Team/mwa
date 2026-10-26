// Card (1).tsx

import type { ActivityProps } from '#src/client/activities.js';

export function Year2028Card({}: ActivityProps) {
    return (
        <article
            class="card"
            style={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: 180,
                padding: 24,
                borderRadius: 14,
                color: '#f3f0ff',
                background: 'linear-gradient(145deg, #30304c, #51416a)',
                border: '2px solid #777092',
            }}
        >
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    width: 122,
                    height: 122,
                    border: '2px solid #a79bcf',
                    borderRadius: '50%',
                    top: -23,
                    right: -17,
                    opacity: 0.65,
                }}
            />

            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    width: 85,
                    height: 85,
                    border: '1px solid #a79bcf',
                    borderRadius: '50%',
                    top: -5,
                    right: 2,
                    opacity: 0.65,
                }}
            />

            <span
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 20,
                    left: 24,
                    color: '#c6baf7',
                    letterSpacing: 5,
                    fontSize: 18,
                }}
            >
                ✳ · ✳
            </span>

            <h2
                style={{
                    position: 'relative',
                    margin: '80px 0 0',
                    fontFamily: 'monospace',
                    fontSize: 46,
                    letterSpacing: 3,
                }}
            >
                2028
            </h2>
        </article>
    );
}
