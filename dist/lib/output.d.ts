import chalk from 'chalk';
type Ora = any;
export declare const c: {
    primary: chalk.Chalk;
    success: chalk.Chalk;
    error: chalk.Chalk;
    warn: chalk.Chalk;
    muted: chalk.Chalk;
    bold: chalk.Chalk;
    dim: chalk.Chalk;
    money: chalk.Chalk;
    label: chalk.Chalk;
};
export declare function printSuccess(message: string): void;
export declare function printError(message: string): void;
export declare function printWarn(message: string): void;
export declare function printInfo(message: string): void;
export declare function printHeader(title: string): void;
export declare function printDivider(): void;
export declare function printKeyValue(key: string, value: string): void;
export declare function createSpinner(text: string): Ora;
export interface TableColumn {
    header: string;
    key: string;
    width?: number;
    format?: (value: unknown) => string;
}
export declare function printTable(columns: TableColumn[], rows: Record<string, unknown>[]): void;
export declare function formatMoney(amount: number, currency?: string): string;
export declare function formatDate(dateStr: string): string;
export declare function formatDateTime(dateStr: string): string;
export declare function statusBadge(status: string): string;
export interface BarChartEntry {
    label: string;
    value: number;
}
export declare function printBarChart(entries: BarChartEntry[], options?: {
    title?: string;
    maxWidth?: number;
    formatValue?: (v: number) => string;
    unit?: string;
}): void;
export declare function handleApiError(error: unknown): never;
export {};
//# sourceMappingURL=output.d.ts.map