export interface ApiError {
    message: string;
    code?: string;
    status: number;
}
export declare class MainlayerApiError extends Error {
    readonly status: number;
    readonly code?: string;
    constructor(message: string, status: number, code?: string);
}
export interface Vendor {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}
export interface Resource {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    category: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface Payment {
    id: string;
    resourceId: string;
    resourceName: string;
    amount: number;
    currency: string;
    status: 'succeeded' | 'pending' | 'failed';
    wallet: string;
    createdAt: string;
}
export interface AnalyticsSummary {
    totalRevenue: number;
    currency: string;
    totalPayments: number;
    successRate: number;
    byDay: Array<{
        date: string;
        revenue: number;
        payments: number;
    }>;
    topResources: Array<{
        id: string;
        name: string;
        revenue: number;
    }>;
}
export interface Webhook {
    id: string;
    url: string;
    events: string[];
    isActive: boolean;
    secret: string;
    createdAt: string;
}
export interface ApiKey {
    id: string;
    name: string;
    prefix: string;
    createdAt: string;
    lastUsedAt?: string;
    isActive: boolean;
}
export interface Entitlement {
    wallet: string;
    resourceId: string;
    hasAccess: boolean;
    expiresAt?: string;
    purchasedAt?: string;
}
export interface PayResponse {
    paymentId: string;
    status: string;
    amount: number;
    currency: string;
    resourceId: string;
    wallet?: string;
    createdAt: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    perPage: number;
}
export declare class MainlayerApi {
    private readonly apiKey;
    constructor(apiKey: string);
    private get;
    private post;
    private delete;
    whoami(): Promise<Vendor>;
    listResources(params?: {
        page?: number;
        perPage?: number;
    }): Promise<PaginatedResponse<Resource>>;
    getResource(id: string): Promise<Resource>;
    createResource(data: {
        name: string;
        description: string;
        price: number;
        currency: string;
        category: string;
    }): Promise<Resource>;
    deleteResource(id: string): Promise<{
        success: boolean;
    }>;
    discoverResources(query?: string): Promise<PaginatedResponse<Resource>>;
    listPayments(params?: {
        page?: number;
        perPage?: number;
    }): Promise<PaginatedResponse<Payment>>;
    payForResource(resourceId: string, data: {
        wallet?: string;
    }): Promise<PayResponse>;
    checkEntitlement(resourceId: string, wallet: string): Promise<Entitlement>;
    getAnalytics(): Promise<AnalyticsSummary>;
    listWebhooks(): Promise<Webhook[]>;
    createWebhook(data: {
        url: string;
        events: string[];
    }): Promise<Webhook>;
    deleteWebhook(id: string): Promise<{
        success: boolean;
    }>;
    listApiKeys(): Promise<ApiKey[]>;
    createApiKey(data: {
        name: string;
    }): Promise<ApiKey & {
        key: string;
    }>;
    revokeApiKey(id: string): Promise<{
        success: boolean;
    }>;
}
export declare function createApiClient(apiKey?: string): MainlayerApi;
//# sourceMappingURL=api.d.ts.map