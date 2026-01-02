import { useLanguage } from '../../contexts/LanguageContext';
import type { UserStats } from '../../data/usersData';

// Icon components for user stats
function UsersIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    );
}

function ActiveIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
    );
}

function NewUserIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
    );
}

function MessagesIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    );
}

const iconConfig: Record<string, { icon: React.FC<{ className?: string }>; bgClass: string; iconClass: string }> = {
    users: {
        icon: UsersIcon,
        bgClass: 'bg-primary-100 dark:bg-primary-900/30',
        iconClass: 'text-primary-500',
    },
    active: {
        icon: ActiveIcon,
        bgClass: 'bg-blue-100 dark:bg-blue-900/30',
        iconClass: 'text-blue-500',
    },
    new: {
        icon: NewUserIcon,
        bgClass: 'bg-secondary-100 dark:bg-secondary-900/30',
        iconClass: 'text-secondary-500',
    },
    messages: {
        icon: MessagesIcon,
        bgClass: 'bg-purple-100 dark:bg-purple-900/30',
        iconClass: 'text-purple-500',
    },
};

// Map stat IDs to translation keys
const statTranslationKeys: Record<string, string> = {
    'total-users': 'users.stats.totalUsers',
    'active-today': 'users.stats.activeToday',
    'new-this-week': 'users.stats.newThisWeek',
    'avg-messages': 'users.stats.avgMessages',
};

interface UserStatsCardsProps {
    stats: UserStats[];
}

export function UserStatsCards({ stats }: UserStatsCardsProps) {
    const { t } = useLanguage();

    const formatValue = (value: number | string) => {
        if (typeof value === 'number') {
            return value.toLocaleString();
        }
        return value;
    };

    return (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
                const config = iconConfig[stat.icon] || iconConfig.users;
                const Icon = config.icon;
                const label = statTranslationKeys[stat.id] ? t(statTranslationKeys[stat.id]) : stat.label;

                return (
                    <div key={stat.id} className="card card-hover flex items-center gap-4 p-6">
                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${config.bgClass}`}>
                            <Icon className={`h-7 w-7 ${config.iconClass}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                                {formatValue(stat.value)}
                            </p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
                        </div>
                        {stat.trend !== undefined && (
                            <div
                                className={`flex items-center gap-1 text-sm font-medium ${stat.trend >= 0 ? 'text-primary-500' : 'text-red-500'
                                    }`}
                            >
                                {stat.trend >= 0 ? (
                                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                                <span>{Math.abs(stat.trend)}%</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default UserStatsCards;
