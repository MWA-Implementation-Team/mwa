import { useEffect, useState } from 'preact/hooks';
import { calcTurnTimeLeftMs, PlayerTurnTime } from '#src/client/gambling/turns.js';

export function TurnTimeLeftDisplay({ turn }: { turn: PlayerTurnTime }) {
    const [, setTick] = useState(0);

    function tick() {
        setTick((t) => t + 1);
    }

    useEffect(() => {
        if (turn.turnStartedTimeMs === undefined) return;

        let intervalId: ReturnType<typeof setInterval> | undefined;
        const msToNextSecond = 1000 - (Date.now() % 1000);
        const timeoutId = setTimeout(() => {
            tick();
            intervalId = setInterval(tick, 1000);
        }, msToNextSecond);

        return () => {
            clearTimeout(timeoutId);
            if (intervalId !== undefined) clearInterval(intervalId);
        };
    }, [turn.turnStartedTimeMs]);

    const timeLeftMs = calcTurnTimeLeftMs(turn);

    return <p>{formatDuration(Math.floor(timeLeftMs / 1000))}</p>;
}

function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}
