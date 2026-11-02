import { Page } from '#src/client/pages.js';
import { useContext, useState } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import type { WaitingQueueRow } from '#src/db/queue/index.js';
import { ActivitySlug, registeredActivities } from '#src/client/activities.js';
import PageShell from './PageShell.js';
import { Toast } from '#src/client/ui/Toast.js';
import { Language } from '#src/client/language.js';

type HostPageProps = {
    activities: { slug: ActivitySlug; name: string }[];
    waiting: WaitingQueueRow[];
    atStation: WaitingQueueRow[];
    station: ActivitySlug;
    error?: keyof Language;
};

export const hostPage: Page<HostPageProps> = {
    Component: HostPage,
    title: (t) => t('titleHost'),
};

function HostPage({
    activities,
    waiting,
    atStation,
    station: initialStation,
    error,
}: HostPageProps) {
    const { t } = useContext(ClientContext);
    // Cycling is client-side — the page already ships every station's rows,
    // so flipping the card doesn't need a round-trip.
    const [index, setIndex] = useState(() =>
        Math.max(
            0,
            activities.findIndex((a) => a.slug === initialStation),
        ),
    );
    const station = activities[index]?.slug ?? initialStation;
    const { Card } = registeredActivities[station];
    const onStation = atStation.filter((entry) => entry.activitySlug === station);
    // groups that already completed this station keep their spot but can't
    // be called to it again
    const eligible = waiting.filter((entry) => !entry.completedSlugs.includes(station)).length;
    const [count, setCount] = useState(1);

    const cycle = (step: 1 | -1) =>
        setIndex((i) => (i + step + activities.length) % activities.length);

    return (
        <PageShell section="host">
            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{t('hostAssign')}</h2>
                </div>
                <div class="mwa-panel-body mwa-host">
                    <div class="mwa-host-picker">
                        <Card slug={station} />
                        <div class="mwa-host-cycle">
                            <button
                                type="button"
                                class="mwa-button"
                                aria-label={t('hostPrevStation')}
                                onClick={() => cycle(-1)}
                            >
                                ←
                            </button>
                            <button
                                type="button"
                                class="mwa-button"
                                aria-label={t('hostNextStation')}
                                onClick={() => cycle(1)}
                            >
                                →
                            </button>
                        </div>
                    </div>
                    <div class="mwa-host-side">
                        <div class="table mwa-tx">
                            <table>
                                <thead>
                                    <tr>
                                        <th colSpan={3}>{t('hostAtStation')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {onStation.length === 0 ? (
                                        <tr>
                                            <td colSpan={3}>{t('hostStationEmpty')}</td>
                                        </tr>
                                    ) : (
                                        onStation.map((entry, i) => (
                                            <tr key={entry.id}>
                                                <td>{i + 1}.</td>
                                                <td>{entry.groupName}</td>
                                                <td class="mwa-tx-amount">
                                                    <form method="post" action="/app/host/done">
                                                        <input
                                                            type="hidden"
                                                            name="activity_slug"
                                                            value={station}
                                                        />
                                                        <input
                                                            type="hidden"
                                                            name="entry_id"
                                                            value={entry.id}
                                                        />
                                                        <button type="submit" class="lang-link">
                                                            {t('hostDone')}
                                                        </button>
                                                    </form>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div class="mwa-host-controls">
                            <form method="post" action="/app/host/call" class="mwa-host-request">
                                <input type="hidden" name="activity_slug" value={station} />
                                <div
                                    class="mwa-host-count"
                                    role="group"
                                    aria-label={t('hostCount')}
                                >
                                    {[1, 2, 3, 4].map((n) => (
                                        <label key={n} class="mwa-button mwa-host-count-option">
                                            <input
                                                type="radio"
                                                name="count"
                                                value={n}
                                                checked={count === n}
                                                onChange={() => setCount(n)}
                                            />
                                            {n}
                                        </label>
                                    ))}
                                </div>
                                <button
                                    type="submit"
                                    class="mwa-button"
                                    disabled={count > eligible}
                                >
                                    {t('hostRequest')}
                                </button>
                            </form>
                            {error && <Toast kind="error">{t(error)}</Toast>}
                        </div>
                        <div class="table mwa-tx">
                            <table>
                                <thead>
                                    <tr>
                                        <th colSpan={2}>{t('hostNextUp')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {waiting.length === 0 ? (
                                        <tr>
                                            <td colSpan={2}>{t('hostQueueEmpty')}</td>
                                        </tr>
                                    ) : (
                                        waiting.map((entry, i) => (
                                            <tr key={entry.id}>
                                                <td>{i + 1}.</td>
                                                <td>
                                                    {entry.groupName}
                                                    {entry.completedSlugs.includes(station) && (
                                                        <span class="mwa-standing-hint">
                                                            {' '}
                                                            {t('hostAlreadyDone')}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </PageShell>
    );
}
