import type { ActivityProps } from '#src/client/activities.js';

export function MiddleAgesDetail({}: ActivityProps) {
    return (
        <>
            <h1>Viduramžiai</h1>
            <p>
                Riterių turnyras: dalyviai meta kirvukus (ne tikrus) į taikinį, o po to kovoja
                kardais tarpusavyje. Kuo arčiau taikinio pataiko kirvukas ir kuo daugiau kovų
                laimima — tuo daugiau taškų. Turnyro nugalėtojas laimi papildomų pinigų.
            </p>
        </>
    );
}
