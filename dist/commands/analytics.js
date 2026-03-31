"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAnalyticsCommand = registerAnalyticsCommand;
const api_js_1 = require("../lib/api.js");
const config_js_1 = require("../lib/config.js");
const output_js_1 = require("../lib/output.js");
function registerAnalyticsCommand(program) {
    program
        .command('analytics')
        .description('Display revenue dashboard in the terminal')
        .action(async () => {
        let apiKey;
        try {
            apiKey = (0, config_js_1.requireApiKey)();
        }
        catch (err) {
            (0, output_js_1.printError)(err.message);
            process.exit(1);
        }
        const spinner = (0, output_js_1.createSpinner)('Loading analytics…').start();
        try {
            const api = (0, api_js_1.createApiClient)(apiKey);
            const data = await api.getAnalytics();
            spinner.stop();
            (0, output_js_1.printHeader)('Revenue Dashboard');
            // Summary row
            (0, output_js_1.printKeyValue)('Total Revenue', output_js_1.c.money((0, output_js_1.formatMoney)(data.totalRevenue, data.currency)));
            (0, output_js_1.printKeyValue)('Total Payments', String(data.totalPayments));
            (0, output_js_1.printKeyValue)('Success Rate', `${(data.successRate * 100).toFixed(1)}%`);
            console.log('');
            // Daily revenue bar chart
            if (data.byDay && data.byDay.length > 0) {
                const chartEntries = data.byDay.slice(-14).map((day) => ({
                    label: formatShortDate(day.date),
                    value: day.revenue,
                }));
                (0, output_js_1.printBarChart)(chartEntries, {
                    title: 'Revenue — Last 14 Days',
                    maxWidth: 36,
                    formatValue: (v) => (0, output_js_1.formatMoney)(v, data.currency),
                });
            }
            // Top resources
            if (data.topResources && data.topResources.length > 0) {
                console.log(output_js_1.c.bold('  Top Resources by Revenue'));
                (0, output_js_1.printDivider)();
                data.topResources.slice(0, 5).forEach((resource, i) => {
                    const rank = output_js_1.c.muted(`${i + 1}.`);
                    const name = resource.name.padEnd(30);
                    const revenue = output_js_1.c.money((0, output_js_1.formatMoney)(resource.revenue, data.currency));
                    console.log(`  ${rank} ${name} ${revenue}`);
                });
                console.log('');
            }
            else {
                console.log(output_js_1.c.muted('  No resource revenue data available yet.'));
                console.log('');
            }
        }
        catch (error) {
            spinner.fail('Failed to load analytics.');
            (0, output_js_1.handleApiError)(error);
        }
    });
}
function formatShortDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime()))
        return dateStr.slice(5); // fallback: MM-DD
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
//# sourceMappingURL=analytics.js.map