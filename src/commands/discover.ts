import { Command } from 'commander';
import { createApiClient } from '../lib/api.js';
import { requireApiKey } from '../lib/config.js';
import {
  c,
  createSpinner,
  formatMoney,
  handleApiError,
  printError,
  printHeader,
  printInfo,
  printTable,
} from '../lib/output.js';

export function registerDiscoverCommand(program: Command): void {
  program
    .command('discover [query]')
    .description('Browse available resources on the Mainlayer marketplace')
    .option('-p, --page <number>', 'Page number', '1')
    .option('-n, --per-page <number>', 'Results per page', '20')
    .action(async (query: string | undefined, _opts: { page: string; perPage: string }) => {
      let apiKey: string;
      try {
        apiKey = requireApiKey();
      } catch (err) {
        printError((err as Error).message);
        process.exit(1);
      }

      const spinnerText = query
        ? `Searching for "${query}"…`
        : 'Loading available resources…';

      const spinner = createSpinner(spinnerText).start();

      try {
        const api = createApiClient(apiKey);
        const result = await api.discoverResources(query);
        spinner.stop();

        const title = query
          ? `Search results for "${query}" (${result.total} found)`
          : `Marketplace (${result.total} available)`;

        if (result.data.length === 0) {
          console.log('');
          if (query) {
            console.log(c.muted(`  No resources matched "${query}". Try a different search term.`));
          } else {
            console.log(c.muted('  No resources available yet.'));
          }
          console.log('');
          return;
        }

        printHeader(title);
        printTable(
          [
            { header: 'ID', key: 'id', width: 28 },
            { header: 'Name', key: 'name', width: 24 },
            { header: 'Category', key: 'category', width: 16 },
            { header: 'Description', key: 'description', width: 36 },
            {
              header: 'Price',
              key: 'price',
              width: 14,
              format: (v) => c.money(formatMoney(v as number)),
            },
          ],
          result.data.map((r) => ({
            ...r,
            description:
              r.description.length > 32
                ? `${r.description.slice(0, 32)}…`
                : r.description,
          })) as unknown as Record<string, unknown>[],
        );

        console.log(
          c.muted(
            `  Page ${result.page} of ${Math.ceil(result.total / result.perPage)}`,
          ),
        );
        console.log('');
        printInfo(`Use ${c.bold('mainlayer pay <resource_id>')} to purchase any resource.`);
        console.log('');
      } catch (error) {
        spinner.fail('Failed to load resources.');
        handleApiError(error);
      }
    });
}
