"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDiscoverCommand = registerDiscoverCommand;
const api_js_1 = require("../lib/api.js");
const config_js_1 = require("../lib/config.js");
const output_js_1 = require("../lib/output.js");
function registerDiscoverCommand(program) {
    program
        .command('discover [query]')
        .description('Browse available resources on the Mainlayer marketplace')
        .option('-p, --page <number>', 'Page number', '1')
        .option('-n, --per-page <number>', 'Results per page', '20')
        .action(async (query, _opts) => {
        let apiKey;
        try {
            apiKey = (0, config_js_1.requireApiKey)();
        }
        catch (err) {
            (0, output_js_1.printError)(err.message);
            process.exit(1);
        }
        const spinnerText = query
            ? `Searching for "${query}"…`
            : 'Loading available resources…';
        const spinner = (0, output_js_1.createSpinner)(spinnerText).start();
        try {
            const api = (0, api_js_1.createApiClient)(apiKey);
            const result = await api.discoverResources(query);
            spinner.stop();
            const title = query
                ? `Search results for "${query}" (${result.total} found)`
                : `Marketplace (${result.total} available)`;
            if (result.data.length === 0) {
                console.log('');
                if (query) {
                    console.log(output_js_1.c.muted(`  No resources matched "${query}". Try a different search term.`));
                }
                else {
                    console.log(output_js_1.c.muted('  No resources available yet.'));
                }
                console.log('');
                return;
            }
            (0, output_js_1.printHeader)(title);
            (0, output_js_1.printTable)([
                { header: 'ID', key: 'id', width: 28 },
                { header: 'Name', key: 'name', width: 24 },
                { header: 'Category', key: 'category', width: 16 },
                { header: 'Description', key: 'description', width: 36 },
                {
                    header: 'Price',
                    key: 'price',
                    width: 14,
                    format: (v) => output_js_1.c.money((0, output_js_1.formatMoney)(v)),
                },
            ], result.data.map((r) => ({
                ...r,
                description: r.description.length > 32
                    ? `${r.description.slice(0, 32)}…`
                    : r.description,
            })));
            console.log(output_js_1.c.muted(`  Page ${result.page} of ${Math.ceil(result.total / result.perPage)}`));
            console.log('');
            (0, output_js_1.printInfo)(`Use ${output_js_1.c.bold('mainlayer pay <resource_id>')} to purchase any resource.`);
            console.log('');
        }
        catch (error) {
            spinner.fail('Failed to load resources.');
            (0, output_js_1.handleApiError)(error);
        }
    });
}
//# sourceMappingURL=discover.js.map