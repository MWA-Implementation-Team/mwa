import { Page } from '#src/client/pages.js';
import { useContext, useState } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import { callGroups, markDone, type WaitingQueueRow } from '#src/client/api/host.js';
import PageShell from './PageShell.js';

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
        <PageShell section="host" title={t('hostTitle')} subtitle={t('subHost')}>
            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('hostCallTitle')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    <div class="mwa-wiki-form">
                        <div class="mwa-wiki-field">
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

                        <div class="mwa-wiki-field">
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

                    <p class="mwa-wiki-muted">{t('hostWaiting', { n: String(waiting.length) })}</p>

                    {error && (
                        <p class="mwa-wiki-note mwa-wiki-note--error" role="alert">
                            {error}
                        </p>
                    )}

                    <div class="mwa-wiki-actions">
                        <button
                            class="btn-primary"
                            onClick={handleCall}
                            disabled={waiting.length === 0}
                        >
                            {t('hostRequest')}
                        </button>
                    </div>
                </div>
            </section>

            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('hostAtStation')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    {onStation.length === 0 ? (
                        <p class="mwa-wiki-muted">{t('hostStationEmpty')}</p>
                    ) : (
                        <ul class="mwa-wiki-rows">
                            {onStation.map((entry) => (
                                <li key={entry.id} class="mwa-wiki-row">
                                    <strong>{entry.groupName}</strong>
                                    <button onClick={() => handleDone(entry.id)}>
                                        {t('hostDone')}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('hostNextUp')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    {waiting.length === 0 ? (
                        <p class="mwa-wiki-muted">{t('hostQueueEmpty')}</p>
                    ) : (
                        <ol>
                            {waiting.map((entry) => (
                                <li key={entry.id}>{entry.groupName}</li>
                            ))}
                        </ol>
                    )}
                </div>
            </section>
        </PageShell>
    );
}
