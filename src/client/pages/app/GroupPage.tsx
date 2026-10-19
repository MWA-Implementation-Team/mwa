import { useContext, useState } from 'preact/hooks';
import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
import { createGroup, deleteGroup, reviveGroup, type GroupJson } from '#src/client/api/groups.js';
import PageShell from './PageShell.js';

type GroupsPageProps = {
    initialGroups?: GroupJson[] | null;
};

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
            setGroups((currentGroups) => currentGroups?.filter((group) => group.id !== groupId) ?? null);
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
        <>
            <Header />
            <PageShell title={t('groupManagement')} subtitle="Create a group or manage the groups you belong to.">
                {error && <p class="mwa-notice mwa-notice--error" role="alert">{error}</p>}
                {successMsg && <p class="mwa-notice mwa-notice--success" role="status">{successMsg}</p>}

                <div class="mwa-columns">
                    <section class="mwa-panel">
                        <div class="mwa-panel-heading"><h2>{t('groupYourGroups')}</h2><span class="mwa-badge">{groups?.length ?? 0}</span></div>
                        <div class="mwa-panel-body">
                            {groups === null || groups.length === 0 ? (
                                <div class="mwa-empty"><h3>{t('groupEmpty')}</h3></div>
                            ) : (
                                <ul class="mwa-list">
                                    {groups.map((group) => (
                                        <li class="mwa-list-item" key={group.id}>
                                            <div>
                                                <span class="mwa-list-title">{group.name}</span>
                                                <div class="mwa-list-meta">{group.phone_number}</div>
                                            </div>
                                            {group.ownerId === user?.id && (
                                                <button class="mwa-btn--danger" type="button" onClick={() => handleDeleteGroup(group.id)}>
                                                    {t('groupDelete')}
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </section>

                    <section class="mwa-panel">
                        <div class="mwa-panel-heading"><h2>{t('groupCreate')}</h2></div>
                        <div class="mwa-panel-body">
                            <form class="mwa-form" onSubmit={handleCreateGroup}>
                                <div class="mwa-field">
                                    <label for="group-name">{t('groupName')}</label>
                                    <input id="group-name" type="text" value={groupName} onInput={(e) => setGroupName((e.target as HTMLInputElement).value)} required />
                                </div>
                                <div class="mwa-field">
                                    <label for="group-phone">{t('groupPhone')}</label>
                                    <input id="group-phone" type="text" value={phoneNumber} onInput={(e) => setPhoneNumber((e.target as HTMLInputElement).value)} required />
                                </div>
                                <div class="mwa-form-actions"><button type="submit" class="btn-primary">{t('groupCreate')}</button></div>
                            </form>
                        </div>
                    </section>
                </div>
            </PageShell>
        </>
    );
}
