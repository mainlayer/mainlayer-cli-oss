import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Ora = any;

// ---------------------------------------------------------------------------
// Colour helpers
// ---------------------------------------------------------------------------

export const c = {
  primary: chalk.hex('#4F8EF7'),
  success: chalk.green,
  error: chalk.red,
  warn: chalk.yellow,
  muted: chalk.gray,
  bold: chalk.bold,
  dim: chalk.dim,
  money: chalk.hex('#2ECC71'),
  label: chalk.cyan,
};

// ---------------------------------------------------------------------------
// Print helpers
// ---------------------------------------------------------------------------

export function printSuccess(message: string): void {
  console.log(`${c.success('✓')} ${message}`);
}

export function printError(message: string): void {
  console.error(`${c.error('✗')} ${c.error(message)}`);
}

export function printWarn(message: string): void {
  console.warn(`${c.warn('!')} ${c.warn(message)}`);
}

export function printInfo(message: string): void {
  console.log(`${c.primary('→')} ${message}`);
}

export function printHeader(title: string): void {
  const line = '─'.repeat(title.length + 4);
  console.log('');
  console.log(c.primary(`┌${line}┐`));
  console.log(c.primary('│') + `  ${c.bold(title)}  ` + c.primary('│'));
  console.log(c.primary(`└${line}┘`));
  console.log('');
}

export function printDivider(): void {
  console.log(c.muted('─'.repeat(60)));
}

export function printKeyValue(key: string, value: string): void {
  console.log(`  ${c.label(key.padEnd(18))} ${value}`);
}

// ---------------------------------------------------------------------------
// Spinner
// ---------------------------------------------------------------------------

export function createSpinner(text: string): Ora {
  return ora({ text, color: 'blue' });
}

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export interface TableColumn {
  header: string;
  key: string;
  width?: number;
  format?: (value: unknown) => string;
}

export function printTable(
  columns: TableColumn[],
  rows: Record<string, unknown>[],
): void {
  const table = new Table({
    head: columns.map((col) => c.bold(c.label(col.header))),
    colWidths: columns.map((col) => col.width ?? null),
    style: {
      head: [],
      border: ['gray'],
    },
    chars: {
      top: '─',
      'top-mid': '┬',
      'top-left': '┌',
      'top-right': '┐',
      bottom: '─',
      'bottom-mid': '┴',
      'bottom-left': '└',
      'bottom-right': '┘',
      left: '│',
      'left-mid': '├',
      mid: '─',
      'mid-mid': '┼',
      right: '│',
      'right-mid': '┤',
      middle: '│',
    },
  });

  for (const row of rows) {
    table.push(
      columns.map((col) => {
        const value = row[col.key];
        if (col.format) return col.format(value);
        return value === undefined || value === null ? c.muted('—') : String(value);
      }),
    );
  }

  console.log(table.toString());
}

// ---------------------------------------------------------------------------
// Money formatting
// ---------------------------------------------------------------------------

export function formatMoney(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100); // amounts stored as cents
}

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

export function statusBadge(status: string): string {
  const lower = status.toLowerCase();
  if (lower === 'succeeded' || lower === 'active' || lower === 'true') {
    return c.success(`● ${status}`);
  }
  if (lower === 'pending') {
    return c.warn(`◌ ${status}`);
  }
  if (lower === 'failed' || lower === 'inactive' || lower === 'false') {
    return c.error(`✕ ${status}`);
  }
  return c.muted(status);
}

// ---------------------------------------------------------------------------
// ASCII bar chart (for analytics)
// ---------------------------------------------------------------------------

export interface BarChartEntry {
  label: string;
  value: number;
}

export function printBarChart(
  entries: BarChartEntry[],
  options: {
    title?: string;
    maxWidth?: number;
    formatValue?: (v: number) => string;
    unit?: string;
  } = {},
): void {
  const { title, maxWidth = 40, formatValue, unit = '' } = options;

  if (title) {
    console.log('');
    console.log(c.bold(title));
    printDivider();
  }

  if (entries.length === 0) {
    console.log(c.muted('  No data available.'));
    return;
  }

  const maxValue = Math.max(...entries.map((e) => e.value), 1);
  const maxLabel = Math.max(...entries.map((e) => e.label.length), 0);

  for (const entry of entries) {
    const barLength = Math.round((entry.value / maxValue) * maxWidth);
    const bar = c.primary('█'.repeat(barLength)) + c.muted('░'.repeat(maxWidth - barLength));
    const label = entry.label.padEnd(maxLabel);
    const valueStr = formatValue
      ? formatValue(entry.value)
      : `${entry.value}${unit}`;
    console.log(`  ${c.label(label)}  ${bar}  ${c.money(valueStr)}`);
  }
  console.log('');
}

// ---------------------------------------------------------------------------
// Handle API errors gracefully
// ---------------------------------------------------------------------------

export function handleApiError(error: unknown): never {
  if (error instanceof Error) {
    const apiErr = error as Error & { status?: number; code?: string };
    if (apiErr.status === 401) {
      printError('Authentication failed. Run `mainlayer login` to set your API key.');
    } else if (apiErr.status === 404) {
      printError(`Not found: ${apiErr.message}`);
    } else if (apiErr.status === 429) {
      printError('Rate limit exceeded. Please wait before retrying.');
    } else {
      printError(apiErr.message);
    }
  } else {
    printError('An unexpected error occurred.');
  }
  process.exit(1);
}
