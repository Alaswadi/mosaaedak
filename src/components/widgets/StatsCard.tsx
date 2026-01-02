import { useLanguage } from '../../contexts/LanguageContext';
import type { StatsData } from '../../data/dashboardData';

// Icon components for stats cards
function QueriesIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
    );
}

function UsersIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    );
}

function SuccessIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function ResponseIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

const iconConfig: Record<string, { icon: React.FC<{ className?: string }>; bgClass: string; iconClass: string }> = {
    queries: {
        icon: QueriesIcon,
        bgClass: 'bg-secondary-100 dark:bg-secondary-900/30',
        iconClass: 'text-secondary-500',
    },
    users: {
        icon: UsersIcon,
        bgClass: 'bg-primary-100 dark:bg-primary-900/30',
        iconClass: 'text-primary-500',
    },
    success: {
        icon: SuccessIcon,
        bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
        iconClass: 'text-yellow-500',
    },
    response: {
        icon: ResponseIcon,
        bgClass: 'bg-blue-100 dark:bg-blue-900/30',
        iconClass: 'text-blue-500',
    },
};

// Map stat IDs to translation keys
const statTranslationKeys: Record<string, string> = {
    'total-queries': 'stats.totalQueries',
    'active-users': 'stats.activeUsers',
    'success-rate': 'stats.successRate',
    'avg-response': 'stats.avgResponse',
};

interface StatsCardProps {
    data: StatsData;
}

export function StatsCard({ data }: StatsCardProps) {
    const { t } = useLanguage();
    const config = iconConfig[data.icon] || iconConfig.queries;
    const Icon = config.icon;

    const formatValue = (value: number | string) => {
        if (typeof value === 'number') {
            return value.toLocaleString();
        }
        return value;
    };

    // Get translated label or fallback to original
    const label = statTranslationKeys[data.id] ? t(statTranslationKeys[data.id]) : data.label;

    return (
        <div className="card card-hover flex items-center gap-4 p-6">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${config.bgClass}`}>
                <Icon className={`h-7 w-7 ${config.iconClass}`} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                    {formatValue(data.value)}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
            </div>
            {data.trend !== undefined && (
                <div
                    className={`flex items-center gap-1 text-sm font-medium ${data.trend >= 0 ? 'text-primary-500' : 'text-red-500'
                        }`}
                >
                    {data.trend >= 0 ? (
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    )}
                    <span>{Math.abs(data.trend)}%</span>
                </div>
            )}
        </div>
    );
}

export default StatsCard;
