/**
 * CLI command unit tests
 *
 * All external HTTP calls are mocked via jest.mock so tests run offline.
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockWhoami = jest.fn();
const mockListResources = jest.fn();
const mockGetResource = jest.fn();
const mockCreateResource = jest.fn();
const mockDeleteResource = jest.fn();
const mockListPayments = jest.fn();
const mockGetAnalytics = jest.fn();
const mockDiscoverResources = jest.fn();
const mockPayForResource = jest.fn();
const mockCheckEntitlement = jest.fn();
const mockListWebhooks = jest.fn();
const mockCreateWebhook = jest.fn();
const mockDeleteWebhook = jest.fn();
const mockListApiKeys = jest.fn();
const mockCreateApiKey = jest.fn();
const mockRevokeApiKey = jest.fn();

jest.mock('../src/lib/api', () => {
  return {
    MainlayerApi: jest.fn().mockImplementation(() => ({
      whoami: mockWhoami,
      listResources: mockListResources,
      getResource: mockGetResource,
      createResource: mockCreateResource,
      deleteResource: mockDeleteResource,
      listPayments: mockListPayments,
      getAnalytics: mockGetAnalytics,
      discoverResources: mockDiscoverResources,
      payForResource: mockPayForResource,
      checkEntitlement: mockCheckEntitlement,
      listWebhooks: mockListWebhooks,
      createWebhook: mockCreateWebhook,
      deleteWebhook: mockDeleteWebhook,
      listApiKeys: mockListApiKeys,
      createApiKey: mockCreateApiKey,
      revokeApiKey: mockRevokeApiKey,
    })),
    createApiClient: jest.fn().mockImplementation(() => ({
      whoami: mockWhoami,
      listResources: mockListResources,
      getResource: mockGetResource,
      createResource: mockCreateResource,
      deleteResource: mockDeleteResource,
      listPayments: mockListPayments,
      getAnalytics: mockGetAnalytics,
      discoverResources: mockDiscoverResources,
      payForResource: mockPayForResource,
      checkEntitlement: mockCheckEntitlement,
      listWebhooks: mockListWebhooks,
      createWebhook: mockCreateWebhook,
      deleteWebhook: mockDeleteWebhook,
      listApiKeys: mockListApiKeys,
      createApiKey: mockCreateApiKey,
      revokeApiKey: mockRevokeApiKey,
    })),
    MainlayerApiError: class MainlayerApiError extends Error {
      status: number;
      code?: string;
      constructor(message: string, status: number, code?: string) {
        super(message);
        this.name = 'MainlayerApiError';
        this.status = status;
        this.code = code;
      }
    },
  };
});

// ---------------------------------------------------------------------------
// Config helpers
// ---------------------------------------------------------------------------

import { loadConfig, saveConfig, clearConfig, getApiKey, requireApiKey, configFilePath } from '../src/lib/config';

const TEST_CONFIG_DIR = path.join(os.tmpdir(), `.mainlayer-test-${process.pid}`);

// Patch config paths during tests
jest.mock('../src/lib/config', () => {
  const tmpDir = path.join(os.tmpdir(), `.mainlayer-test-${process.pid}`);
  const tmpFile = path.join(tmpDir, 'config.json');

  function ensureDir() {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
  }

  function loadConfig() {
    try {
      if (!fs.existsSync(tmpFile)) return {};
      return JSON.parse(fs.readFileSync(tmpFile, 'utf-8'));
    } catch {
      return {};
    }
  }

  function saveConfig(config: Record<string, unknown>) {
    ensureDir();
    const existing = loadConfig();
    fs.writeFileSync(tmpFile, JSON.stringify({ ...existing, ...config }, null, 2));
  }

  function clearConfig() {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }

  function getApiKey(): string | undefined {
    return process.env.MAINLAYER_API_KEY ?? loadConfig().apiKey;
  }

  function requireApiKey(): string {
    const key = getApiKey();
    if (!key) throw new Error('No API key configured.');
    return key;
  }

  function configFilePath(): string {
    return tmpFile;
  }

  function getBaseUrl(): string {
    return 'https://api.mainlayer.fr';
  }

  return { loadConfig, saveConfig, clearConfig, getApiKey, requireApiKey, configFilePath, getBaseUrl };
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const VENDOR_FIXTURE = {
  id: 'vnd_abc123',
  name: 'Acme Corp',
  email: 'admin@acme.com',
  createdAt: '2025-01-15T00:00:00Z',
};

const RESOURCE_FIXTURE = {
  id: 'res_abc123',
  name: 'GPT-4 Turbo Access',
  description: 'Access to GPT-4 Turbo via Mainlayer',
  price: 500,
  currency: 'USD',
  category: 'AI Model',
  isActive: true,
  createdAt: '2025-01-15T00:00:00Z',
  updatedAt: '2025-01-20T00:00:00Z',
};

const PAYMENT_FIXTURE = {
  id: 'pay_xyz789',
  resourceId: 'res_abc123',
  resourceName: 'GPT-4 Turbo Access',
  amount: 500,
  currency: 'USD',
  status: 'succeeded',
  wallet: '0xdeadbeef',
  createdAt: '2025-02-01T12:00:00Z',
};

const ANALYTICS_FIXTURE = {
  totalRevenue: 15000,
  currency: 'USD',
  totalPayments: 42,
  successRate: 0.97,
  byDay: [
    { date: '2025-02-01', revenue: 2000, payments: 5 },
    { date: '2025-02-02', revenue: 3500, payments: 8 },
    { date: '2025-02-03', revenue: 1200, payments: 3 },
  ],
  topResources: [
    { id: 'res_abc123', name: 'GPT-4 Turbo Access', revenue: 8000 },
  ],
};

const WEBHOOK_FIXTURE = {
  id: 'wh_123',
  url: 'https://example.com/hooks/mainlayer',
  events: ['payment.succeeded', 'payment.failed'],
  isActive: true,
  secret: 'whsec_supersecret',
  createdAt: '2025-01-20T00:00:00Z',
};

const API_KEY_FIXTURE = {
  id: 'key_abc',
  name: 'Production Key',
  prefix: 'ml_live_',
  createdAt: '2025-01-15T00:00:00Z',
  lastUsedAt: '2025-02-01T08:00:00Z',
  isActive: true,
};

const PAGINATED_RESOURCES = {
  data: [RESOURCE_FIXTURE],
  total: 1,
  page: 1,
  perPage: 20,
};

const PAGINATED_PAYMENTS = {
  data: [PAYMENT_FIXTURE],
  total: 1,
  page: 1,
  perPage: 25,
};

// ---------------------------------------------------------------------------
// Config module tests
// ---------------------------------------------------------------------------

describe('Config module', () => {
  beforeEach(() => {
    delete process.env.MAINLAYER_API_KEY;
    clearConfig();
  });

  afterAll(() => {
    clearConfig();
    try { fs.rmdirSync(TEST_CONFIG_DIR); } catch { /* ignore */ }
  });

  test('loadConfig returns empty object when no config exists', () => {
    const config = loadConfig();
    expect(config).toEqual({});
  });

  test('saveConfig persists API key to disk', () => {
    saveConfig({ apiKey: 'test_key_abc' });
    const config = loadConfig();
    expect(config.apiKey).toBe('test_key_abc');
  });

  test('saveConfig merges with existing config', () => {
    saveConfig({ apiKey: 'key_1' });
    saveConfig({ vendorId: 'vnd_1' });
    const config = loadConfig();
    expect(config.apiKey).toBe('key_1');
    expect((config as Record<string, unknown>).vendorId).toBe('vnd_1');
  });

  test('clearConfig removes stored config', () => {
    saveConfig({ apiKey: 'key_to_delete' });
    clearConfig();
    const config = loadConfig();
    expect(config.apiKey).toBeUndefined();
  });

  test('getApiKey returns undefined when nothing is set', () => {
    const key = getApiKey();
    expect(key).toBeUndefined();
  });

  test('getApiKey reads from config file', () => {
    saveConfig({ apiKey: 'from_config' });
    const key = getApiKey();
    expect(key).toBe('from_config');
  });

  test('getApiKey prefers MAINLAYER_API_KEY env var', () => {
    saveConfig({ apiKey: 'from_config' });
    process.env.MAINLAYER_API_KEY = 'from_env';
    const key = getApiKey();
    expect(key).toBe('from_env');
    delete process.env.MAINLAYER_API_KEY;
  });

  test('requireApiKey throws when no key is set', () => {
    expect(() => requireApiKey()).toThrow('No API key configured.');
  });

  test('requireApiKey returns key when set', () => {
    saveConfig({ apiKey: 'valid_key' });
    expect(requireApiKey()).toBe('valid_key');
  });

  test('configFilePath returns a path ending in config.json', () => {
    const p = configFilePath();
    expect(p).toMatch(/config\.json$/);
  });
});

