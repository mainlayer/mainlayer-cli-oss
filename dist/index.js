#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const analytics_js_1 = require("./commands/analytics.js");
const check_js_1 = require("./commands/check.js");
const discover_js_1 = require("./commands/discover.js");
const keys_js_1 = require("./commands/keys.js");
const login_js_1 = require("./commands/login.js");
const pay_js_1 = require("./commands/pay.js");
const payments_js_1 = require("./commands/payments.js");
const resources_js_1 = require("./commands/resources.js");
const webhooks_js_1 = require("./commands/webhooks.js");
const program = new commander_1.Command();
program
    .name('mainlayer')
    .description('Official CLI for the Mainlayer payment infrastructure API')
    .version('1.0.0', '-v, --version', 'Display version number')
    .helpOption('-h, --help', 'Display help for command');
// Auth
(0, login_js_1.registerLoginCommand)(program);
// Resources
(0, resources_js_1.registerResourcesCommand)(program);
// Payments
(0, payments_js_1.registerPaymentsCommand)(program);
// Analytics
(0, analytics_js_1.registerAnalyticsCommand)(program);
// Discover marketplace
(0, discover_js_1.registerDiscoverCommand)(program);
// Pay for a resource
(0, pay_js_1.registerPayCommand)(program);
// Check entitlement
(0, check_js_1.registerCheckCommand)(program);
// Webhooks
(0, webhooks_js_1.registerWebhooksCommand)(program);
// API Key management
(0, keys_js_1.registerKeysCommand)(program);
// Default: show help if no command given
program.addHelpCommand('help [command]', 'Display help for command');
program.parse(process.argv);
// Show help if called with no arguments
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
//# sourceMappingURL=index.js.map