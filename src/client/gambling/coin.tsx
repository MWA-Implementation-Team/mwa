import { useEffect, useState } from 'preact/hooks';

type Props = {
    outcome: boolean;
    delay?: number;
    rotations?: number;
};

export function GamblingCoin({ outcome, delay = 1000, rotations = 8 }: Props) {
    const [rotation, setRotation] = useState(0);

    // happens only once
    useEffect(() => {
        const timeout = setTimeout(() => {
            const target = outcome ? 0 : 180;

            setRotation(rotations * 360 + target);
        }, delay);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="coin-wrapper">
            <div
                className="coin"
                style={{
                    transform: `rotateY(${rotation}deg)`,
                }}
            >
                <div className="coin-side coin-heads">
                    <img src="/img/gambling/heads.png" alt="Heads" />
                </div>

                <div className="coin-side coin-tails">
                    <img src="/img/gambling/tails.png" alt="Tails" />
                </div>
            </div>
        </div>
    );
}
