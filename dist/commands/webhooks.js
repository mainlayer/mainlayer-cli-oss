"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWebhooksCommand = registerWebhooksCommand;
const inquirer_1 = __importDefault(require("inquirer"));
const api_js_1 = require("../lib/api.js");
const config_js_1 = require("../lib/config.js");
const output_js_1 = require("../lib/output.js");
const AVAILABLE_EVENTS = [
    'payment.succeeded',
    'payment.failed',
    'payment.pending',
    'resource.created',
    'resource.updated',
    'resource.deleted',
    'entitlement.granted',
    'entitlement.revoked',
];
function registerWebhooksCommand(program) {
    const webhooks = program
        .command('webhooks')
        .description('Manage webhook endpoints');
    // LIST
    webhooks
        .command('list')
        .description('List all configured webhooks')
        .action(async () => {
        let apiKey;
        try {
            apiKey = (0, config_js_1.requireApiKey)();
        }
        catch (err) {
            (0, output_js_1.printError)(err.message);
            process.exit(1);
        }
        const spinner = (0, output_js_1.createSpinner)('Loading webhooks…').start();
        try {
            const api = (0, api_js_1.createApiClient)(apiKey);
            const hooks = await api.listWebhooks();
            spinner.stop();
            if (hooks.length === 0) {
                console.log('');
                console.log(output_js_1.c.muted('  No webhooks configured. Use `mainlayer webhooks create` to add one.'));
                console.log('');
                return;
            }
            (0, output_js_1.printHeader)(`Webhooks (${hooks.length})`);
            (0, output_js_1.printTable)([
                { header: 'ID', key: 'id', width: 28 },
                { header: 'URL', key: 'url', width: 38 },
                {
                    header: 'Events',
                    key: 'events',
                    width: 28,
                    format: (v) => v.join(', '),
                },
                {
                    header: 'Status',
                    key: 'isActive',
                    width: 12,
                    format: (v) => (0, output_js_1.statusBadge)(v ? 'Active' : 'Inactive'),
                },
                {
                    header: 'Created',
                    key: 'createdAt',
                    width: 16,
                    format: (v) => (0, output_js_1.formatDate)(String(v)),
                },
            ], hooks);
            console.log('');
        }
        catch (error) {
            spinner.fail('Failed to load webhooks.');
            (0, output_js_1.handleApiError)(error);
        }
    });
    // CREATE
    webhooks
        .command('create')
        .description('Register a new webhook endpoint')
        .option('-u, --url <url>', 'Webhook URL')
        .option('-e, --events <events>', 'Comma-separated list of events')
        .action(async (opts) => {
        let apiKey;
        try {
            apiKey = (0, config_js_1.requireApiKey)();
        }
        catch (err) {
            (0, output_js_1.printError)(err.message);
            process.exit(1);
        }
        let url = opts.url;
        let events = opts.events
            ? opts.events.split(',').map((e) => e.trim())
            : [];
        if (!url || events.length === 0) {
            console.log('');
            console.log(output_js_1.c.bold('  Create a new webhook'));
            console.log('');
            const answers = await inquirer_1.default.prompt([
                ...(url
                    ? []
                    : [
                        {
                            type: 'input',
                            name: 'url',
                            message: 'Webhook URL (must be HTTPS):',
                            validate: (v) => {
                                try {
                                    const u = new URL(v);
                                    return u.protocol === 'https:' || 'URL must use HTTPS.';
                                }
                                catch {
                                    return 'Please enter a valid URL.';
                                }
                            },
                        },
                    ]),
                ...(events.length === 0
                    ? [
                        {
                            type: 'checkbox',
                            name: 'events',
                            message: 'Select events to subscribe to:',
                            choices: AVAILABLE_EVENTS,
                            validate: (v) => v.length > 0 || 'Select at least one event.',
                        },
                    ]
                    : []),
            ]);
            url = url ?? answers.url;
            events = events.length > 0 ? events : answers.events;
        }
        const spinner = (0, output_js_1.createSpinner)('Creating webhook…').start();
        try {
            const api = (0, api_js_1.createApiClient)(apiKey);
            const hook = await api.createWebhook({ url: url, events });
            spinner.succeed('Webhook created!');
            console.log('');
            (0, output_js_1.printKeyValue)('ID', hook.id);
            (0, output_js_1.printKeyValue)('URL', hook.url);
            (0, output_js_1.printKeyValue)('Events', hook.events.join(', '));
            (0, output_js_1.printKeyValue)('Status', (0, output_js_1.statusBadge)('Active'));
            console.log('');
            (0, output_js_1.printWarn)('Store this webhook secret securely — it will not be shown again:');
            console.log(`  ${output_js_1.c.bold(output_js_1.c.primary(hook.secret))}`);
            console.log('');
            (0, output_js_1.printSuccess)('Webhook registered. Mainlayer will send events to your endpoint.');
        }
        catch (error) {
            spinner.fail('Failed to create webhook.');
            (0, output_js_1.handleApiError)(error);
        }
    });
    // DELETE
    webhooks
        .command('delete <id>')
        .description('Delete a webhook by ID')
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
                    message: `Delete webhook ${output_js_1.c.bold(id)}?`,
                    default: false,
                },
            ]);
            if (!confirm) {
                console.log(output_js_1.c.muted('Aborted.'));
                return;
            }
        }
        const spinner = (0, output_js_1.createSpinner)(`Deleting webhook ${id}…`).start();
        try {
            const api = (0, api_js_1.createApiClient)(apiKey);
            await api.deleteWebhook(id);
            spinner.succeed(`Webhook ${id} deleted.`);
        }
        catch (error) {
            spinner.fail('Failed to delete webhook.');
            (0, output_js_1.handleApiError)(error);
        }
    });
}
//# sourceMappingURL=webhooks.js.map