import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';

// Fixed top strip shown while the user's group is called to a station —
// renders on every PageShell page via the shared context. Links to the
// activity detail page so the group can read what they're doing; plain
// text when the stored slug isn't a registered activity. role=status sits
// on the wrapper so the live-region announcement doesn't mask the link role.
export default function StationBanner() {
    const { t, atStation } = useContext(ClientContext);
    if (!atStation) return null;

    const label = t('stationBanner', { name: atStation.name });
    return (
        <div role="status">
            {atStation.slug === null ? (
                <div class="mwa-station-banner">{label}</div>
            ) : (
                <a
                    href={`/activities/${encodeURIComponent(atStation.slug)}`}
                    class="mwa-station-banner"
                >
                    {label}
                </a>
            )}
        </div>
    );
}
