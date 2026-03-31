"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerLoginCommand = registerLoginCommand;
const inquirer_1 = __importDefault(require("inquirer"));
const api_js_1 = require("../lib/api.js");
const config_js_1 = require("../lib/config.js");
const output_js_1 = require("../lib/output.js");
function registerLoginCommand(program) {
    program
        .command('login')
        .description('Authenticate with your Mainlayer API key')
        .option('-k, --key <apiKey>', 'API key (skips interactive prompt)')
        .action(async (opts) => {
        let apiKey = opts.key;
        if (!apiKey) {
            console.log('');
            console.log(output_js_1.c.bold('  Mainlayer Login'));
            console.log(output_js_1.c.muted('  Get your API key from https://app.mainlayer.xyz/settings/keys'));
            console.log('');
            const answers = await inquirer_1.default.prompt([
                {
                    type: 'password',
                    name: 'apiKey',
                    message: 'Enter your API key:',
                    mask: '*',
                    validate: (input) => {
                        if (!input || input.trim().length < 10) {
                            return 'API key must be at least 10 characters.';
                        }
                        return true;
                    },
                },
            ]);
            apiKey = answers.apiKey;
        }
        const key = apiKey.trim();
        const spinner = (0, output_js_1.createSpinner)('Verifying API key…').start();
        try {
            const api = new api_js_1.MainlayerApi(key);
            const vendor = await api.whoami();
            (0, config_js_1.saveConfig)({ apiKey: key });
            spinner.succeed('API key verified and saved.');
            console.log('');
            (0, output_js_1.printKeyValue)('Vendor', vendor.name);
            (0, output_js_1.printKeyValue)('Email', vendor.email);
            (0, output_js_1.printKeyValue)('ID', vendor.id);
            (0, output_js_1.printKeyValue)('Config saved to', (0, config_js_1.configFilePath)());
            console.log('');
            (0, output_js_1.printSuccess)(`You are now logged in as ${output_js_1.c.bold(vendor.name)}.`);
        }
        catch (error) {
            spinner.fail('Could not verify API key.');
            const err = error;
            if (err.status === 401) {
                (0, output_js_1.printError)('Invalid API key. Check your key and try again.');
                process.exit(1);
            }
            (0, output_js_1.handleApiError)(error);
        }
    });
    program
        .command('logout')
        .description('Remove stored API key')
        .action(() => {
        (0, config_js_1.clearConfig)();
        (0, output_js_1.printSuccess)('Logged out. API key removed from local config.');
    });
    program
        .command('whoami')
        .description('Show the currently authenticated vendor')
        .action(async () => {
        let apiKey;
        try {
            apiKey = (0, config_js_1.requireApiKey)();
        }
        catch (error) {
            const err = error;
            (0, output_js_1.printError)(err.message);
            process.exit(1);
        }
        const spinner = (0, output_js_1.createSpinner)('Fetching account info…').start();
        try {
            const api = new api_js_1.MainlayerApi(apiKey);
            const vendor = await api.whoami();
            spinner.stop();
            console.log('');
            (0, output_js_1.printKeyValue)('Name', output_js_1.c.bold(vendor.name));
            (0, output_js_1.printKeyValue)('Email', vendor.email);
            (0, output_js_1.printKeyValue)('Vendor ID', vendor.id);
            (0, output_js_1.printKeyValue)('Member since', new Date(vendor.createdAt).toLocaleDateString());
            console.log('');
        }
        catch (error) {
            spinner.fail('Failed to fetch account info.');
            (0, output_js_1.handleApiError)(error);
        }
    });
}
//# sourceMappingURL=login.js.map