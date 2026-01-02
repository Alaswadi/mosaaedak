// Sample data for the mosaaedak dashboard
// Keep this data separate from components for cleaner code

export interface StatsData {
    id: string;
    label: string;
    value: number | string;
    icon: 'queries' | 'users' | 'success' | 'response';
    trend?: number;
}

export interface ChartDataPoint {
    date: string;
    value: number;
}

export interface UserSegment {
    name: string;
    value: number;
    color: string;
}

export interface ChatLog {
    id: string;
    name: string;
    avatar: string;
    message: string;
    time: string;
}

// Stats cards data
export const statsData: StatsData[] = [
    {
        id: 'total-queries',
        label: 'Total Queries',
        value: 45892,
        icon: 'queries',
        trend: 12.5,
    },
    {
        id: 'active-users',
        label: 'Active Users',
        value: 2341,
        icon: 'users',
        trend: 8.2,
    },
    {
        id: 'success-rate',
        label: 'Success Rate',
        value: '94.2%',
        icon: 'success',
        trend: 3.1,
    },
    {
        id: 'avg-response',
        label: 'Avg Response',
        value: '1.2s',
        icon: 'response',
        trend: -5.3,
    },
];

// Line chart data for total queries
export const queriesChartData: ChartDataPoint[] = [
    { date: 'Jan', value: 4000 },
    { date: 'Feb', value: 3000 },
    { date: 'Mar', value: 5000 },
    { date: 'Apr', value: 4500 },
    { date: 'May', value: 6000 },
    { date: 'Jun', value: 8000 },
    { date: 'Jul', value: 7500 },
    { date: 'Aug', value: 9000 },
    { date: 'Sep', value: 10500 },
    { date: 'Oct', value: 11000 },
    { date: 'Nov', value: 12000 },
    { date: 'Dec', value: 13500 },
];

// User engagement donut chart data
export const userEngagementData: UserSegment[] = [
    { name: 'New Users', value: 35, color: 'accent-yellow' },
    { name: 'Old Users', value: 65, color: 'accent-blue' },
];

// Live chat logs
export const chatLogsData: ChatLog[] = [
    {
        id: '1',
        name: 'Ahmed Hassan',
        avatar: 'https://ui-avatars.com/api/?name=Ahmed+Hassan&background=22c55e&color=fff',
        message: 'How do I reset my password?',
        time: '2 min ago',
    },
    {
        id: '2',
        name: 'Sara Ali',
        avatar: 'https://ui-avatars.com/api/?name=Sara+Ali&background=f97316&color=fff',
        message: 'Thank you for helping!',
        time: '5 min ago',
    },
    {
        id: '3',
        name: 'Mohammed Omar',
        avatar: 'https://ui-avatars.com/api/?name=Mohammed+Omar&background=3b82f6&color=fff',
        message: 'Can I change my subscription?',
        time: '8 min ago',
    },
    {
        id: '4',
        name: 'Fatima Khalid',
        avatar: 'https://ui-avatars.com/api/?name=Fatima+Khalid&background=eab308&color=fff',
        message: 'The bot is very helpful!',
        time: '12 min ago',
    },
    {
        id: '5',
        name: 'Youssef Ibrahim',
        avatar: 'https://ui-avatars.com/api/?name=Youssef+Ibrahim&background=ef4444&color=fff',
        message: 'Need help with integration',
        time: '15 min ago',
    },
];

// Server status data
export const serverStatus = {
    health: 'Good',
    uptime: '99.9%',
    lastCheck: 'Just now',
};

// Navigation items for sidebar
export const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { id: 'conversations', label: 'Conversations', icon: 'chat', path: '/conversations' },
    { id: 'users', label: 'Users', icon: 'users', path: '/users' },
    { id: 'analytics', label: 'Analytics', icon: 'chart', path: '/analytics' },
    { id: 'settings', label: 'Settings', icon: 'settings', path: '/settings' },
];
