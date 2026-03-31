"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPaymentsCommand = registerPaymentsCommand;
const api_js_1 = require("../lib/api.js");
const config_js_1 = require("../lib/config.js");
const output_js_1 = require("../lib/output.js");
function registerPaymentsCommand(program) {
    program
        .command('payments')
        .description('View payment history')
        .option('-p, --page <number>', 'Page number', '1')
        .option('-n, --per-page <number>', 'Results per page', '25')
        .action(async (opts) => {
        let apiKey;
        try {
            apiKey = (0, config_js_1.requireApiKey)();
        }
        catch (err) {
            (0, output_js_1.printError)(err.message);
            process.exit(1);
        }
        const spinner = (0, output_js_1.createSpinner)('Loading payment history…').start();
        try {
            const api = (0, api_js_1.createApiClient)(apiKey);
            const result = await api.listPayments({
                page: parseInt(opts.page, 10),
                perPage: parseInt(opts.perPage, 10),
            });
            spinner.stop();
            if (result.data.length === 0) {
                console.log('');
                console.log(output_js_1.c.muted('  No payments found yet.'));
                console.log('');
                return;
            }
            const totalRevenue = result.data
                .filter((p) => p.status === 'succeeded')
                .reduce((sum, p) => sum + p.amount, 0);
            (0, output_js_1.printHeader)(`Payment History (${result.total} total)`);
            (0, output_js_1.printTable)([
                { header: 'ID', key: 'id', width: 28 },
                { header: 'Resource', key: 'resourceName', width: 22 },
                {
                    header: 'Amount',
                    key: 'amount',
                    width: 14,
                    format: (v) => output_js_1.c.money((0, output_js_1.formatMoney)(v)),
                },
                {
                    header: 'Status',
                    key: 'status',
                    width: 14,
                    format: (v) => (0, output_js_1.statusBadge)(String(v)),
                },
                { header: 'Wallet', key: 'wallet', width: 22 },
                {
                    header: 'Date',
                    key: 'createdAt',
                    width: 20,
                    format: (v) => (0, output_js_1.formatDateTime)(String(v)),
                },
            ], result.data);
            console.log(`  ${output_js_1.c.label('Total revenue (this page):')} ${output_js_1.c.money((0, output_js_1.formatMoney)(totalRevenue))}`);
            console.log(output_js_1.c.muted(`  Page ${result.page} of ${Math.ceil(result.total / result.perPage)}`));
            console.log('');
        }
        catch (error) {
            spinner.fail('Failed to load payments.');
            (0, output_js_1.handleApiError)(error);
        }
    });
}
//# sourceMappingURL=payments.js.map