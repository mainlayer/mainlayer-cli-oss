import fetch from 'node-fetch';
import { getApiKey, getBaseUrl } from './config.js';

export interface ApiError {
  message: string;
  code?: string;
  status: number;
}

export class MainlayerApiError extends Error {
  public readonly status: number;
  public readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'MainlayerApiError';
    this.status = status;
    this.code = code;
  }
}

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

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
  byDay: Array<{ date: string; revenue: number; payments: number }>;
  topResources: Array<{ id: string; name: string; revenue: number }>;
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

// ---------------------------------------------------------------------------
// HTTP client
// ---------------------------------------------------------------------------

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  apiKey?: string,
): Promise<T> {
  const key = apiKey ?? getApiKey();
  if (!key) {
    throw new MainlayerApiError(
      'No API key configured. Run `mainlayer login` or set MAINLAYER_API_KEY.',
      401,
      'UNAUTHENTICATED',
    );
  }

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    'User-Agent': 'mainlayer-cli/1.0.0',
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let json: unknown;

  try {
    json = JSON.parse(text);
  } catch {
    if (!response.ok) {
      throw new MainlayerApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
      );
    }
    return text as unknown as T;
  }

  if (!response.ok) {
    const err = json as { message?: string; error?: string; code?: string };
    throw new MainlayerApiError(
      err.message ?? err.error ?? `HTTP ${response.status}`,
      response.status,
      err.code,
    );
  }

  return json as T;
}

// ---------------------------------------------------------------------------
// API client
// ---------------------------------------------------------------------------

export class MainlayerApi {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private get<T>(path: string): Promise<T> {
    return request<T>('GET', path, undefined, this.apiKey);
  }

  private post<T>(path: string, body: unknown): Promise<T> {
    return request<T>('POST', path, body, this.apiKey);
  }

  private delete<T>(path: string): Promise<T> {
    return request<T>('DELETE', path, undefined, this.apiKey);
  }

  // Vendor / auth
  whoami(): Promise<Vendor> {
    return this.get<Vendor>('/v1/vendors/me');
  }

  // Resources
  listResources(params?: {
    page?: number;
    perPage?: number;
  }): Promise<PaginatedResponse<Resource>> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.perPage) qs.set('per_page', String(params.perPage));
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return this.get<PaginatedResponse<Resource>>(`/v1/resources${query}`);
  }

  getResource(id: string): Promise<Resource> {
    return this.get<Resource>(`/v1/resources/${id}`);
  }

  createResource(data: {
    name: string;
    description: string;
    price: number;
    currency: string;
    category: string;
  }): Promise<Resource> {
    return this.post<Resource>('/v1/resources', data);
  }

  deleteResource(id: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`/v1/resources/${id}`);
  }

  // Discover (public — uses same key for rate-limit identity)
  discoverResources(query?: string): Promise<PaginatedResponse<Resource>> {
    const qs = new URLSearchParams();
    if (query) qs.set('q', query);
    const q = qs.toString() ? `?${qs.toString()}` : '';
    return this.get<PaginatedResponse<Resource>>(`/v1/discover${q}`);
  }

  // Payments
  listPayments(params?: {
    page?: number;
    perPage?: number;
  }): Promise<PaginatedResponse<Payment>> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.perPage) qs.set('per_page', String(params.perPage));
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return this.get<PaginatedResponse<Payment>>(`/v1/payments${query}`);
  }

  payForResource(
    resourceId: string,
    data: { wallet?: string },
  ): Promise<PayResponse> {
    return this.post<PayResponse>(`/v1/resources/${resourceId}/pay`, data);
  }

  checkEntitlement(resourceId: string, wallet: string): Promise<Entitlement> {
    return this.get<Entitlement>(
      `/v1/resources/${resourceId}/entitlement?wallet=${encodeURIComponent(wallet)}`,
    );
  }

  // Analytics
  getAnalytics(): Promise<AnalyticsSummary> {
    return this.get<AnalyticsSummary>('/v1/analytics');
  }

  // Webhooks
  listWebhooks(): Promise<Webhook[]> {
    return this.get<Webhook[]>('/v1/webhooks');
  }

  createWebhook(data: { url: string; events: string[] }): Promise<Webhook> {
    return this.post<Webhook>('/v1/webhooks', data);
  }

  deleteWebhook(id: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`/v1/webhooks/${id}`);
  }

  // API Keys
  listApiKeys(): Promise<ApiKey[]> {
    return this.get<ApiKey[]>('/v1/keys');
  }

  createApiKey(data: { name: string }): Promise<ApiKey & { key: string }> {
    return this.post<ApiKey & { key: string }>('/v1/keys', data);
  }

  revokeApiKey(id: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`/v1/keys/${id}`);
  }
}

export function createApiClient(apiKey?: string): MainlayerApi {
  const key = apiKey ?? getApiKey();
  if (!key) {
    throw new MainlayerApiError(
      'No API key configured. Run `mainlayer login` or set MAINLAYER_API_KEY.',
      401,
      'UNAUTHENTICATED',
    );
  }
  return new MainlayerApi(key);
}
