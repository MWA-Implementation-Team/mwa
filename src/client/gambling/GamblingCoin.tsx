import { PlayAgainButton } from './PlayAgainButton.js';
import { CoinFlipGame, CoinSide, Gambler } from '#src/db/gambling/index.js';
import { useContext, useEffect, useRef, useState } from 'preact/hooks';
import { ClientContext } from '../context.js';
import { displayActor } from '../display.js';
import { coinSideTrans, sideName } from './util.js';

type Props = {
    currentGame: CoinFlipGame;
    side: Gambler | null;
};

const spinDuration = 500;
const spinSpeed = 360 / spinDuration;

export function GamblingCoin({ currentGame, side }: Props) {
    const { user, t } = useContext(ClientContext);

    const coinRef = useRef<HTMLDivElement>(null);
    const initialOutcome = useRef(
        currentGame.status.type === 'ended' ? currentGame.status.flipResult : undefined,
    ).current;
    const updateOutcome = useRef<(outcome?: CoinSide) => void>(() => {});
    const [isSpinning, setIsSpinning] = useState(initialOutcome === undefined);
    const showTails = initialOutcome === 'tails';

    useEffect(() => {
        if (initialOutcome !== undefined) return;

        const coin = coinRef.current!;
        let result: CoinSide | undefined;
        let phase: 'starting' | 'spinning' | 'settling' = 'starting';
        let animation: Animation;

        function animate(from: number, to: number, options: KeyframeAnimationOptions) {
            const previous = animation;
            animation = coin.animate(
                [{ transform: `rotateY(${from}deg)` }, { transform: `rotateY(${to}deg)` }],
                { fill: 'forwards', ...options },
            );
            previous?.cancel();
        }

        function settle() {
            if (phase !== 'spinning' || result === undefined) return;

            const progress = animation.effect!.getComputedTiming().progress ?? 0;
            const angle = progress * 360;
            const face = result === 'heads' ? 0 : 180;
            const distance = 2 * 360 + ((face - angle + 360) % 360);
            phase = 'settling';

            animate(angle, angle + distance, {
                duration: (2 * distance) / spinSpeed,
                easing: 'cubic-bezier(0.333333, 0.666667, 0.666667, 1)',
            });
            animation.onfinish = () => setIsSpinning(false);
        }

        updateOutcome.current = (outcome) => {
            result = outcome;
            settle();
        };

        animate(0, 360, {
            duration: 2 * spinDuration,
            easing: 'cubic-bezier(0.333333, 0, 0.666667, 0.333333)',
        });
        animation!.onfinish = () => {
            phase = 'spinning';
            animate(0, 360, {
                duration: spinDuration,
                iterations: Infinity,
                easing: 'linear',
            });
            settle();
        };

        return () => {
            animation.onfinish = null;
            animation.cancel();
            updateOutcome.current = () => {};
        };
    }, []);

    useEffect(() => {
        if (currentGame.status.type === 'ended') {
            updateOutcome.current(currentGame.status.flipResult);
        } else {
            updateOutcome.current(undefined);
        }
    }, [currentGame.status.type === 'ended']);

    return (
        <>
            <div class="mwa-coin-wrapper">
                <div class={showTails ? 'mwa-coin mwa-coin--tails' : 'mwa-coin'} ref={coinRef}>
                    <div class="mwa-coin-side">
                        <img src="/img/gambling/heads.webp" alt="Heads" />
                    </div>

                    <div class="mwa-coin-side mwa-coin-side--tails">
                        <img src="/img/gambling/tails.webp" alt="Tails" />
                    </div>
                </div>
            </div>

            {currentGame.status.type === 'ended' && !isSpinning ? (
                <>
                    {<h3>{t(coinSideTrans(currentGame.status.flipResult))}</h3>}
                    <p>
                        {side === currentGame.status.winner
                            ? t('gamblingYouWin')
                            : t('gamblingWinner', {
                                  player: displayActor(
                                      sideName(currentGame, currentGame.status.winner),
                                      user,
                                      t,
                                  ),
                              })}
                    </p>
                    <PlayAgainButton game={currentGame} side={side} />
                </>
            ) : (
                <p class="mwa-muted">{t('gamblingCoinFlipping')}</p>
            )}
        </>
    );
}
