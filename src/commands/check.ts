import { Command } from 'commander';
import { createApiClient } from '../lib/api.js';
import { requireApiKey } from '../lib/config.js';
import {
  c,
  createSpinner,
  formatDateTime,
  handleApiError,
  printError,
  printKeyValue,
  printSuccess,
  printWarn,
} from '../lib/output.js';

export function registerCheckCommand(program: Command): void {
  program
    .command('check <resource_id>')
    .description('Check entitlement for a wallet address on a resource')
    .requiredOption('-w, --wallet <address>', 'Wallet address to check')
    .action(async (resourceId: string, opts: { wallet: string }) => {
      let apiKey: string;
      try {
        apiKey = requireApiKey();
      } catch (err) {
        printError((err as Error).message);
        process.exit(1);
      }

      if (!opts.wallet || opts.wallet.trim().length < 3) {
        printError('A valid wallet address is required. Use --wallet <address>.');
        process.exit(1);
      }

      const spinner = createSpinner(
        `Checking entitlement for ${opts.wallet}…`,
      ).start();

      try {
        const api = createApiClient(apiKey);
        const entitlement = await api.checkEntitlement(
          resourceId,
          opts.wallet.trim(),
        );
        spinner.stop();

        console.log('');
        printKeyValue('Resource ID', resourceId);
        printKeyValue('Wallet', entitlement.wallet);
        printKeyValue(
          'Access',
          entitlement.hasAccess
            ? c.success('✓ Granted')
            : c.error('✕ Not granted'),
        );

        if (entitlement.purchasedAt) {
          printKeyValue('Purchased', formatDateTime(entitlement.purchasedAt));
        }
        if (entitlement.expiresAt) {
          const expiryDate = new Date(entitlement.expiresAt);
          const isExpired = expiryDate < new Date();
          printKeyValue(
            'Expires',
            isExpired
              ? c.error(formatDateTime(entitlement.expiresAt) + ' (expired)')
              : formatDateTime(entitlement.expiresAt),
          );
        }
        console.log('');

        if (entitlement.hasAccess) {
          printSuccess('This wallet has access to the resource.');
        } else {
          printWarn(
            `No access found. Use \`mainlayer pay ${resourceId}\` to purchase.`,
          );
        }
        console.log('');
      } catch (error) {
        spinner.fail('Entitlement check failed.');
        handleApiError(error);
      }
    });
}
