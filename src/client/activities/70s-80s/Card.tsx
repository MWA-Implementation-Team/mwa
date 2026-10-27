// Card (8).tsx

import type { ActivityProps } from '#src/client/activities.js';

export function SeventiesEightiesCard({}: ActivityProps) {
    return (
        <article
            class="card seventies-eighties"
            style={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: 180,
                padding: 24,
                borderRadius: 14,
                color: '#dff3ea',
                backgroundImage: 'url("https://i.pinimg.com/originals/e5/1e/b7/e51eb7f31309c7b370d75ef23aa98c12.gif")',
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
                    bottom: -4,
                    left: 0,
                    right: 0,
                    height: 14,
                    background:
                        'linear-gradient(80deg, #5d313e 0 25%, #5e4225 25% 50%, #5a5178 50% 75%, #934b53 75%)',
                }}
            />

            <span
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    right: 23,
                    top: 18,
                    fontSize: 72,
                }}
            >
                🪩
            </span>

            <h2
                style={{
                    position: 'relative',
                    margin: '81px 0 0',
                    fontSize: 48,
                    fontWeight: 900,
                    letterSpacing: 2,
                }}
            >
                70/80
            </h2>
        </article>
    );
}
