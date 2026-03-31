"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainlayerApi = exports.MainlayerApiError = void 0;
exports.createApiClient = createApiClient;
const node_fetch_1 = __importDefault(require("node-fetch"));
const config_js_1 = require("./config.js");
class MainlayerApiError extends Error {
    constructor(message, status, code) {
        super(message);
        this.name = 'MainlayerApiError';
        this.status = status;
        this.code = code;
    }
}
exports.MainlayerApiError = MainlayerApiError;
// ---------------------------------------------------------------------------
// HTTP client
// ---------------------------------------------------------------------------
async function request(method, path, body, apiKey) {
    const key = apiKey ?? (0, config_js_1.getApiKey)();
    if (!key) {
        throw new MainlayerApiError('No API key configured. Run `mainlayer login` or set MAINLAYER_API_KEY.', 401, 'UNAUTHENTICATED');
    }
    const baseUrl = (0, config_js_1.getBaseUrl)();
    const url = `${baseUrl}${path}`;
    const headers = {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'User-Agent': 'mainlayer-cli/1.0.0',
    };
    const response = await (0, node_fetch_1.default)(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await response.text();
    let json;
    try {
        json = JSON.parse(text);
    }
    catch {
        if (!response.ok) {
            throw new MainlayerApiError(`HTTP ${response.status}: ${response.statusText}`, response.status);
        }
        return text;
    }
    if (!response.ok) {
        const err = json;
        throw new MainlayerApiError(err.message ?? err.error ?? `HTTP ${response.status}`, response.status, err.code);
    }
    return json;
}
// ---------------------------------------------------------------------------
// API client
// ---------------------------------------------------------------------------
class MainlayerApi {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    get(path) {
        return request('GET', path, undefined, this.apiKey);
    }
    post(path, body) {
        return request('POST', path, body, this.apiKey);
    }
    delete(path) {
        return request('DELETE', path, undefined, this.apiKey);
    }
    // Vendor / auth
    whoami() {
        return this.get('/v1/vendors/me');
    }
    // Resources
    listResources(params) {
        const qs = new URLSearchParams();
        if (params?.page)
            qs.set('page', String(params.page));
        if (params?.perPage)
            qs.set('per_page', String(params.perPage));
        const query = qs.toString() ? `?${qs.toString()}` : '';
        return this.get(`/v1/resources${query}`);
    }
    getResource(id) {
        return this.get(`/v1/resources/${id}`);
    }
    createResource(data) {
        return this.post('/v1/resources', data);
    }
    deleteResource(id) {
        return this.delete(`/v1/resources/${id}`);
    }
    // Discover (public — uses same key for rate-limit identity)
    discoverResources(query) {
        const qs = new URLSearchParams();
        if (query)
            qs.set('q', query);
        const q = qs.toString() ? `?${qs.toString()}` : '';
        return this.get(`/v1/discover${q}`);
    }
    // Payments
    listPayments(params) {
        const qs = new URLSearchParams();
        if (params?.page)
            qs.set('page', String(params.page));
        if (params?.perPage)
            qs.set('per_page', String(params.perPage));
        const query = qs.toString() ? `?${qs.toString()}` : '';
        return this.get(`/v1/payments${query}`);
    }
    payForResource(resourceId, data) {
        return this.post(`/v1/resources/${resourceId}/pay`, data);
    }
    checkEntitlement(resourceId, wallet) {
        return this.get(`/v1/resources/${resourceId}/entitlement?wallet=${encodeURIComponent(wallet)}`);
    }
    // Analytics
    getAnalytics() {
        return this.get('/v1/analytics');
    }
    // Webhooks
    listWebhooks() {
        return this.get('/v1/webhooks');
    }
    createWebhook(data) {
        return this.post('/v1/webhooks', data);
    }
    deleteWebhook(id) {
        return this.delete(`/v1/webhooks/${id}`);
    }
    // API Keys
    listApiKeys() {
        return this.get('/v1/keys');
    }
    createApiKey(data) {
        return this.post('/v1/keys', data);
    }
    revokeApiKey(id) {
        return this.delete(`/v1/keys/${id}`);
    }
}
exports.MainlayerApi = MainlayerApi;
function createApiClient(apiKey) {
    const key = apiKey ?? (0, config_js_1.getApiKey)();
    if (!key) {
        throw new MainlayerApiError('No API key configured. Run `mainlayer login` or set MAINLAYER_API_KEY.', 401, 'UNAUTHENTICATED');
    }
    return new MainlayerApi(key);
}
//# sourceMappingURL=api.js.map