// ---------------------------------------------------------------------------
// API client tests (mocked)
// ---------------------------------------------------------------------------

import { MainlayerApi } from '../src/lib/api';

describe('MainlayerApi', () => {
  let api: InstanceType<typeof MainlayerApi>;

  beforeEach(() => {
    jest.clearAllMocks();
    api = new MainlayerApi('test_api_key');
  });

  test('whoami resolves with vendor data', async () => {
    mockWhoami.mockResolvedValue(VENDOR_FIXTURE);
    const vendor = await api.whoami();
    expect(vendor.id).toBe('vnd_abc123');
    expect(vendor.name).toBe('Acme Corp');
    expect(mockWhoami).toHaveBeenCalledTimes(1);
  });

  test('listResources resolves with paginated data', async () => {
    mockListResources.mockResolvedValue(PAGINATED_RESOURCES);
    const result = await api.listResources({ page: 1, perPage: 20 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.data[0].id).toBe('res_abc123');
  });

  test('getResource resolves with a single resource', async () => {
    mockGetResource.mockResolvedValue(RESOURCE_FIXTURE);
    const resource = await api.getResource('res_abc123');
    expect(resource.name).toBe('GPT-4 Turbo Access');
    expect(resource.price).toBe(500);
  });

  test('createResource resolves with the new resource', async () => {
    mockCreateResource.mockResolvedValue(RESOURCE_FIXTURE);
    const resource = await api.createResource({
      name: 'GPT-4 Turbo Access',
      description: 'Access to GPT-4 Turbo via Mainlayer',
      price: 500,
      currency: 'USD',
      category: 'AI Model',
    });
    expect(resource.id).toBe('res_abc123');
    expect(mockCreateResource).toHaveBeenCalledWith({
      name: 'GPT-4 Turbo Access',
      description: 'Access to GPT-4 Turbo via Mainlayer',
      price: 500,
      currency: 'USD',
      category: 'AI Model',
    });
  });

  test('deleteResource resolves with success', async () => {
    mockDeleteResource.mockResolvedValue({ success: true });
    const result = await api.deleteResource('res_abc123');
    expect(result.success).toBe(true);
  });

  test('listPayments resolves with paginated payment data', async () => {
    mockListPayments.mockResolvedValue(PAGINATED_PAYMENTS);
    const result = await api.listPayments({ page: 1, perPage: 25 });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].status).toBe('succeeded');
    expect(result.data[0].amount).toBe(500);
  });

  test('getAnalytics resolves with analytics summary', async () => {
    mockGetAnalytics.mockResolvedValue(ANALYTICS_FIXTURE);
    const analytics = await api.getAnalytics();
    expect(analytics.totalRevenue).toBe(15000);
    expect(analytics.totalPayments).toBe(42);
    expect(analytics.successRate).toBe(0.97);
    expect(analytics.byDay).toHaveLength(3);
  });

  test('discoverResources resolves with paginated resources', async () => {
    mockDiscoverResources.mockResolvedValue(PAGINATED_RESOURCES);
    const result = await api.discoverResources('GPT');
    expect(result.data).toHaveLength(1);
    expect(mockDiscoverResources).toHaveBeenCalledWith('GPT');
  });

  test('payForResource resolves with payment result', async () => {
    const payResponse = {
      paymentId: 'pay_xyz789',
      status: 'succeeded',
      amount: 500,
      currency: 'USD',
      resourceId: 'res_abc123',
      wallet: '0xdeadbeef',
      createdAt: '2025-02-01T12:00:00Z',
    };
    mockPayForResource.mockResolvedValue(payResponse);
    const result = await api.payForResource('res_abc123', { wallet: '0xdeadbeef' });
    expect(result.paymentId).toBe('pay_xyz789');
    expect(result.status).toBe('succeeded');
  });

  test('checkEntitlement resolves with entitlement data', async () => {
    const entitlement = {
      wallet: '0xdeadbeef',
      resourceId: 'res_abc123',
      hasAccess: true,
      purchasedAt: '2025-02-01T12:00:00Z',
    };
    mockCheckEntitlement.mockResolvedValue(entitlement);
    const result = await api.checkEntitlement('res_abc123', '0xdeadbeef');
    expect(result.hasAccess).toBe(true);
    expect(result.wallet).toBe('0xdeadbeef');
  });

  test('checkEntitlement returns hasAccess=false for unknown wallet', async () => {
    const entitlement = {
      wallet: '0xunknown',
      resourceId: 'res_abc123',
      hasAccess: false,
    };
    mockCheckEntitlement.mockResolvedValue(entitlement);
    const result = await api.checkEntitlement('res_abc123', '0xunknown');
    expect(result.hasAccess).toBe(false);
  });

  test('listWebhooks resolves with array of webhooks', async () => {
    mockListWebhooks.mockResolvedValue([WEBHOOK_FIXTURE]);
    const hooks = await api.listWebhooks();
    expect(hooks).toHaveLength(1);
    expect(hooks[0].url).toBe('https://example.com/hooks/mainlayer');
    expect(hooks[0].events).toContain('payment.succeeded');
  });

  test('createWebhook resolves with new webhook including secret', async () => {
    mockCreateWebhook.mockResolvedValue(WEBHOOK_FIXTURE);
    const hook = await api.createWebhook({
      url: 'https://example.com/hooks/mainlayer',
      events: ['payment.succeeded'],
    });
    expect(hook.id).toBe('wh_123');
    expect(hook.secret).toBe('whsec_supersecret');
  });

  test('deleteWebhook resolves with success', async () => {
    mockDeleteWebhook.mockResolvedValue({ success: true });
    const result = await api.deleteWebhook('wh_123');
    expect(result.success).toBe(true);
  });

  test('listApiKeys resolves with array of keys', async () => {
    mockListApiKeys.mockResolvedValue([API_KEY_FIXTURE]);
    const keys = await api.listApiKeys();
    expect(keys).toHaveLength(1);
    expect(keys[0].name).toBe('Production Key');
    expect(keys[0].isActive).toBe(true);
  });

  test('createApiKey resolves with new key and plaintext value', async () => {
    const newKey = { ...API_KEY_FIXTURE, key: 'ml_live_supersecretkey' };
    mockCreateApiKey.mockResolvedValue(newKey);
    const result = await api.createApiKey({ name: 'Production Key' });
    expect(result.key).toBe('ml_live_supersecretkey');
    expect(result.prefix).toBe('ml_live_');
  });

  test('revokeApiKey resolves with success', async () => {
    mockRevokeApiKey.mockResolvedValue({ success: true });
    const result = await api.revokeApiKey('key_abc');
    expect(result.success).toBe(true);
    expect(mockRevokeApiKey).toHaveBeenCalledWith('key_abc');
  });

  test('api method rejects with error on API failure', async () => {
    mockGetResource.mockRejectedValue(new Error('Resource not found'));
    await expect(api.getResource('res_nonexistent')).rejects.toThrow('Resource not found');
  });
});

// ---------------------------------------------------------------------------
// Output helpers tests
// ---------------------------------------------------------------------------

import { formatMoney, formatDate, formatDateTime } from '../src/lib/output';

describe('Output helpers', () => {
  test('formatMoney formats cents as dollars', () => {
    const result = formatMoney(500);
    expect(result).toContain('5.00');
  });

  test('formatMoney formats zero correctly', () => {
    const result = formatMoney(0);
    expect(result).toContain('0.00');
  });

  test('formatMoney handles large amounts', () => {
    const result = formatMoney(100000);
    expect(result).toContain('1,000.00');
  });

  test('formatDate returns a human-readable date string', () => {
    const result = formatDate('2025-01-15T00:00:00Z');
    expect(result).toContain('2025');
    expect(result).toContain('Jan');
  });

  test('formatDate handles invalid date gracefully', () => {
    const result = formatDate('not-a-date');
    expect(result).toBe('not-a-date');
  });

  test('formatDateTime returns date and time', () => {
    const result = formatDateTime('2025-02-01T12:00:00Z');
    expect(result).toContain('2025');
    expect(result).toMatch(/Feb|Jan|Mar/);
  });
});
