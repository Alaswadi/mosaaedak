import { useLanguage } from '../../contexts/LanguageContext';
import type { User } from '../../services/api';

interface UsersTableProps {
    users: User[];
    onAddUser?: () => void;
    onViewUser?: (user: User) => void;
    onEditUser?: (user: User) => void;
    onTopUp?: (user: User) => void;
}

// Wallet icon
function WalletIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
    );
}

// View icon
function ViewIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    );
}

// Edit icon
function EditIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    );
}

// Message icon
function MessageIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    );
}

// Bot icon
function BotIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    );
}

export function UsersTable({ users, onAddUser, onViewUser, onEditUser, onTopUp, onManageBot }: UsersTableProps & { onManageBot?: (user: User) => void }) {
    const { t, isRTL } = useLanguage();

    return (
        <div className="card overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 p-6 dark:border-neutral-700">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                    {t('users.table.title')}
                </h3>
                {onAddUser && (
                    <button
                        onClick={onAddUser}
                        className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
                    >
                        {t('users.table.addUser')}
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                        <tr>
                            <th className={`px-6 py-4 text-sm font-medium text-neutral-500 dark:text-neutral-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                                {t('users.table.user')}
                            </th>
                            <th className={`px-6 py-4 text-sm font-medium text-neutral-500 dark:text-neutral-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                                {t('users.table.contact')}
                            </th>
                            <th className={`px-6 py-4 text-sm font-medium text-neutral-500 dark:text-neutral-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                                {t('users.table.status')}
                            </th>
                            <th className={`px-6 py-4 text-sm font-medium text-neutral-500 dark:text-neutral-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                                Wallet Balance
                            </th>
                            <th className={`px-6 py-4 text-sm font-medium text-neutral-500 dark:text-neutral-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                                {t('users.table.conversations')}
                            </th>
                            <th className={`px-6 py-4 text-sm font-medium text-neutral-500 dark:text-neutral-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                                {t('users.table.lastActive')}
                            </th>
                            <th className={`px-6 py-4 text-sm font-medium text-neutral-500 dark:text-neutral-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                                {t('users.table.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                            >
                                {/* User */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="h-10 w-10 shrink-0 rounded-full bg-neutral-200 object-cover dark:bg-neutral-700"
                                        />
                                        <div>
                                            <p className="font-medium text-neutral-900 dark:text-neutral-50">
                                                {user.name}
                                            </p>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                {t('users.table.joined')}: {user.joinedDate}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Contact */}
                                <td className="px-6 py-4">
                                    <p className="text-sm text-neutral-900 dark:text-neutral-50">{user.email}</p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{user.phone}</p>
                                </td>

                                {/* Status */}
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${user.status?.toLowerCase() === 'active'
                                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                                            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
                                            }`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${user.status?.toLowerCase() === 'active' ? 'bg-primary-500' : 'bg-neutral-400'
                                                }`}
                                        />
                                        {user.status?.toLowerCase() === 'active' ? t('users.table.active') : t('users.table.inactive')}
                                    </span>
                                </td>

                                {/* Wallet Balance */}
                                <td className="px-6 py-4">
                                    <span className={`font-medium ${Number(user.walletBalance || 0) < 20
                                            ? 'text-red-600 dark:text-red-400'
                                            : 'text-neutral-900 dark:text-neutral-50'
                                        }`}>
                                        ${Number(user.walletBalance || 0).toFixed(2)}
                                    </span>
                                </td>

                                {/* Conversations */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <MessageIcon className="h-4 w-4 text-neutral-400" />
                                        <span className="text-sm text-neutral-900 dark:text-neutral-50">
                                            {/* Placeholder or real data if available */}
                                            0
                                        </span>
                                    </div>
                                </td>

                                {/* Last Active */}
                                <td className="px-6 py-4">
                                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {user.lastActive}
                                    </span>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onViewUser?.(user)}
                                            className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-primary-500 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-primary-400"
                                            title={t('users.table.view')}
                                        >
                                            <ViewIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => onEditUser?.(user)}
                                            className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-blue-500 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-blue-400"
                                            title={t('users.table.edit')}
                                        >
                                            <EditIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => onTopUp?.(user)}
                                            className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-green-500 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-green-400"
                                            title={isRTL ? 'شحن الرصيد' : 'Top Up Wallet'}
                                        >
                                            <WalletIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => onManageBot?.(user)}
                                            className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-purple-500 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-purple-400"
                                            title={isRTL ? 'إعدادات الروبوت' : 'Bot Configuration'}
                                        >
                                            <BotIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-4 dark:border-neutral-700">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {t('users.table.showing')} {users.length} {t('users.table.of')} {users.length} {t('users.table.users')}
                </p>
                <div className="flex items-center gap-2">
                    <button className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800">
                        {t('users.table.previous')}
                    </button>
                    <button className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800">
                        {t('users.table.next')}
                    </button>
                </div>
            </div>
        </div >
    );
}

export default UsersTable;
