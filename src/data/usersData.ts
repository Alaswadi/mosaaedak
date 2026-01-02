// Mock data for Users page

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    status: 'active' | 'inactive';
    lastActive: string;
    joinedDate: string;
    conversationsCount: number;
    messagesCount: number;
}

export interface UserStats {
    id: string;
    label: string;
    value: number | string;
    icon: 'users' | 'active' | 'new' | 'messages';
    trend?: number;
}

// User statistics for stats cards
export const userStatsData: UserStats[] = [
    {
        id: 'total-users',
        label: 'Total Users',
        value: 2847,
        icon: 'users',
        trend: 12.5,
    },
    {
        id: 'active-today',
        label: 'Active Today',
        value: 423,
        icon: 'active',
        trend: 8.2,
    },
    {
        id: 'new-this-week',
        label: 'New This Week',
        value: 156,
        icon: 'new',
        trend: 23.1,
    },
    {
        id: 'avg-messages',
        label: 'Avg Messages/User',
        value: 14.3,
        icon: 'messages',
        trend: -2.4,
    },
];

// Mock users list
export const usersData: User[] = [
    {
        id: '1',
        name: 'Ahmed Mohamed',
        email: 'ahmed.mohamed@email.com',
        phone: '+966 50 123 4567',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
        status: 'active',
        lastActive: '2 min ago',
        joinedDate: 'Jan 15, 2024',
        conversationsCount: 24,
        messagesCount: 156,
    },
    {
        id: '2',
        name: 'Sara Al-Rashid',
        email: 'sara.rashid@email.com',
        phone: '+966 55 234 5678',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
        status: 'active',
        lastActive: '5 min ago',
        joinedDate: 'Feb 20, 2024',
        conversationsCount: 18,
        messagesCount: 89,
    },
    {
        id: '3',
        name: 'Omar Hassan',
        email: 'omar.hassan@email.com',
        phone: '+966 54 345 6789',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Omar',
        status: 'inactive',
        lastActive: '3 days ago',
        joinedDate: 'Dec 10, 2023',
        conversationsCount: 42,
        messagesCount: 312,
    },
    {
        id: '4',
        name: 'Fatima Ali',
        email: 'fatima.ali@email.com',
        phone: '+966 56 456 7890',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima',
        status: 'active',
        lastActive: '15 min ago',
        joinedDate: 'Mar 5, 2024',
        conversationsCount: 12,
        messagesCount: 67,
    },
    {
        id: '5',
        name: 'Khalid Ibrahim',
        email: 'khalid.ibrahim@email.com',
        phone: '+966 59 567 8901',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khalid',
        status: 'active',
        lastActive: '1 hour ago',
        joinedDate: 'Nov 28, 2023',
        conversationsCount: 35,
        messagesCount: 198,
    },
    {
        id: '6',
        name: 'Nora Abdullah',
        email: 'nora.abdullah@email.com',
        phone: '+966 58 678 9012',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nora',
        status: 'inactive',
        lastActive: '1 week ago',
        joinedDate: 'Oct 15, 2023',
        conversationsCount: 8,
        messagesCount: 45,
    },
    {
        id: '7',
        name: 'Youssef Mahmoud',
        email: 'youssef.m@email.com',
        phone: '+966 51 789 0123',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Youssef',
        status: 'active',
        lastActive: '30 min ago',
        joinedDate: 'Apr 1, 2024',
        conversationsCount: 7,
        messagesCount: 34,
    },
    {
        id: '8',
        name: 'Layla Saeed',
        email: 'layla.saeed@email.com',
        phone: '+966 52 890 1234',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Layla',
        status: 'active',
        lastActive: '45 min ago',
        joinedDate: 'Mar 22, 2024',
        conversationsCount: 16,
        messagesCount: 102,
    },
];
