import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';
import type { User, Tenant } from '../services/api';

interface AuthContextType {
    user: User | null;
    tenant: Tenant | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string, businessName: string) => Promise<void>;
    logout: () => void;
    refreshTenant: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const token = api.getToken();
        if (token) {
            loadUserData();
        } else {
            setIsLoading(false);
        }
    }, []);

    const loadUserData = async () => {
        try {
            const { user } = await api.getMe();
            setUser(user);
            if (user.tenant) {
                setTenant(user.tenant);
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
            api.logout();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const result = await api.login(email, password);
        setUser(result.user);
        if (result.user.tenant) {
            setTenant(result.user.tenant);
        } else if (result.user.role === 'CUSTOMER') {
            await refreshTenant();
        }
    };

    const register = async (email: string, password: string, name: string, businessName: string) => {
        const result = await api.register(email, password, name, businessName);
        setUser(result.user);
        if (result.user.tenant) {
            setTenant(result.user.tenant);
        }
    };

    const logout = () => {
        api.logout();
        setUser(null);
        setTenant(null);
    };

    const refreshTenant = async () => {
        if (user?.role === 'CUSTOMER') {
            try {
                const profile = await api.getTenantProfile();
                setTenant(profile);
            } catch (error) {
                console.error('Failed to refresh tenant:', error);
            }
        }
    };

    const value: AuthContextType = {
        user,
        tenant,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
        refreshTenant,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
