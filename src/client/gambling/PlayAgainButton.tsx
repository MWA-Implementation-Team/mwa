import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import type { Gambler, RunningGame } from '#src/db/gambling/index.js';

export function PlayAgainButton({ game, side }: { game: RunningGame; side: Gambler | null }) {
    const { t } = useContext(ClientContext);
    if (game.status.type !== 'ended' || side !== 'p1' || !game.inviteToken) return null;

    return (
        <a class="button" href={`/app/interact/${encodeURIComponent(game.inviteToken)}#gambling`}>
            {t('gamblingPlayAgain')}
        </a>
    );
}
