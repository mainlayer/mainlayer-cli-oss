#!/usr/bin/env node

import { Command } from 'commander';
import { registerAnalyticsCommand } from './commands/analytics.js';
import { registerCheckCommand } from './commands/check.js';
import { registerDiscoverCommand } from './commands/discover.js';
import { registerKeysCommand } from './commands/keys.js';
import { registerLoginCommand } from './commands/login.js';
import { registerPayCommand } from './commands/pay.js';
import { registerPaymentsCommand } from './commands/payments.js';
import { registerResourcesCommand } from './commands/resources.js';
import { registerWebhooksCommand } from './commands/webhooks.js';

const program = new Command();

program
  .name('mainlayer')
  .description('Official CLI for the Mainlayer payment infrastructure API')
  .version('1.0.0', '-v, --version', 'Display version number')
  .helpOption('-h, --help', 'Display help for command');

// Auth
registerLoginCommand(program);

// Resources
registerResourcesCommand(program);

// Payments
registerPaymentsCommand(program);

// Analytics
registerAnalyticsCommand(program);

// Discover marketplace
registerDiscoverCommand(program);

// Pay for a resource
registerPayCommand(program);

// Check entitlement
registerCheckCommand(program);

// Webhooks
registerWebhooksCommand(program);

// API Key management
registerKeysCommand(program);

// Default: show help if no command given
program.addHelpCommand('help [command]', 'Display help for command');

program.parse(process.argv);

// Show help if called with no arguments
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
