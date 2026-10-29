import { Page } from '#src/client/pages.js';
import PageShell from './app/PageShell.js';

type ErrorPageProps = {
    status: number;
};

export const errorPage: Page<ErrorPageProps> = {
    Component: ErrorPage,
    title: (t, { status }) => t('titleError', { status: `${status}` }),
};

function ErrorPage({ status }: ErrorPageProps) {
    return (
        <PageShell section="error">
            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{status === 404 ? '404 Not Found' : `Error: ${status}`}</h2>
                </div>
            </section>
        </PageShell>
    );
}
