"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.c = void 0;
exports.printSuccess = printSuccess;
exports.printError = printError;
exports.printWarn = printWarn;
exports.printInfo = printInfo;
exports.printHeader = printHeader;
exports.printDivider = printDivider;
exports.printKeyValue = printKeyValue;
exports.createSpinner = createSpinner;
exports.printTable = printTable;
exports.formatMoney = formatMoney;
exports.formatDate = formatDate;
exports.formatDateTime = formatDateTime;
exports.statusBadge = statusBadge;
exports.printBarChart = printBarChart;
exports.handleApiError = handleApiError;
const chalk_1 = __importDefault(require("chalk"));
const cli_table3_1 = __importDefault(require("cli-table3"));
const ora_1 = __importDefault(require("ora"));
// ---------------------------------------------------------------------------
// Colour helpers
// ---------------------------------------------------------------------------
exports.c = {
    primary: chalk_1.default.hex('#4F8EF7'),
    success: chalk_1.default.green,
    error: chalk_1.default.red,
    warn: chalk_1.default.yellow,
    muted: chalk_1.default.gray,
    bold: chalk_1.default.bold,
    dim: chalk_1.default.dim,
    money: chalk_1.default.hex('#2ECC71'),
    label: chalk_1.default.cyan,
};
// ---------------------------------------------------------------------------
// Print helpers
// ---------------------------------------------------------------------------
function printSuccess(message) {
    console.log(`${exports.c.success('✓')} ${message}`);
}
function printError(message) {
    console.error(`${exports.c.error('✗')} ${exports.c.error(message)}`);
}
function printWarn(message) {
    console.warn(`${exports.c.warn('!')} ${exports.c.warn(message)}`);
}
function printInfo(message) {
    console.log(`${exports.c.primary('→')} ${message}`);
}
function printHeader(title) {
    const line = '─'.repeat(title.length + 4);
    console.log('');
    console.log(exports.c.primary(`┌${line}┐`));
    console.log(exports.c.primary('│') + `  ${exports.c.bold(title)}  ` + exports.c.primary('│'));
    console.log(exports.c.primary(`└${line}┘`));
    console.log('');
}
function printDivider() {
    console.log(exports.c.muted('─'.repeat(60)));
}
function printKeyValue(key, value) {
    console.log(`  ${exports.c.label(key.padEnd(18))} ${value}`);
}
// ---------------------------------------------------------------------------
// Spinner
// ---------------------------------------------------------------------------
function createSpinner(text) {
    return (0, ora_1.default)({ text, color: 'blue' });
}
function printTable(columns, rows) {
    const table = new cli_table3_1.default({
        head: columns.map((col) => exports.c.bold(exports.c.label(col.header))),
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
        table.push(columns.map((col) => {
            const value = row[col.key];
            if (col.format)
                return col.format(value);
            return value === undefined || value === null ? exports.c.muted('—') : String(value);
        }));
    }
    console.log(table.toString());
}
// ---------------------------------------------------------------------------
// Money formatting
// ---------------------------------------------------------------------------
function formatMoney(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(amount / 100); // amounts stored as cents
}
// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------
function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime()))
        return dateStr;
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
function formatDateTime(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime()))
        return dateStr;
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
function statusBadge(status) {
    const lower = status.toLowerCase();
    if (lower === 'succeeded' || lower === 'active' || lower === 'true') {
        return exports.c.success(`● ${status}`);
    }
    if (lower === 'pending') {
        return exports.c.warn(`◌ ${status}`);
    }
    if (lower === 'failed' || lower === 'inactive' || lower === 'false') {
        return exports.c.error(`✕ ${status}`);
    }
    return exports.c.muted(status);
}
function printBarChart(entries, options = {}) {
    const { title, maxWidth = 40, formatValue, unit = '' } = options;
    if (title) {
        console.log('');
        console.log(exports.c.bold(title));
        printDivider();
    }
    if (entries.length === 0) {
        console.log(exports.c.muted('  No data available.'));
        return;
    }
    const maxValue = Math.max(...entries.map((e) => e.value), 1);
    const maxLabel = Math.max(...entries.map((e) => e.label.length), 0);
    for (const entry of entries) {
        const barLength = Math.round((entry.value / maxValue) * maxWidth);
        const bar = exports.c.primary('█'.repeat(barLength)) + exports.c.muted('░'.repeat(maxWidth - barLength));
        const label = entry.label.padEnd(maxLabel);
        const valueStr = formatValue
            ? formatValue(entry.value)
            : `${entry.value}${unit}`;
        console.log(`  ${exports.c.label(label)}  ${bar}  ${exports.c.money(valueStr)}`);
    }
    console.log('');
}
// ---------------------------------------------------------------------------
// Handle API errors gracefully
// ---------------------------------------------------------------------------
function handleApiError(error) {
    if (error instanceof Error) {
        const apiErr = error;
        if (apiErr.status === 401) {
            printError('Authentication failed. Run `mainlayer login` to set your API key.');
        }
        else if (apiErr.status === 404) {
            printError(`Not found: ${apiErr.message}`);
        }
        else if (apiErr.status === 429) {
            printError('Rate limit exceeded. Please wait before retrying.');
        }
        else {
            printError(apiErr.message);
        }
    }
    else {
        printError('An unexpected error occurred.');
    }
    process.exit(1);
}
//# sourceMappingURL=output.js.map