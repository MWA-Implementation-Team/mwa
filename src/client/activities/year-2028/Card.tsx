// Card (1).tsx

import type { ActivityProps } from '#src/client/activities.js';

export function Year2028Card({}: ActivityProps) {
    return (
        <article
            class="card year-2028"
            style={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: 180,
                padding: 24,
                borderRadius: 14,
                color: '#dff3ea',
                backgroundImage:
                    'url("https://mir-s3-cdn-cf.behance.net/project_modules/hd/3bad3d60305305.5a4661bf1eef9.gif")',
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                border: '3px solid #0000006d',
            }}
        >
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    width: 122,
                    height: 122,
                    border: '3px solid #a79bcf',
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
                    border: '2px solid #a79bcf',
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
                    fontSize: 46,
                    letterSpacing: 3,
                }}
            >
                Miciaus dabartis
            </h2>
        </article>
    );
}
