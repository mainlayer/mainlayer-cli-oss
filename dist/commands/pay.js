"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPayCommand = registerPayCommand;
const inquirer_1 = __importDefault(require("inquirer"));
const api_js_1 = require("../lib/api.js");
const config_js_1 = require("../lib/config.js");
const output_js_1 = require("../lib/output.js");
function registerPayCommand(program) {
    program
        .command('pay <resource_id>')
        .description('Pay for a resource to gain access')
        .option('-w, --wallet <address>', 'Wallet address for the payment')
        .option('-y, --yes', 'Skip confirmation prompt')
        .action(async (resourceId, opts) => {
        let apiKey;
        try {
            apiKey = (0, config_js_1.requireApiKey)();
        }
        catch (err) {
            (0, output_js_1.printError)(err.message);
            process.exit(1);
        }
        const api = (0, api_js_1.createApiClient)(apiKey);
        // Fetch resource details first
        const fetchSpinner = (0, output_js_1.createSpinner)('Fetching resource details…').start();
        let resource;
        try {
            resource = await api.getResource(resourceId);
            fetchSpinner.stop();
        }
        catch (error) {
            fetchSpinner.fail('Resource not found.');
            (0, output_js_1.handleApiError)(error);
        }
        console.log('');
        (0, output_js_1.printKeyValue)('Resource', output_js_1.c.bold(resource.name));
        (0, output_js_1.printKeyValue)('Category', resource.category);
        (0, output_js_1.printKeyValue)('Price', output_js_1.c.money((0, output_js_1.formatMoney)(resource.price, resource.currency)));
        if (opts.wallet) {
            (0, output_js_1.printKeyValue)('Wallet', opts.wallet);
        }
        console.log('');
        if (!opts.yes) {
            const { confirm } = await inquirer_1.default.prompt([
                {
                    type: 'confirm',
                    name: 'confirm',
                    message: `Confirm payment of ${output_js_1.c.money((0, output_js_1.formatMoney)(resource.price, resource.currency))} for "${resource.name}"?`,
                    default: false,
                },
            ]);
            if (!confirm) {
                console.log(output_js_1.c.muted('Payment cancelled.'));
                return;
            }
        }
        const paySpinner = (0, output_js_1.createSpinner)('Processing payment…').start();
        try {
            const result = await api.payForResource(resourceId, {
                wallet: opts.wallet,
            });
            paySpinner.succeed('Payment successful!');
            console.log('');
            (0, output_js_1.printKeyValue)('Payment ID', result.paymentId);
            (0, output_js_1.printKeyValue)('Status', result.status);
            (0, output_js_1.printKeyValue)('Amount', output_js_1.c.money((0, output_js_1.formatMoney)(result.amount, result.currency)));
            (0, output_js_1.printKeyValue)('Resource ID', result.resourceId);
            if (result.wallet) {
                (0, output_js_1.printKeyValue)('Wallet', result.wallet);
            }
            console.log('');
            (0, output_js_1.printSuccess)('Access granted. Use `mainlayer check` to verify your entitlement.');
        }
        catch (error) {
            paySpinner.fail('Payment failed.');
            (0, output_js_1.handleApiError)(error);
        }
    });
}
//# sourceMappingURL=pay.js.map