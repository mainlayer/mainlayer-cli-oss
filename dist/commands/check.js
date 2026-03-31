"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCheckCommand = registerCheckCommand;
const api_js_1 = require("../lib/api.js");
const config_js_1 = require("../lib/config.js");
const output_js_1 = require("../lib/output.js");
function registerCheckCommand(program) {
    program
        .command('check <resource_id>')
        .description('Check entitlement for a wallet address on a resource')
        .requiredOption('-w, --wallet <address>', 'Wallet address to check')
        .action(async (resourceId, opts) => {
        let apiKey;
        try {
            apiKey = (0, config_js_1.requireApiKey)();
        }
        catch (err) {
            (0, output_js_1.printError)(err.message);
            process.exit(1);
        }
        if (!opts.wallet || opts.wallet.trim().length < 3) {
            (0, output_js_1.printError)('A valid wallet address is required. Use --wallet <address>.');
            process.exit(1);
        }
        const spinner = (0, output_js_1.createSpinner)(`Checking entitlement for ${opts.wallet}…`).start();
        try {
            const api = (0, api_js_1.createApiClient)(apiKey);
            const entitlement = await api.checkEntitlement(resourceId, opts.wallet.trim());
            spinner.stop();
            console.log('');
            (0, output_js_1.printKeyValue)('Resource ID', resourceId);
            (0, output_js_1.printKeyValue)('Wallet', entitlement.wallet);
            (0, output_js_1.printKeyValue)('Access', entitlement.hasAccess
                ? output_js_1.c.success('✓ Granted')
                : output_js_1.c.error('✕ Not granted'));
            if (entitlement.purchasedAt) {
                (0, output_js_1.printKeyValue)('Purchased', (0, output_js_1.formatDateTime)(entitlement.purchasedAt));
            }
            if (entitlement.expiresAt) {
                const expiryDate = new Date(entitlement.expiresAt);
                const isExpired = expiryDate < new Date();
                (0, output_js_1.printKeyValue)('Expires', isExpired
                    ? output_js_1.c.error((0, output_js_1.formatDateTime)(entitlement.expiresAt) + ' (expired)')
                    : (0, output_js_1.formatDateTime)(entitlement.expiresAt));
            }
            console.log('');
            if (entitlement.hasAccess) {
                (0, output_js_1.printSuccess)('This wallet has access to the resource.');
            }
            else {
                (0, output_js_1.printWarn)(`No access found. Use \`mainlayer pay ${resourceId}\` to purchase.`);
            }
            console.log('');
        }
        catch (error) {
            spinner.fail('Entitlement check failed.');
            (0, output_js_1.handleApiError)(error);
        }
    });
}
//# sourceMappingURL=check.js.map