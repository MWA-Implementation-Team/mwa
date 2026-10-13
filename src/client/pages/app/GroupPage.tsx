import { useContext, useState } from 'preact/hooks';
import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
import { createGroup, deleteGroup, type Group } from '#src/client/api/groups.js';

type GroupsPageProps = {
    initialGroups?: Group[] | null;
};

export const groupPage: Page<GroupsPageProps> = {
    Component: GroupsComponent,
    title: () => 'groups',
};

function GroupsComponent({ initialGroups = null }: GroupsPageProps) {
    const { user } = useContext(ClientContext);
    const [groups, setGroups] = useState(initialGroups);
    const [groupName, setGroupName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleDeleteGroup = async (groupId: number) => {
        if (!window.confirm('Delete group?')) return;

        setError(null);
        setSuccessMsg(null);
        try {
            await deleteGroup(groupId);
            setGroups((currentGroups) =>
                currentGroups?.filter((group) => group.id !== groupId) ?? null,
            );
            setSuccessMsg('Group deleted successfully!');
        } catch (err: any) {
            setError(err.message || 'failed to delete group');
        }
    };

    const handleCreateGroup = async (e: Event) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        try {
            const group = await createGroup(groupName, 0, phoneNumber);
            setGroups((currentGroups) => [...(currentGroups ?? []), group]);
            setSuccessMsg('Group created successfully!');
            setGroupName('');
            setPhoneNumber('');
        } catch (err: any) {
            setError(err.message || 'failed to create group');
        }
    };

    return (
        <>
            <Header />

            <div>
                <h1>Group Management</h1>

                {error && <p style={{ color: 'red' }}>{error}</p>}
                {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}

                <form onSubmit={handleCreateGroup}>
                    <div>
                        <label>Group Name: </label>
                        <input
                            type="text"
                            value={groupName}
                            onInput={(e) => setGroupName((e.target as HTMLInputElement).value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Enter emergency phone Number: </label>
                        <input
                            type="text"
                            value={phoneNumber}
                            onInput={(e) => setPhoneNumber((e.target as HTMLInputElement).value)}
                            required
                        />
                    </div>
                    <button type="submit" class="btn-primary">
                        Create Group
                    </button>
                </form>

                <h2>your Groups</h2>
                {groups === null || groups.length === 0 ? (
                    <p>no groups found</p>
                ) : (
                    <ul>
                        {groups.map((group) => (
                            <li key={group.id}>
                                {group.name} ({group.phone_number})
                                {group.ownerId === user?.id && (
                                    <button type="button" onClick={() => handleDeleteGroup(group.id)}>
                                        Delete group
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
