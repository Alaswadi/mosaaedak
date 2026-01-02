import { useLanguage } from '../../contexts/LanguageContext';

interface ServerStatusProps {
    health: string;
    uptime: string;
    lastCheck: string;
}

export function ServerStatus({ health, uptime, lastCheck }: ServerStatusProps) {
    const { t } = useLanguage();
    const isGood = health.toLowerCase() === 'good';

    return (
        <div className="card p-6">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">{t('widgets.serverStatus')}</h3>

            <div className="flex flex-col items-center justify-center py-4">
                {/* Concentric rings */}
                <div className="relative flex h-40 w-40 items-center justify-center">
                    {/* Outer ring */}
                    <div
                        className={`absolute h-full w-full rounded-full ${isGood
                            ? 'border-4 border-primary-200 dark:border-primary-900/50'
                            : 'border-4 border-red-200 dark:border-red-900/50'
                            }`}
                    />

                    {/* Middle ring */}
                    <div
                        className={`absolute h-4/5 w-4/5 rounded-full ${isGood
                            ? 'border-4 border-primary-300 dark:border-primary-800/50'
                            : 'border-4 border-red-300 dark:border-red-800/50'
                            }`}
                    />

                    {/* Inner ring */}
                    <div
                        className={`absolute h-3/5 w-3/5 rounded-full ${isGood
                            ? 'border-4 border-primary-400 dark:border-primary-700/50'
                            : 'border-4 border-red-400 dark:border-red-700/50'
                            }`}
                    />

                    {/* Center icon */}
                    <div
                        className={`relative flex h-16 w-16 items-center justify-center rounded-full ${isGood
                            ? 'bg-primary-100 dark:bg-primary-900/30'
                            : 'bg-red-100 dark:bg-red-900/30'
                            }`}
                    >
                        <svg
                            className={`h-8 w-8 ${isGood ? 'text-primary-500' : 'text-red-500'}`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                            />
                        </svg>
                    </div>

                    {/* Pulse animation when good */}
                    {isGood && (
                        <div className="absolute h-full w-full animate-ping rounded-full border-2 border-primary-400 opacity-20" />
                    )}
                </div>

                {/* Status info */}
                <div className="mt-6 space-y-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <span
                            className={`h-2.5 w-2.5 rounded-full ${isGood ? 'bg-primary-500' : 'bg-red-500'
                                }`}
                        />
                        <span className="font-semibold text-neutral-900 dark:text-neutral-50">
                            {health}
                        </span>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {t('serverStatus.uptime')}: {uptime}
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        {t('serverStatus.lastCheck')}: {lastCheck}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ServerStatus;
