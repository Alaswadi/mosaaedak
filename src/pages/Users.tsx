import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import UserStatsCards from '../components/widgets/UserStatsCards';
import UsersTable from '../components/widgets/UsersTable';
import { useLanguage } from '../contexts/LanguageContext';
import api, { type User } from '../services/api';
import { AddUserModal } from '../components/modals/AddUserModal';
import { EditUserModal } from '../components/modals/EditUserModal';
import { ViewUserModal } from '../components/modals/ViewUserModal';
import { AdminTopUpModal } from '../components/modals/AdminTopUpModal';

export function Users() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const { t, isRTL } = useLanguage();

    // Stats state
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        new: 0,
        avg: '0'
    });

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/users/analytics`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setStats({
                    total: data.totalUsers,
                    active: data.activeToday,
                    new: data.newThisWeek,
                    avg: data.avgMessagesPerUser
                });
            }
        } catch (error) {
            console.error('Failed to fetch user stats:', error);
        }
    };

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await api.getTenants();

            // Map API response to User interface
            const mappedUsers: User[] = response.tenants.map((tenant) => {
                const joinedDate = new Date(tenant.createdAt || Date.now()).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });

                return {
                    id: tenant.id,
                    name: tenant.businessName, // Display business name as primary name
                    email: tenant.user?.email || '',
                    role: tenant.user?.role || 'CUSTOMER',
                    phone: tenant.user?.phone || '',
                    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${tenant.businessName}`,
                    status: tenant.status === 'ACTIVE' ? 'active' : 'inactive',
                    lastActive: new Date(tenant.user?.lastLoginAt || Date.now()).toLocaleDateString(), // simplified for now
                    joinedDate: joinedDate,
                    conversationsCount: 0, // Placeholder
                    messagesCount: 0, // Placeholder
                    systemPrompt: tenant.systemPrompt,
                    aiModel: tenant.aiModel
                };
            });

            setUsers(mappedUsers);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, [fetchUsers]);

    const handleUserAdded = () => {
        fetchUsers();
    };

    const handleUserUpdated = () => {
        fetchUsers();
    };

    const onEditUser = (user: User) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const onViewUser = (user: User) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    const onTopUpUser = (user: User) => {
        setSelectedUser(user);
        setIsTopUpModalOpen(true);
    };

    const navigate = useNavigate();
    const onManageBot = (user: User) => {
        navigate(`/admin/users/${user.id}/bot-config`);
    };

    // Map stats to card format
    const statsData = [
        {
            id: 'total-users',
            label: 'Total Users',
            value: stats.total.toLocaleString(),
            icon: 'users' as const,
            trend: 12.5 // Mock growth for now
        },
        {
            id: 'active-today',
            label: 'Active Today',
            value: stats.active.toLocaleString(),
            icon: 'active' as const,
            trend: 8.2 // Mock growth
        },
        {
            id: 'new-active',
            label: 'New This Week',
            value: stats.new.toLocaleString(),
            icon: 'new' as const,
            trend: 23.1 // Mock growth
        },
        {
            id: 'avg-messages',
            label: 'Avg Messages/User',
            value: stats.avg,
            icon: 'messages' as const,
            trend: -2.4 // Mock growth
        }
    ];

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
                    <UserStatsCards stats={statsData} />

                    {/* Users table */}
                    <div className="mt-6">
                        {isLoading ? (
                            <div className="flex justify-center p-12">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
                            </div>
                        ) : (
                            <UsersTable
                                users={users}
                                onAddUser={() => setIsAddModalOpen(true)}
                                onViewUser={onViewUser}
                                onEditUser={onEditUser}
                                onTopUp={onTopUpUser}
                                onManageBot={onManageBot}
                            />
                        )}
                    </div>
                </div>
            </main>

            {/* Add User Modal */}
            <AddUserModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onUserAdded={handleUserAdded}
            />

            {/* Edit User Modal */}
            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onUserUpdated={handleUserUpdated}
                user={selectedUser}
            />

            {/* View User Modal */}
            <ViewUserModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                user={selectedUser}
            />

            {/* Admin Top Up Modal */}
            <AdminTopUpModal
                isOpen={isTopUpModalOpen}
                onClose={() => setIsTopUpModalOpen(false)}
                onSuccess={handleUserUpdated}
                user={selectedUser}
            />
        </div>
    );
}

export default Users;
