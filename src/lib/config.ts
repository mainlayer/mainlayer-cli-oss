import fs from 'fs';
import os from 'os';
import path from 'path';

export interface MainlayerConfig {
  apiKey?: string;
  baseUrl?: string;
  vendorId?: string;
}

const CONFIG_DIR = path.join(os.homedir(), '.mainlayer');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export const DEFAULT_BASE_URL = 'https://api.mainlayer.xyz';

function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

export function loadConfig(): MainlayerConfig {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return {};
    }
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(raw) as MainlayerConfig;
  } catch {
    return {};
  }
}

export function saveConfig(config: MainlayerConfig): void {
  ensureConfigDir();
  const existing = loadConfig();
  const merged = { ...existing, ...config };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), {
    encoding: 'utf-8',
    mode: 0o600,
  });
}

export function clearConfig(): void {
  if (fs.existsSync(CONFIG_FILE)) {
    fs.unlinkSync(CONFIG_FILE);
  }
}

export function getApiKey(): string | undefined {
  // Environment variable takes precedence over config file
  return process.env.MAINLAYER_API_KEY ?? loadConfig().apiKey;
}

export function getBaseUrl(): string {
  return (
    process.env.MAINLAYER_BASE_URL ??
    loadConfig().baseUrl ??
    DEFAULT_BASE_URL
  );
}

export function requireApiKey(): string {
  const key = getApiKey();
  if (!key) {
    throw new Error(
      'No API key configured. Run `mainlayer login` or set MAINLAYER_API_KEY.',
    );
  }
  return key;
}

export function configFilePath(): string {
  return CONFIG_FILE;
}
