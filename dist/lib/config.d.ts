export interface MainlayerConfig {
    apiKey?: string;
    baseUrl?: string;
    vendorId?: string;
}
export declare const DEFAULT_BASE_URL = "https://api.mainlayer.xyz";
export declare function loadConfig(): MainlayerConfig;
export declare function saveConfig(config: MainlayerConfig): void;
export declare function clearConfig(): void;
export declare function getApiKey(): string | undefined;
export declare function getBaseUrl(): string;
export declare function requireApiKey(): string;
export declare function configFilePath(): string;
//# sourceMappingURL=config.d.ts.map