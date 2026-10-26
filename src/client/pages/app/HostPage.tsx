import { Page } from '#src/client/pages.js';
import { useContext, useState } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import type { WaitingQueueRow } from '#src/db/queue.js';
import PageShell from './PageShell.js';
import { Language } from '#src/client/language.js';

type HostPageProps = {
    activities: { slug: string; name: string }[];
    waiting: WaitingQueueRow[];
    atStation: WaitingQueueRow[];
    station: string;
    error?: keyof Language;
};

export const hostPage: Page<HostPageProps> = {
    Component: HostPage,
    title: (t) => t('titleHost'),
};

const MAX_CALL_COUNT = 20;

function HostPage({
    activities,
    waiting,
    atStation,
    station: initialStation,
    error,
}: HostPageProps) {
    const { t } = useContext(ClientContext);
    const [station, setStation] = useState(initialStation);
    const onStation = atStation.filter((entry) => entry.activitySlug === station);

    return (
        <PageShell section="host">
            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{t('hostCallTitle')}</h2>
                </div>
                <div class="mwa-panel-body">
                    <form id="host-call" method="post" action="/app/host/call" class="mwa-form">
                        <div class="mwa-field">
                            <label for="host-station">{t('hostStation')}</label>
                            <select
                                id="host-station"
                                name="activity_slug"
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

                        <div class="mwa-field">
                            <label for="host-count">{t('hostCount')}</label>
                            <input
                                id="host-count"
                                type="number"
                                min={1}
                                max={MAX_CALL_COUNT}
                                name="count"
                                defaultValue={1}
                                required
                            />
                        </div>
                    </form>

                    <p class="mwa-muted">{t('hostWaiting', { n: String(waiting.length) })}</p>

                    {error && (
                        <p class="mwa-note mwa-note--error" role="alert">
                            {t(error)}
                        </p>
                    )}

                    <div class="mwa-actions">
                        <button
                            class="btn-primary"
                            type="submit"
                            form="host-call"
                            disabled={waiting.length === 0}
                        >
                            {t('hostRequest')}
                        </button>
                    </div>
                </div>
            </section>

            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{t('hostAtStation')}</h2>
                </div>
                <div class="mwa-panel-body">
                    {onStation.length === 0 ? (
                        <p class="mwa-muted">{t('hostStationEmpty')}</p>
                    ) : (
                        <ul class="mwa-rows">
                            {onStation.map((entry) => (
                                <li key={entry.id} class="mwa-row">
                                    <strong>{entry.groupName}</strong>
                                    <form method="post" action="/app/host/done">
                                        <input type="hidden" name="activity_slug" value={station} />
                                        <input type="hidden" name="entry_id" value={entry.id} />
                                        <button type="submit">{t('hostDone')}</button>
                                    </form>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{t('hostNextUp')}</h2>
                </div>
                <div class="mwa-panel-body">
                    {waiting.length === 0 ? (
                        <p class="mwa-muted">{t('hostQueueEmpty')}</p>
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
