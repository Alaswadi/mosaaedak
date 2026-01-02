import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import UserStatsCards from '../components/widgets/UserStatsCards';
import UsersTable from '../components/widgets/UsersTable';
import { useLanguage } from '../contexts/LanguageContext';
import { userStatsData, usersData } from '../data/usersData';

export function Users() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { t, isRTL } = useLanguage();

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

            {/* Main content */}
            <main className={`min-h-screen ${isRTL ? 'lg:mr-70' : 'lg:ml-70'}`}>
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-white/80 px-6 backdrop-blur-sm dark:bg-neutral-800/80 lg:px-8">
                    <div className={isRTL ? 'mr-12 lg:mr-0' : 'ml-12 lg:ml-0'}>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{t('users.title')}</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('users.subtitle')}</p>
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
                                placeholder={t('users.searchPlaceholder')}
                                className={`w-64 rounded-lg border border-neutral-200 bg-neutral-50 py-2 text-sm placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder-neutral-500 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                            />
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <div className="p-6 lg:p-8">
                    {/* Stats cards */}
                    <UserStatsCards stats={userStatsData} />

                    {/* Users table */}
                    <div className="mt-6">
                        <UsersTable users={usersData} />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Users;
