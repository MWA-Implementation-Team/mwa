// Card (4).tsx

import type { ActivityProps } from '#src/client/activities.js';

export function MiddleAgesCard({}: ActivityProps) {
    return (
        <article
            class="card middle-ages"
            style={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: 180,
                padding: 24,
                borderRadius: 14,
                color: '#dff3ea',
                backgroundImage:
                    'url("https://mir-s3-cdn-cf.behance.net/project_modules/source/44bdd636389967.571e688a4be1d.gif")',
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
                    inset: 9,
                    border: '2px solid #3e3e3e',
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
                    fontSize: 34,
                }}
            >
                Micius viduramžiuose
            </h2>
        </article>
    );
}
