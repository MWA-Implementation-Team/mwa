import Header from '#src/client/ui/Header.js';
import Footer from '#src/client/ui/Footer.js';
import { Page } from '#src/client/pages.js';
import { useContext, useState } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import { callGroups, markDone, type WaitingQueueRow } from '#src/client/api/host.js';

type HostPageProps = {
    activities: { slug: string; name: string }[];
    waiting: WaitingQueueRow[];
    atStation: WaitingQueueRow[];
};

export const hostPage: Page<HostPageProps> = {
    Component: HostPage,
    title: (t) => t('titleHost'),
};

const MAX_CALL_COUNT = 20;

function HostPage({ activities, waiting: initialWaiting, atStation }: HostPageProps) {
    const { t } = useContext(ClientContext);
    const [station, setStation] = useState(activities[0]?.slug ?? '');
    const [count, setCount] = useState(1);
    const [waiting, setWaiting] = useState(initialWaiting);
    const [called, setCalled] = useState(atStation);
    const [error, setError] = useState<string | null>(null);

    const onStation = called.filter((entry) => entry.activitySlug === station);

    const handleCall = async () => {
        setError(null);
        try {
            const res = await callGroups(station, count);
            setCalled((prev) => [
                ...prev.filter((entry) => entry.activitySlug !== station),
                ...res.atStation,
            ]);
            setWaiting((prev) => prev.slice(res.called.length));
        } catch {
            setError(t('hostRequestFailed'));
        }
    };

    const handleDone = async (entryId: number) => {
        setError(null);
        try {
            await markDone(entryId);
            setCalled((prev) => prev.filter((entry) => entry.id !== entryId));
        } catch {
            setError(t('hostDoneFailed'));
        }
    };

    return (
        <>
            <Header />

            <main class="page page-narrow">
                <h1 class="page-title">{t('hostTitle')}</h1>

                <section class="card">
                    <h2 class="section-title">{t('hostCallTitle')}</h2>

                    <div class="form-stack host-form">
                        <div>
                            <label for="host-station">{t('hostStation')}</label>
                            <select
                                id="host-station"
                                value={station}
                                onChange={(e) => setStation((e.target as HTMLSelectElement).value)}
                            >
                                {activities.map((a) => (
                                    <option key={a.slug} value={a.slug}>
                                        {a.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label for="host-count">{t('hostCount')}</label>
                            <input
                                id="host-count"
                                type="number"
                                min={1}
                                max={MAX_CALL_COUNT}
                                value={count}
                                onInput={(e) =>
                                    setCount(
                                        Math.max(
                                            1,
                                            Math.min(
                                                MAX_CALL_COUNT,
                                                Number((e.target as HTMLInputElement).value) || 1,
                                            ),
                                        ),
                                    )
                                }
                            />
                        </div>
                    </div>

                    <p class="muted host-waiting">
                        {t('hostWaiting', { n: String(waiting.length) })}
                    </p>

                    {error && <p class="queue-error">{error}</p>}

                    <button
                        class="btn btn-primary btn-block"
                        onClick={handleCall}
                        disabled={waiting.length === 0}
                    >
                        {t('hostRequest')}
                    </button>
                </section>

                <section class="card">
                    <h2 class="section-title">{t('hostAtStation')}</h2>

                    {onStation.length === 0 ? (
                        <p class="muted queue-empty">{t('hostStationEmpty')}</p>
                    ) : (
                        <div class="station-groups">
                            {onStation.map((entry) => (
                                <div key={entry.id} class="station-group">
                                    <span class="station-group-name">{entry.groupName}</span>
                                    <button
                                        class="btn btn-outline btn-sm"
                                        onClick={() => handleDone(entry.id)}
                                    >
                                        {t('hostDone')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section class="card">
                    <h2 class="section-title">{t('hostNextUp')}</h2>

                    {waiting.length === 0 ? (
                        <p class="muted queue-empty">{t('hostQueueEmpty')}</p>
                    ) : (
                        <ol class="queue-preview">
                            {waiting.map((entry) => (
                                <li key={entry.id}>{entry.groupName}</li>
                            ))}
                        </ol>
                    )}
                </section>
            </main>

            <Footer />
        </>
    );
}
