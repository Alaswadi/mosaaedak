const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Type definitions
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'CUSTOMER';
    tenantId?: string;
    tenant?: Tenant;
    phone?: string;
    createdAt?: string;
    lastLoginAt?: string;
    // Frontend specific fields
    avatar?: string;
    status?: 'active' | 'inactive' | 'ACTIVE' | 'PAUSED' | 'BANNED'; // Unify status types
    lastActive?: string;
    joinedDate?: string;
    messagesCount?: number;
    systemPrompt?: string;
    aiModel?: string;
}

export interface Tenant {
    id: string;
    businessName: string;
    walletBalance: number;
    status: 'ACTIVE' | 'PAUSED' | 'BANNED';
    systemPrompt?: string;
    aiModel: string;
    twilioPhone?: string;
    monthlyFee: number;
    nextBillingDate?: string;
    user?: User;
    createdAt?: string;
}

export interface PaymentTransaction {
    id: string;
    tenantId: string;
    amount: number;
    method: 'KURIMI' | 'USDT' | 'CASH';
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    proofPath?: string;
    createdAt: string;
    reviewedAt?: string;
    rejectionNotes?: string;
    tenant?: {
        businessName: string;
        user?: { name: string; email: string };
    };
}

export interface UsageLog {
    id: string;
    direction: 'INBOUND' | 'OUTBOUND';
    content: string;
    cost: number;
    createdAt: string;
}

export interface PaginatedResponse {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface Analytics {
    period: string;
    totalMessages: number;
    totalRevenue: number;
    activeTenants: number;
    pendingPayments: number;
    dailyStats: { date: string; count: number }[];
}

// API Client class
class ApiClient {
    private token: string | null = null;

    setToken(token: string | null) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    getToken(): string | null {
        if (!this.token) {
            this.token = localStorage.getItem('token');
        }
        return this.token;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const headers: HeadersInit = {
            ...options.headers,
        };

        // Add JSON content type for non-FormData requests
        if (!(options.body instanceof FormData)) {
            (headers as Record<string, string>)['Content-Type'] = 'application/json';
        }

        // Add auth token
        const token = this.getToken();
        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    }

    // Auth endpoints
    async register(email: string, password: string, name: string, businessName: string) {
        const result = await this.request<{ user: User; token: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name, businessName }),
        });
        this.setToken(result.token);
        return result;
    }

    async login(email: string, password: string) {
        const result = await this.request<{ user: User; token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        this.setToken(result.token);
        return result;
    }

    async getMe() {
        return this.request<{ user: User }>('/auth/me');
    }

    logout() {
        this.setToken(null);
    }

    // Tenant endpoints
    async getTenantProfile() {
        return this.request<Tenant & { user: { name: string; email: string; phone?: string } }>('/tenant/profile');
    }

    async getWalletBalance() {
        return this.request<{ balance: number }>('/tenant/wallet');
    }

    async updateBotConfig(systemPrompt?: string, aiModel?: string) {
        return this.request<{ systemPrompt: string; aiModel: string }>('/tenant/bot-config', {
            method: 'PATCH',
            body: JSON.stringify({ systemPrompt, aiModel }),
        });
    }

    async updateTwilioCredentials(twilioSid: string, twilioToken: string, twilioPhone: string) {
        return this.request<{ twilioSid: string; twilioPhone: string }>('/tenant/twilio', {
            method: 'PATCH',
            body: JSON.stringify({ twilioSid, twilioToken, twilioPhone }),
        });
    }

    async getUsageLogs(page = 1, limit = 50) {
        return this.request<{ logs: UsageLog[] } & PaginatedResponse>(
            `/tenant/usage?page=${page}&limit=${limit}`
        );
    }

    async getTenantStats(days = 30) {
        return this.request<{
            period: string;
            totalMessages: number;
            inboundMessages: number;
            outboundMessages: number;
            totalCost: number;
        }>(`/tenant/stats?days=${days}`);
    }

    // Payment endpoints
    async requestTopUp(amount: number, method: string, proofFile?: File) {
        const formData = new FormData();
        formData.append('amount', amount.toString());
        formData.append('method', method);
        if (proofFile) {
            formData.append('proof', proofFile);
        }

        return this.request<{ message: string; transaction: PaymentTransaction }>(
            '/payments/customer/topup',
            {
                method: 'POST',
                body: formData,
            }
        );
    }

    async getPaymentHistory(page = 1, limit = 20) {
        return this.request<{ transactions: PaymentTransaction[] } & PaginatedResponse>(
            `/payments/customer/history?page=${page}&limit=${limit}`
        );
    }

    // Admin endpoints
    async getAnalytics(days = 30) {
        return this.request<Analytics>(`/admin/analytics?days=${days}`);
    }

    async getPendingPayments(page = 1, limit = 20) {
        return this.request<{ transactions: PaymentTransaction[] } & PaginatedResponse>(
            `/payments/admin/pending?page=${page}&limit=${limit}`
        );
    }

    async getAllPayments(page = 1, limit = 20, status?: string) {
        let url = `/payments/admin/all?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        return this.request<{ transactions: PaymentTransaction[] } & PaginatedResponse>(url);
    }

    async reviewPayment(id: string, status: 'APPROVED' | 'REJECTED', notes?: string) {
        return this.request<{ message: string; transaction: PaymentTransaction; newBalance?: number }>(
            `/payments/admin/${id}/review`,
            {
                method: 'POST',
                body: JSON.stringify({ status, notes }),
            }
        );
    }

    async getTenants(page = 1, limit = 20, status?: string) {
        let url = `/admin/tenants?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        return this.request<{ tenants: (Tenant & { user?: User })[] } & PaginatedResponse>(url);
    }

    async createTenant(data: { email: string; password: string; name: string; businessName: string; phone?: string; initialPayment?: number; paymentMethod?: string }) {
        return this.request<{ message: string; user: User }>('/admin/tenants', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async adminTopUp(tenantId: string, amount: number, method: string, notes?: string) {
        return this.request<{ message: string; transaction: PaymentTransaction; newBalance: number }>(
            `/admin/tenants/${tenantId}/topup`,
            {
                method: 'POST',
                body: JSON.stringify({ amount, method, notes }),
            }
        );
    }

    async getTenantDetails(id: string) {
        return this.request<Tenant & { user: User }>(`/admin/tenants/${id}`);
    }

    async updateTenant(id: string, data: { name?: string; email?: string; phone?: string; businessName?: string; password?: string; status?: 'ACTIVE' | 'PAUSED' | 'BANNED'; systemPrompt?: string; aiModel?: string }) {
        return this.request<{ message: string; tenant: Tenant }>(`/admin/tenants/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async uploadTenantImage(tenantId: string, file: File) {
        const formData = new FormData();
        formData.append('image', file);

        return this.request<{ url: string }>(`/admin/tenants/${tenantId}/upload-image`, {
            method: 'POST',
            body: formData,
        });
    }

    async updateTenantStatus(id: string, status: 'ACTIVE' | 'PAUSED' | 'BANNED') {
        return this.request<{ message: string; tenant: Tenant }>(
            `/admin/tenants/${id}/status`,
            {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            }
        );
    }
}

export const api = new ApiClient();
export default api;
