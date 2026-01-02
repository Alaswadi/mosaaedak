import { useLanguage } from '../../contexts/LanguageContext';
import { type User } from '../../services/api';

interface ViewUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

export function ViewUserModal({ isOpen, onClose, user }: ViewUserModalProps) {
    const { t } = useLanguage();

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                        {t('users.table.view')}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-16 w-16 rounded-full bg-neutral-200 object-cover dark:bg-neutral-700"
                        />
                        <div>
                            <h4 className="text-lg font-bold text-neutral-900 dark:text-white">
                                {user.name}
                            </h4>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {user.email}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                Phone
                            </label>
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                                {user.phone || '-'}
                            </p>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                Status
                            </label>
                            <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.status === 'active'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300'
                                    }`}
                            >
                                {user.status}
                            </span>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                Joined Date
                            </label>
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                                {user.joinedDate}
                            </p>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                Last Active
                            </label>
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                                {user.lastActive}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
