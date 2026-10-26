import { useContext, useState } from 'preact/hooks';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
import { createGroup, deleteGroup, reviveGroup, type GroupJson } from '#src/client/api/groups.js';
import PageShell from './PageShell.js';

type GroupsPageProps = { initialGroups?: GroupJson[] | null };

export const groupPage: Page<GroupsPageProps> = {
    Component: GroupsComponent,
    title: (t) => t('titleGroup'),
};

function GroupsComponent({ initialGroups = null }: GroupsPageProps) {
    const { t, user } = useContext(ClientContext);
    const [groups, setGroups] = useState(initialGroups?.map(reviveGroup) ?? null);
    const [groupName, setGroupName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleDeleteGroup = async (groupId: number) => {
        if (!window.confirm(t('groupDeleteConfirm'))) return;
        setError(null);
        setSuccessMsg(null);
        try {
            await deleteGroup(groupId);
            setGroups(
                (currentGroups) => currentGroups?.filter((group) => group.id !== groupId) ?? null,
            );
            setSuccessMsg(t('groupDeleted'));
        } catch (err: any) {
            setError(err.message || t('groupDeleteFailed'));
        }
    };

    const handleCreateGroup = async (e: Event) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        try {
            const group = await createGroup(groupName, 0, phoneNumber);
            setGroups((currentGroups) => [...(currentGroups ?? []), group]);
            setSuccessMsg(t('groupCreated'));
            setGroupName('');
            setPhoneNumber('');
        } catch (err: any) {
            setError(err.message || t('groupCreateFailed'));
        }
    };

    return (
        <PageShell section="group">
            {error && (
                <p class="mwa-note mwa-note--error" role="alert">
                    {error}
                </p>
            )}
            {successMsg && (
                <p class="mwa-note mwa-note--success" role="status">
                    {successMsg}
                </p>
            )}
            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{t('groupYourGroups')}</h2>
                </div>
                <div class="mwa-panel-body">
                    {groups === null || groups.length === 0 ? (
                        <p class="mwa-muted">{t('groupEmpty')}</p>
                    ) : (
                        <ul class="mwa-rows">
                            {groups.map((group) => (
                                <li key={group.id}>
                                    <div class="mwa-row">
                                        <div>
                                            <strong>{group.name}</strong>
                                            <small>{group.phone_number}</small>
                                        </div>
                                        {group.ownerId === user?.id && (
                                            <button
                                                type="button"
                                                class="mwa-danger"
                                                onClick={() => handleDeleteGroup(group.id)}
                                            >
                                                {t('groupDelete')}
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{t('groupCreate')}</h2>
                </div>
                <div class="mwa-panel-body">
                    <form class="mwa-form" onSubmit={handleCreateGroup}>
                        <div class="mwa-field">
                            <label for="mwa-group-name">{t('groupName')}</label>
                            <input
                                id="mwa-group-name"
                                type="text"
                                value={groupName}
                                onInput={(e) => setGroupName((e.target as HTMLInputElement).value)}
                                required
                            />
                        </div>
                        <div class="mwa-field">
                            <label for="mwa-group-phone">{t('groupPhone')}</label>
                            <input
                                id="mwa-group-phone"
                                type="tel"
                                value={phoneNumber}
                                onInput={(e) =>
                                    setPhoneNumber((e.target as HTMLInputElement).value)
                                }
                                required
                            />
                        </div>
                        <div class="mwa-actions">
                            <button type="submit" class="btn-primary">
                                {t('groupCreate')}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </PageShell>
    );
}
