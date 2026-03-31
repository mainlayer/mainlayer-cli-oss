import { Command } from 'commander';
import inquirer from 'inquirer';
import { createApiClient } from '../lib/api.js';
import { requireApiKey } from '../lib/config.js';
import {
  c,
  createSpinner,
  formatDate,
  formatDateTime,
  handleApiError,
  printError,
  printHeader,
  printKeyValue,
  printSuccess,
  printTable,
  printWarn,
  statusBadge,
} from '../lib/output.js';

export function registerKeysCommand(program: Command): void {
  const keys = program
    .command('keys')
    .description('Manage your Mainlayer API keys');

  // LIST
  keys
    .command('list')
    .description('List all API keys for your account')
    .action(async () => {
      let apiKey: string;
      try {
        apiKey = requireApiKey();
      } catch (err) {
        printError((err as Error).message);
        process.exit(1);
      }

      const spinner = createSpinner('Loading API keys…').start();

      try {
        const api = createApiClient(apiKey);
        const allKeys = await api.listApiKeys();
        spinner.stop();

        if (allKeys.length === 0) {
          console.log('');
          console.log(c.muted('  No API keys found. Use `mainlayer keys create` to create one.'));
          console.log('');
          return;
        }

        printHeader(`API Keys (${allKeys.length})`);
        printTable(
          [
            { header: 'ID', key: 'id', width: 28 },
            { header: 'Name', key: 'name', width: 22 },
            { header: 'Prefix', key: 'prefix', width: 16 },
            {
              header: 'Status',
              key: 'isActive',
              width: 12,
              format: (v) => statusBadge(v ? 'Active' : 'Revoked'),
            },
            {
              header: 'Created',
              key: 'createdAt',
              width: 16,
              format: (v) => formatDate(String(v)),
            },
            {
              header: 'Last Used',
              key: 'lastUsedAt',
              width: 20,
              format: (v) =>
                v ? formatDateTime(String(v)) : c.muted('Never'),
            },
          ],
          allKeys as unknown as Record<string, unknown>[],
        );
        console.log('');
      } catch (error) {
        spinner.fail('Failed to load API keys.');
        handleApiError(error);
      }
    });

  // CREATE
  keys
    .command('create')
    .description('Create a new API key')
    .option('-n, --name <name>', 'Name for the new key')
    .action(async (opts: { name?: string }) => {
      let apiKey: string;
      try {
        apiKey = requireApiKey();
      } catch (err) {
        printError((err as Error).message);
        process.exit(1);
      }

      let keyName = opts.name;

      if (!keyName) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Name for this API key:',
            validate: (v: string) =>
              v.trim().length >= 2 ? true : 'Name must be at least 2 characters.',
          },
        ]);
        keyName = answers.name as string;
      }

      const spinner = createSpinner('Creating API key…').start();

      try {
        const api = createApiClient(apiKey);
        const newKey = await api.createApiKey({ name: keyName!.trim() });
        spinner.succeed('API key created!');

        console.log('');
        printKeyValue('ID', newKey.id);
        printKeyValue('Name', newKey.name);
        printKeyValue('Prefix', newKey.prefix);
        printKeyValue('Created', formatDate(newKey.createdAt));
        console.log('');
        printWarn('Copy your new API key now — it will not be shown again:');
        console.log('');
        console.log(`  ${c.bold(c.primary(newKey.key))}`);
        console.log('');
        printSuccess('Keep this key secure. Do not commit it to version control.');
      } catch (error) {
        spinner.fail('Failed to create API key.');
        handleApiError(error);
      }
    });

  // REVOKE
  keys
    .command('revoke <id>')
    .description('Revoke an API key by ID')
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
            message: `Revoke API key ${c.bold(id)}? Any app using this key will immediately lose access.`,
            default: false,
          },
        ]);
        if (!confirm) {
          console.log(c.muted('Aborted.'));
          return;
        }
      }

      const spinner = createSpinner(`Revoking key ${id}…`).start();

      try {
        const api = createApiClient(apiKey);
        await api.revokeApiKey(id);
        spinner.succeed(`API key ${id} revoked.`);
        printSuccess('The key is now inactive and cannot be used for authentication.');
      } catch (error) {
        spinner.fail('Failed to revoke API key.');
        handleApiError(error);
      }
    });
}
