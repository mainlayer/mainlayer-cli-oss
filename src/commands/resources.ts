import { Command } from 'commander';
import inquirer from 'inquirer';
import { createApiClient } from '../lib/api.js';
import { requireApiKey } from '../lib/config.js';
import {
  c,
  createSpinner,
  formatDate,
  formatMoney,
  handleApiError,
  printError,
  printHeader,
  printKeyValue,
  printSuccess,
  printTable,
  statusBadge,
} from '../lib/output.js';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
const CATEGORIES = [
  'AI Model',
  'Data Feed',
  'API Endpoint',
  'Compute',
  'Storage',
  'Analytics',
  'Other',
];

export function registerResourcesCommand(program: Command): void {
  const resources = program
    .command('resources')
    .description('Manage your Mainlayer resources');

  // LIST
  resources
    .command('list')
    .description('List all resources for your account')
    .option('-p, --page <number>', 'Page number', '1')
    .option('-n, --per-page <number>', 'Results per page', '20')
    .action(async (opts: { page: string; perPage: string }) => {
      let apiKey: string;
      try {
        apiKey = requireApiKey();
      } catch (err) {
        printError((err as Error).message);
        process.exit(1);
      }

      const spinner = createSpinner('Loading resources…').start();

      try {
        const api = createApiClient(apiKey);
        const result = await api.listResources({
          page: parseInt(opts.page, 10),
          perPage: parseInt(opts.perPage, 10),
        });
        spinner.stop();

        if (result.data.length === 0) {
          console.log('');
          console.log(c.muted('  No resources found. Create one with `mainlayer resources create`.'));
          console.log('');
          return;
        }

        printHeader(`Resources (${result.total} total)`);
        printTable(
          [
            { header: 'ID', key: 'id', width: 28 },
            { header: 'Name', key: 'name', width: 24 },
            { header: 'Category', key: 'category', width: 16 },
            {
              header: 'Price',
              key: 'price',
              width: 14,
              format: (v) =>
                c.money(formatMoney(v as number)),
            },
            {
              header: 'Status',
              key: 'isActive',
              width: 14,
              format: (v) => statusBadge(v ? 'Active' : 'Inactive'),
            },
            {
              header: 'Created',
              key: 'createdAt',
              width: 16,
              format: (v) => formatDate(String(v)),
            },
          ],
          result.data as unknown as Record<string, unknown>[],
        );
        console.log(
          c.muted(
            `  Page ${result.page} of ${Math.ceil(result.total / result.perPage)}`,
          ),
        );
        console.log('');
      } catch (error) {
        spinner.fail('Failed to load resources.');
        handleApiError(error);
      }
    });

  // GET
  resources
    .command('get <id>')
    .description('Get details for a specific resource')
    .action(async (id: string) => {
      let apiKey: string;
      try {
        apiKey = requireApiKey();
      } catch (err) {
        printError((err as Error).message);
        process.exit(1);
      }

      const spinner = createSpinner(`Fetching resource ${id}…`).start();

      try {
        const api = createApiClient(apiKey);
        const resource = await api.getResource(id);
        spinner.stop();

        printHeader(resource.name);
        printKeyValue('ID', resource.id);
        printKeyValue('Name', resource.name);
        printKeyValue('Description', resource.description);
        printKeyValue('Category', resource.category);
        printKeyValue('Price', c.money(formatMoney(resource.price, resource.currency)));
        printKeyValue('Currency', resource.currency);
        printKeyValue('Status', statusBadge(resource.isActive ? 'Active' : 'Inactive'));
        printKeyValue('Created', formatDate(resource.createdAt));
        printKeyValue('Updated', formatDate(resource.updatedAt));
        console.log('');
      } catch (error) {
        spinner.fail(`Failed to fetch resource ${id}.`);
        handleApiError(error);
      }
    });

  // CREATE
  resources
    .command('create')
    .description('Interactively create a new resource')
    .action(async () => {
      let apiKey: string;
      try {
        apiKey = requireApiKey();
      } catch (err) {
        printError((err as Error).message);
        process.exit(1);
      }

      console.log('');
      console.log(c.bold('  Create a new resource'));
      console.log('');

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Resource name:',
          validate: (v: string) => (v.trim().length >= 2 ? true : 'Name must be at least 2 characters.'),
        },
        {
          type: 'input',
          name: 'description',
          message: 'Description:',
          validate: (v: string) => (v.trim().length >= 5 ? true : 'Description must be at least 5 characters.'),
        },
        {
          type: 'list',
          name: 'category',
          message: 'Category:',
          choices: CATEGORIES,
        },
        {
          type: 'number',
          name: 'price',
          message: 'Price (in cents, e.g. 100 = $1.00):',
          validate: (v: number) => (v >= 0 ? true : 'Price must be 0 or greater.'),
        },
        {
          type: 'list',
          name: 'currency',
          message: 'Currency:',
          choices: CURRENCIES,
          default: 'USD',
        },
      ]);

      const spinner = createSpinner('Creating resource…').start();

      try {
        const api = createApiClient(apiKey);
        const resource = await api.createResource({
          name: (answers.name as string).trim(),
          description: (answers.description as string).trim(),
          category: answers.category as string,
          price: answers.price as number,
          currency: answers.currency as string,
        });
        spinner.succeed('Resource created!');

        console.log('');
        printKeyValue('ID', resource.id);
        printKeyValue('Name', resource.name);
        printKeyValue('Price', c.money(formatMoney(resource.price, resource.currency)));
        console.log('');
        printSuccess(`Resource "${resource.name}" created with ID ${resource.id}.`);
      } catch (error) {
        spinner.fail('Failed to create resource.');
        handleApiError(error);
      }
    });

  // DELETE
  resources
    .command('delete <id>')
    .description('Delete a resource by ID')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action(async (id: string, opts: { yes?: boolean }) => {
      let apiKey: string;
      try {
        apiKey = requireApiKey();
      } catch (err) {
        printError((err as Error).message);
        process.exit(1);
      }

      if (!opts.yes) {
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Delete resource ${c.bold(id)}? This cannot be undone.`,
            default: false,
          },
        ]);
        if (!confirm) {
          console.log(c.muted('Aborted.'));
          return;
        }
      }

      const spinner = createSpinner(`Deleting resource ${id}…`).start();

      try {
        const api = createApiClient(apiKey);
        await api.deleteResource(id);
        spinner.succeed(`Resource ${id} deleted.`);
        printSuccess(`Resource ${id} has been permanently deleted.`);
      } catch (error) {
        spinner.fail(`Failed to delete resource ${id}.`);
        handleApiError(error);
      }
    });
}
