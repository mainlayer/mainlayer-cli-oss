import { Command } from 'commander';
import { createApiClient } from '../lib/api.js';
import { requireApiKey } from '../lib/config.js';
import {
  c,
  createSpinner,
  formatDateTime,
  formatMoney,
  handleApiError,
  printError,
  printHeader,
  printTable,
  statusBadge,
} from '../lib/output.js';

export function registerPaymentsCommand(program: Command): void {
  program
    .command('payments')
    .description('View payment history')
    .option('-p, --page <number>', 'Page number', '1')
    .option('-n, --per-page <number>', 'Results per page', '25')
    .action(async (opts: { page: string; perPage: string }) => {
      let apiKey: string;
      try {
        apiKey = requireApiKey();
      } catch (err) {
        printError((err as Error).message);
        process.exit(1);
      }

      const spinner = createSpinner('Loading payment history…').start();

      try {
        const api = createApiClient(apiKey);
        const result = await api.listPayments({
          page: parseInt(opts.page, 10),
          perPage: parseInt(opts.perPage, 10),
        });
        spinner.stop();

        if (result.data.length === 0) {
          console.log('');
          console.log(c.muted('  No payments found yet.'));
          console.log('');
          return;
        }

        const totalRevenue = result.data
          .filter((p) => p.status === 'succeeded')
          .reduce((sum, p) => sum + p.amount, 0);

        printHeader(`Payment History (${result.total} total)`);

        printTable(
          [
            { header: 'ID', key: 'id', width: 28 },
            { header: 'Resource', key: 'resourceName', width: 22 },
            {
              header: 'Amount',
              key: 'amount',
              width: 14,
              format: (v) => c.money(formatMoney(v as number)),
            },
            {
              header: 'Status',
              key: 'status',
              width: 14,
              format: (v) => statusBadge(String(v)),
            },
            { header: 'Wallet', key: 'wallet', width: 22 },
            {
              header: 'Date',
              key: 'createdAt',
              width: 20,
              format: (v) => formatDateTime(String(v)),
            },
          ],
          result.data as unknown as Record<string, unknown>[],
        );

        console.log(
          `  ${c.label('Total revenue (this page):')} ${c.money(formatMoney(totalRevenue))}`,
        );
        console.log(
          c.muted(
            `  Page ${result.page} of ${Math.ceil(result.total / result.perPage)}`,
          ),
        );
        console.log('');
      } catch (error) {
        spinner.fail('Failed to load payments.');
        handleApiError(error);
      }
    });
}
