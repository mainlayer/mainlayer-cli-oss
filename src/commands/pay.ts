import { Command } from 'commander';
import inquirer from 'inquirer';
import { createApiClient } from '../lib/api.js';
import { requireApiKey } from '../lib/config.js';
import {
  c,
  createSpinner,
  formatMoney,
  handleApiError,
  printError,
  printKeyValue,
  printSuccess,
} from '../lib/output.js';

export function registerPayCommand(program: Command): void {
  program
    .command('pay <resource_id>')
    .description('Pay for a resource to gain access')
    .option('-w, --wallet <address>', 'Wallet address for the payment')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action(
      async (
        resourceId: string,
        opts: { wallet?: string; yes?: boolean },
      ) => {
        let apiKey: string;
        try {
          apiKey = requireApiKey();
        } catch (err) {
          printError((err as Error).message);
          process.exit(1);
        }

        const api = createApiClient(apiKey);

        // Fetch resource details first
        const fetchSpinner = createSpinner('Fetching resource details…').start();
        let resource;
        try {
          resource = await api.getResource(resourceId);
          fetchSpinner.stop();
        } catch (error) {
          fetchSpinner.fail('Resource not found.');
          handleApiError(error);
        }

        console.log('');
        printKeyValue('Resource', c.bold(resource!.name));
        printKeyValue('Category', resource!.category);
        printKeyValue('Price', c.money(formatMoney(resource!.price, resource!.currency)));
        if (opts.wallet) {
          printKeyValue('Wallet', opts.wallet);
        }
        console.log('');

        if (!opts.yes) {
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Confirm payment of ${c.money(formatMoney(resource!.price, resource!.currency))} for "${resource!.name}"?`,
              default: false,
            },
          ]);
          if (!confirm) {
            console.log(c.muted('Payment cancelled.'));
            return;
          }
        }

        const paySpinner = createSpinner('Processing payment…').start();

        try {
          const result = await api.payForResource(resourceId, {
            wallet: opts.wallet,
          });
          paySpinner.succeed('Payment successful!');

          console.log('');
          printKeyValue('Payment ID', result.paymentId);
          printKeyValue('Status', result.status);
          printKeyValue('Amount', c.money(formatMoney(result.amount, result.currency)));
          printKeyValue('Resource ID', result.resourceId);
          if (result.wallet) {
            printKeyValue('Wallet', result.wallet);
          }
          console.log('');
          printSuccess('Access granted. Use `mainlayer check` to verify your entitlement.');
        } catch (error) {
          paySpinner.fail('Payment failed.');
          handleApiError(error);
        }
      },
    );
}
