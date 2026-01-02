import { useLanguage } from '../../contexts/LanguageContext';
import type { ChatLog } from '../../data/dashboardData';

interface LiveChatLogsProps {
    logs: ChatLog[];
}

export function LiveChatLogs({ logs }: LiveChatLogsProps) {
    const { t } = useLanguage();

    return (
        <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">{t('widgets.liveChatLogs')}</h3>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary-500" />
                    </span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">{t('common.live')}</span>
                </div>
            </div>

            <div className="space-y-1">
                {logs.map((log) => (
                    <div
                        key={log.id}
                        className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                    >
                        {/* Avatar */}
                        <img
                            src={log.avatar}
                            alt={log.name}
                            className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                            <p className="font-medium text-neutral-900 dark:text-neutral-50">{log.name}</p>
                            <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                                {log.message}
                            </p>
                        </div>

                        {/* Time */}
                        <span className="shrink-0 text-sm text-blue-500 dark:text-blue-400">
                            {log.time}
                        </span>
                    </div>
                ))}
            </div>

            {/* View all link */}
            <div className="mt-4 text-center">
                <button className="text-sm font-medium text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300">
                    {t('widgets.viewAllConversations')}
                </button>
            </div>
        </div>
    );
}

export default LiveChatLogs;
