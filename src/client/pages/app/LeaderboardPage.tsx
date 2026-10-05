import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';

export type LeaderboardType = 'team' | 'group';

type LeaderboardPageProps = {
    type: LeaderboardType;
};

export const leaderboardPage: Page<LeaderboardPageProps> = {
    Component: LeaderboardPage,
    title: (t) => t('titleLeaderboard'),
};

function LeaderboardPage({ type }: LeaderboardPageProps) {
    return (
        <>
            <Header />

            <h1>Leaderboard</h1>
            <p>
                <a href="/app/leaderboard?type=team">team</a> |{' '}
                <a href="/app/leaderboard?type=group">group</a>
            </p>
            <p>TODO: {type} leaderboard.</p>
        </>
    );
}
