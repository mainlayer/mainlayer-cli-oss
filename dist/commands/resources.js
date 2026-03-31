"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerResourcesCommand = registerResourcesCommand;
const inquirer_1 = __importDefault(require("inquirer"));
const api_js_1 = require("../lib/api.js");
const config_js_1 = require("../lib/config.js");
const output_js_1 = require("../lib/output.js");
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
const CATEGORIES = [
    'AI Model',
    'Data Feed',
    'API Endpoint',
    'Compute',
    'Storage',
    'Analytics',
    'Other',
];
function registerResourcesCommand(program) {
    const resources = program
        .command('resources')
        .description('Manage your Mainlayer resources');
    // LIST
    resources
        .command('list')
        .description('List all resources for your account')
        .option('-p, --page <number>', 'Page number', '1')
        .option('-n, --per-page <number>', 'Results per page', '20')
        .action(async (opts) => {
        let apiKey;
        try {
            apiKey = (0, config_js_1.requireApiKey)();
        }
        catch (err) {
            (0, output_js_1.printError)(err.message);
            process.exit(1);
        }
        const spinner = (0, output_js_1.createSpinner)('Loading resources…').start();
        try {
            const api = (0, api_js_1.createApiClient)(apiKey);
            const result = await api.listResources({
                page: parseInt(opts.page, 10),
                perPage: parseInt(opts.perPage, 10),
            });
            spinner.stop();
            if (result.data.length === 0) {
                console.log('');
                console.log(output_js_1.c.muted('  No resources found. Create one with `mainlayer resources create`.'));
                console.log('');
                return;
            }
            (0, output_js_1.printHeader)(`Resources (${result.total} total)`);
            (0, output_js_1.printTable)([
                { header: 'ID', key: 'id', width: 28 },
                { header: 'Name', key: 'name', width: 24 },
                { header: 'Category', key: 'category', width: 16 },
                {
                    header: 'Price',
                    key: 'price',
                    width: 14,
                    format: (v) => output_js_1.c.money((0, output_js_1.formatMoney)(v)),
                },
                {
                    header: 'Status',
                    key: 'isActive',
                    width: 14,
                    format: (v) => (0, output_js_1.statusBadge)(v ? 'Active' : 'Inactive'),
                },
                {
                    header: 'Created',
                    key: 'createdAt',
                    width: 16,
                    format: (v) => (0, output_js_1.formatDate)(String(v)),
                },
            ], result.data);
            console.log(output_js_1.c.muted(`  Page ${result.page} of ${Math.ceil(result.total / result.perPage)}`));
            console.log('');
        }
        catch (error) {
            spinner.fail('Failed to load resources.');
            (0, output_js_1.handleApiError)(error);
        }
    });
    // GET
    resources
        .command('get <id>')
        .description('Get details for a specific resource')
        .action(async (id) => {
        let apiKey;
        try {
            apiKey = (0, config_js_1.requireApiKey)();
        }
        catch (err) {
            (0, output_js_1.printError)(err.message);
            process.exit(1);
        }
        const spinner = (0, output_js_1.createSpinner)(`Fetching resource ${id}…`).start();
        try {
            const api = (0, api_js_1.createApiClient)(apiKey);
            const resource = await api.getResource(id);
            spinner.stop();
            (0, output_js_1.printHeader)(resource.name);
            (0, output_js_1.printKeyValue)('ID', resource.id);
            (0, output_js_1.printKeyValue)('Name', resource.name);
            (0, output_js_1.printKeyValue)('Description', resource.description);
            (0, output_js_1.printKeyValue)('Category', resource.category);
            (0, output_js_1.printKeyValue)('Price', output_js_1.c.money((0, output_js_1.formatMoney)(resource.price, resource.currency)));
            (0, output_js_1.printKeyValue)('Currency', resource.currency);
            (0, output_js_1.printKeyValue)('Status', (0, output_js_1.statusBadge)(resource.isActive ? 'Active' : 'Inactive'));
            (0, output_js_1.printKeyValue)('Created', (0, output_js_1.formatDate)(resource.createdAt));
            (0, output_js_1.printKeyValue)('Updated', (0, output_js_1.formatDate)(resource.updatedAt));
            console.log('');
        }
        catch (error) {
            spinner.fail(`Failed to fetch resource ${id}.`);
            (0, output_js_1.handleApiError)(error);
        }
    });
    // CREATE
    resources
        .command('create')
        .description('Interactively create a new resource')
        .action(async () => {
        let apiKey;
        try {
            apiKey = (0, config_js_1.requireApiKey)();
        }
        catch (err) {
            (0, output_js_1.printError)(err.message);
            process.exit(1);
        }
        console.log('');
        console.log(output_js_1.c.bold('  Create a new resource'));
        console.log('');
        const answers = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Resource name:',
                validate: (v) => (v.trim().length >= 2 ? true : 'Name must be at least 2 characters.'),
            },
            {
                type: 'input',
                name: 'description',
                message: 'Description:',
                validate: (v) => (v.trim().length >= 5 ? true : 'Description must be at least 5 characters.'),
            },
            {
                type: 'list',
                name: 'category',
                message: 'Category:',
                choices: CATEGORIES,
            },
            {
                type: 'number',
                name: 'price',
                message: 'Price (in cents, e.g. 100 = $1.00):',
                validate: (v) => (v >= 0 ? true : 'Price must be 0 or greater.'),
            },
            {
                type: 'list',
                name: 'currency',
                message: 'Currency:',
                choices: CURRENCIES,
                default: 'USD',
            },
        ]);
        const spinner = (0, output_js_1.createSpinner)('Creating resource…').start();
        try {
            const api = (0, api_js_1.createApiClient)(apiKey);
            const resource = await api.createResource({
                name: answers.name.trim(),
                description: answers.description.trim(),
                category: answers.category,
                price: answers.price,
                currency: answers.currency,
            });
            spinner.succeed('Resource created!');
            console.log('');
            (0, output_js_1.printKeyValue)('ID', resource.id);
            (0, output_js_1.printKeyValue)('Name', resource.name);
            (0, output_js_1.printKeyValue)('Price', output_js_1.c.money((0, output_js_1.formatMoney)(resource.price, resource.currency)));
            console.log('');
            (0, output_js_1.printSuccess)(`Resource "${resource.name}" created with ID ${resource.id}.`);
        }
        catch (error) {
            spinner.fail('Failed to create resource.');
            (0, output_js_1.handleApiError)(error);
        }
    });
    // DELETE
    resources
        .command('delete <id>')
        .description('Delete a resource by ID')
        .option('-y, --yes', 'Skip confirmation prompt')
        .action(async (id, opts) => {
        let apiKey;
        try {
            apiKey = (0, config_js_1.requireApiKey)();
        }
        catch (err) {
            (0, output_js_1.printError)(err.message);
            process.exit(1);
        }
        if (!opts.yes) {
            const { confirm } = await inquirer_1.default.prompt([
                {
                    type: 'confirm',
                    name: 'confirm',
                    message: `Delete resource ${output_js_1.c.bold(id)}? This cannot be undone.`,
                    default: false,
                },
            ]);
            if (!confirm) {
                console.log(output_js_1.c.muted('Aborted.'));
                return;
            }
        }
        const spinner = (0, output_js_1.createSpinner)(`Deleting resource ${id}…`).start();
        try {
            const api = (0, api_js_1.createApiClient)(apiKey);
            await api.deleteResource(id);
            spinner.succeed(`Resource ${id} deleted.`);
            (0, output_js_1.printSuccess)(`Resource ${id} has been permanently deleted.`);
        }
        catch (error) {
            spinner.fail(`Failed to delete resource ${id}.`);
            (0, output_js_1.handleApiError)(error);
        }
    });
}
//# sourceMappingURL=resources.js.map