"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerKeysCommand = registerKeysCommand;
const inquirer_1 = __importDefault(require("inquirer"));
const api_js_1 = require("../lib/api.js");
const config_js_1 = require("../lib/config.js");
const output_js_1 = require("../lib/output.js");
function registerKeysCommand(program) {
    const keys = program
        .command('keys')
        .description('Manage your Mainlayer API keys');
    // LIST
    keys
        .command('list')
        .description('List all API keys for your account')
        .action(async () => {
        let apiKey;
        try {
            apiKey = (0, config_js_1.requireApiKey)();
        }
        catch (err) {
            (0, output_js_1.printError)(err.message);
            process.exit(1);
        }
        const spinner = (0, output_js_1.createSpinner)('Loading API keys…').start();
        try {
            const api = (0, api_js_1.createApiClient)(apiKey);
            const allKeys = await api.listApiKeys();
            spinner.stop();
            if (allKeys.length === 0) {
                console.log('');
                console.log(output_js_1.c.muted('  No API keys found. Use `mainlayer keys create` to create one.'));
                console.log('');
                return;
            }
            (0, output_js_1.printHeader)(`API Keys (${allKeys.length})`);
            (0, output_js_1.printTable)([
                { header: 'ID', key: 'id', width: 28 },
                { header: 'Name', key: 'name', width: 22 },
                { header: 'Prefix', key: 'prefix', width: 16 },
                {
                    header: 'Status',
                    key: 'isActive',
                    width: 12,
                    format: (v) => (0, output_js_1.statusBadge)(v ? 'Active' : 'Revoked'),
                },
                {
                    header: 'Created',
                    key: 'createdAt',
                    width: 16,
                    format: (v) => (0, output_js_1.formatDate)(String(v)),
                },
                {
                    header: 'Last Used',
                    key: 'lastUsedAt',
                    width: 20,
                    format: (v) => v ? (0, output_js_1.formatDateTime)(String(v)) : output_js_1.c.muted('Never'),
                },
            ], allKeys);
            console.log('');
        }
        catch (error) {
            spinner.fail('Failed to load API keys.');
            (0, output_js_1.handleApiError)(error);
        }
    });
    // CREATE
    keys
        .command('create')
        .description('Create a new API key')
        .option('-n, --name <name>', 'Name for the new key')
        .action(async (opts) => {
        let apiKey;
        try {
            apiKey = (0, config_js_1.requireApiKey)();
        }
        catch (err) {
            (0, output_js_1.printError)(err.message);
            process.exit(1);
        }
        let keyName = opts.name;
        if (!keyName) {
            const answers = await inquirer_1.default.prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: 'Name for this API key:',
                    validate: (v) => v.trim().length >= 2 ? true : 'Name must be at least 2 characters.',
                },
            ]);
            keyName = answers.name;
        }
        const spinner = (0, output_js_1.createSpinner)('Creating API key…').start();
        try {
            const api = (0, api_js_1.createApiClient)(apiKey);
            const newKey = await api.createApiKey({ name: keyName.trim() });
            spinner.succeed('API key created!');
            console.log('');
            (0, output_js_1.printKeyValue)('ID', newKey.id);
            (0, output_js_1.printKeyValue)('Name', newKey.name);
            (0, output_js_1.printKeyValue)('Prefix', newKey.prefix);
            (0, output_js_1.printKeyValue)('Created', (0, output_js_1.formatDate)(newKey.createdAt));
            console.log('');
            (0, output_js_1.printWarn)('Copy your new API key now — it will not be shown again:');
            console.log('');
            console.log(`  ${output_js_1.c.bold(output_js_1.c.primary(newKey.key))}`);
            console.log('');
            (0, output_js_1.printSuccess)('Keep this key secure. Do not commit it to version control.');
        }
        catch (error) {
            spinner.fail('Failed to create API key.');
            (0, output_js_1.handleApiError)(error);
        }
    });
    // REVOKE
    keys
        .command('revoke <id>')
        .description('Revoke an API key by ID')
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
                    message: `Revoke API key ${output_js_1.c.bold(id)}? Any app using this key will immediately lose access.`,
                    default: false,
                },
            ]);
            if (!confirm) {
                console.log(output_js_1.c.muted('Aborted.'));
                return;
            }
        }
        const spinner = (0, output_js_1.createSpinner)(`Revoking key ${id}…`).start();
        try {
            const api = (0, api_js_1.createApiClient)(apiKey);
            await api.revokeApiKey(id);
            spinner.succeed(`API key ${id} revoked.`);
            (0, output_js_1.printSuccess)('The key is now inactive and cannot be used for authentication.');
        }
        catch (error) {
            spinner.fail('Failed to revoke API key.');
            (0, output_js_1.handleApiError)(error);
        }
    });
}
//# sourceMappingURL=keys.js.map