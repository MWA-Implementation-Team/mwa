import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';

// Fixed top strip shown while the user's group is called to a station —
// renders on every PageShell page via the shared context.
export default function StationBanner() {
    const { t, atStation } = useContext(ClientContext);
    if (!atStation) return null;

    return (
        <div class="mwa-station-banner" role="status">
            {t('stationBanner', { name: atStation })}
        </div>
    );
}
