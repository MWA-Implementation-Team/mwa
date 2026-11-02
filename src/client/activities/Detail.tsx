import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import { ActivityProps, registeredActivities } from '#src/client/activities.js';

// The universal station page: every activity gets its card art on top
// and its text below.
export function ActivityDetail({ slug }: ActivityProps) {
    const { lang } = useContext(ClientContext);
    const activity = registeredActivities[slug];
    const { Card } = activity;
    return (
        <section class="mwa-panel">
            <div class="mwa-panel-head">
                <h2>{activity.name}</h2>
            </div>
            <div class="mwa-panel-body">
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
