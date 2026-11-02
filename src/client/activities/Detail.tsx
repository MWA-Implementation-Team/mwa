import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import { ActivityProps, registeredActivities } from '#src/client/activities.js';
import { Toast } from '#src/client/ui/Toast.js';

// The universal station page: every activity gets its card art on top
// and its text below. `completed` adds a banner for signed-in teams.
export function ActivityDetail({
    slug,
    completed,
}: ActivityProps & { completed?: boolean | null }) {
    const { lang, t } = useContext(ClientContext);
    const activity = registeredActivities[slug];
    const { Card } = activity;
    return (
        <section class="mwa-panel">
            <div class="mwa-panel-head">
                <h2>{activity.name}</h2>
            </div>
            <div class="mwa-panel-body">
                {completed && <Toast kind="success">{t('activityCompleted')}</Toast>}
                <Card slug={slug} />
                {activity.text && (
                    <div
                        class="mwa-activity-text"
                        dangerouslySetInnerHTML={{ __html: activity.text[lang] }}
                    />
                )}
            </div>
        </section>
    );
}
