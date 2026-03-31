"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_BASE_URL = void 0;
exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
exports.clearConfig = clearConfig;
exports.getApiKey = getApiKey;
exports.getBaseUrl = getBaseUrl;
exports.requireApiKey = requireApiKey;
exports.configFilePath = configFilePath;
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const CONFIG_DIR = path_1.default.join(os_1.default.homedir(), '.mainlayer');
const CONFIG_FILE = path_1.default.join(CONFIG_DIR, 'config.json');
exports.DEFAULT_BASE_URL = 'https://api.mainlayer.fr';
function ensureConfigDir() {
    if (!fs_1.default.existsSync(CONFIG_DIR)) {
        fs_1.default.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
    }
}
function loadConfig() {
    try {
        if (!fs_1.default.existsSync(CONFIG_FILE)) {
            return {};
        }
        const raw = fs_1.default.readFileSync(CONFIG_FILE, 'utf-8');
        return JSON.parse(raw);
    }
    catch {
        return {};
    }
}
function saveConfig(config) {
    ensureConfigDir();
    const existing = loadConfig();
    const merged = { ...existing, ...config };
    fs_1.default.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), {
        encoding: 'utf-8',
        mode: 0o600,
    });
}
function clearConfig() {
    if (fs_1.default.existsSync(CONFIG_FILE)) {
        fs_1.default.unlinkSync(CONFIG_FILE);
    }
}
function getApiKey() {
    // Environment variable takes precedence over config file
    return process.env.MAINLAYER_API_KEY ?? loadConfig().apiKey;
}
function getBaseUrl() {
    return (process.env.MAINLAYER_BASE_URL ??
        loadConfig().baseUrl ??
        exports.DEFAULT_BASE_URL);
}
function requireApiKey() {
    const key = getApiKey();
    if (!key) {
        throw new Error('No API key configured. Run `mainlayer login` or set MAINLAYER_API_KEY.');
    }
    return key;
}
function configFilePath() {
    return CONFIG_FILE;
}
//# sourceMappingURL=config.js.map