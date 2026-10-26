// Card (7).tsx

import type { ActivityProps } from '#src/client/activities.js';

export function CellsCard({}: ActivityProps) {
    return (
        <article
            class="card"
            style={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: 180,
                padding: 24,
                borderRadius: 14,
                color: '#dff3ea',
                background: 'linear-gradient(135deg, #305f2e, #0e3613)',
                border: '2px solid #57a68f',
            }}
        >
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    right: 14,
                    top: 10,
                    width: 112,
                    height: 112,
                    borderRadius: '43% 57% 52% 48%',
                    border: '6px solid #428e7d',
                    opacity: 0.48,
                    background:
                        'radial-gradient(circle at 55% 48%, #579c8c 0 17%, transparent 18%)',
                    transform: 'rotate(-14deg)',
                }}
            />

            <span
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 19,
                    left: 24,
                    fontSize: 23,
                    letterSpacing: 9,
                    opacity: 0.55,
                }}
            >
                ◌ ◦ ◌
            </span>

            <h2
                style={{
                    position: 'relative',
                    margin: '90px 0 0',
                    fontFamily: 'Georgia, serif',
                    fontSize: 35,
                }}
            >
                Ląstelės
            </h2>
        </article>
    );
}
