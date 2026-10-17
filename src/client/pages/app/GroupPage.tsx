import { useContext, useState } from 'preact/hooks';
import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
import { createGroup, deleteGroup, reviveGroup, type GroupJson } from '#src/client/api/groups.js';

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
        <>
            <Header />

            <div>
                <h1>{t('groupManagement')}</h1>

                {error && <p style={{ color: 'red' }}>{error}</p>}
                {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}

                <form onSubmit={handleCreateGroup}>
                    <div>
                        <label>{t('groupName')}: </label>
                        <input
                            type="text"
                            value={groupName}
                            onInput={(e) => setGroupName((e.target as HTMLInputElement).value)}
                            required
                        />
                    </div>
                    <div>
                        <label>{t('groupPhone')}: </label>
                        <input
                            type="text"
                            value={phoneNumber}
                            onInput={(e) => setPhoneNumber((e.target as HTMLInputElement).value)}
                            required
                        />
                    </div>
                    <button type="submit" class="btn-primary">
                        {t('groupCreate')}
                    </button>
                </form>

                <h2>{t('groupYourGroups')}</h2>
                {groups === null || groups.length === 0 ? (
                    <p>{t('groupEmpty')}</p>
                ) : (
                    <ul>
                        {groups.map((group) => (
                            <li key={group.id}>
                                {group.name} ({group.phone_number})
                                {group.ownerId === user?.id && (
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteGroup(group.id)}
                                    >
                                        {t('groupDelete')}
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}
