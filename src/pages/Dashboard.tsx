import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/widgets/StatsCard';
import TotalQueriesChart from '../components/widgets/TotalQueriesChart';
import UserEngagementChart from '../components/widgets/UserEngagementChart';
import ServerStatus from '../components/widgets/ServerStatus';
import LiveChatLogs from '../components/widgets/LiveChatLogs';
import { useLanguage } from '../contexts/LanguageContext';
import {
    statsData,
    queriesChartData,
    userEngagementData,
    chatLogsData,
    serverStatus,
} from '../data/dashboardData';

export function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { t, isRTL } = useLanguage();
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<any>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // In a real app we would use an API client, but fetch is fine for now
                const token = localStorage.getItem('token');
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/analytics?days=30`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setDashboardData(data);
                }
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-neutral-100 dark:bg-neutral-900">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    // Transform backend data to frontend props
    const stats = dashboardData ? [
        {
            id: 'total-queries',
            label: 'Total Queries',
            value: dashboardData.stats.totalQueries,
            icon: 'queries' as const,
            trend: dashboardData.stats.queriesGrowth,
        },
        {
            id: 'active-users',
            label: 'Active Users',
            value: dashboardData.stats.activeUsers,
            icon: 'users' as const,
            trend: dashboardData.stats.usersGrowth,
        },
        {
            id: 'success-rate',
            label: 'Success Rate',
            value: `${dashboardData.stats.successRate}%`,
            icon: 'success' as const,
            trend: dashboardData.stats.successGrowth,
        },
        {
            id: 'avg-response',
            label: 'Avg Response',
            value: `${dashboardData.stats.avgResponse}s`,
            icon: 'response' as const,
            trend: dashboardData.stats.responseGrowth,
        },
    ] : statsData;

    // Transform chart data (daily stats to chart points)
    // Backend returns [{ date: '2023-01-01', count: 10 }]
    // We need to map it to format relevant for chart.
    // If we want monthly, backend needs to aggregate by month or we do it here. 
    // Given the task is to show *something* live, let's just map the daily data to a format the chart can accept, 
    // OR just stick to mocked chart for now if data is sparse?
    // Best effort: show daily data if available, otherwise fallback or empty.
    const queriesChart = dashboardData && dashboardData.chartData ?
        dashboardData.chartData.map((d: any) => ({
            date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: Number(d.count) // Ensure number
        })) : queriesChartData;

    const userEngagement = dashboardData ? [
        { name: 'New Users', value: dashboardData.userEngagement.newUsers, color: 'accent-yellow' },
        { name: 'Returning Users', value: dashboardData.userEngagement.returningUsers, color: 'accent-blue' },
    ] : userEngagementData;

    const chatLogs = dashboardData ? dashboardData.recentLogs.map((log: any) => ({
        id: log.id,
        name: log.user, // Or tenant business name if we prefer
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(log.tenant)}&background=random`,
        message: log.message,
        time: new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })) : chatLogsData;


    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

            {/* Main content */}
            <main className={`min-h-screen ${isRTL ? 'lg:mr-70' : 'lg:ml-70'}`}>
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-white/80 px-6 backdrop-blur-sm dark:bg-neutral-800/80 lg:px-8">
                    <div className={isRTL ? 'mr-12 lg:mr-0' : 'ml-12 lg:ml-0'}>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{t('dashboard.title')}</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('dashboard.welcome')}</p>
                    </div>

                    {/* Search bar - hidden on mobile */}
                    <div className="hidden md:block">
                        <div className="relative">
                            <svg
                                className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400 ${isRTL ? 'right-3' : 'left-3'}`}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder={t('common.search')}
                                className={`w-64 rounded-lg border border-neutral-200 bg-neutral-50 py-2 text-sm placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder-neutral-500 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                            />
                        </div>
                    </div>
                </header>

                {/* Dashboard content */}
                <div className="p-6 lg:p-8">
                    {/* Grid layout */}
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                        {/* Stats cards - 4 columns on desktop */}
                        {stats.map((stat: any) => (
                            <StatsCard key={stat.id} data={stat} />
                        ))}
                    </div>

                    {/* Charts row */}
                    <div className="mt-6 grid gap-6 lg:grid-cols-12">
                        {/* Total Queries Chart - 8 cols on desktop */}
                        <div className="lg:col-span-8">
                            <TotalQueriesChart data={queriesChart} />
                        </div>

                        {/* User Engagement - 4 cols on desktop */}
                        <div className="lg:col-span-4">
                            <UserEngagementChart data={userEngagement} />
                        </div>
                    </div>

                    {/* Bottom row */}
                    <div className="mt-6 grid gap-6 lg:grid-cols-12">
                        {/* Server Status - 4 cols on desktop */}
                        <div className="lg:col-span-4">
                            <ServerStatus
                                health={serverStatus.health}
                                uptime={serverStatus.uptime}
                                lastCheck={serverStatus.lastCheck}
                            />
                        </div>

                        {/* Live Chat Logs - 8 cols on desktop */}
                        <div className="lg:col-span-8">
                            <LiveChatLogs logs={chatLogs} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
