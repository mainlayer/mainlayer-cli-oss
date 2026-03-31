import { Command } from 'commander';
import inquirer from 'inquirer';
import { createApiClient } from '../lib/api.js';
import { requireApiKey } from '../lib/config.js';
import {
  c,
  createSpinner,
  formatDate,
  handleApiError,
  printError,
  printHeader,
  printKeyValue,
  printSuccess,
  printTable,
  printWarn,
  statusBadge,
} from '../lib/output.js';

const AVAILABLE_EVENTS = [
  'payment.succeeded',
  'payment.failed',
  'payment.pending',
  'resource.created',
  'resource.updated',
  'resource.deleted',
  'entitlement.granted',
  'entitlement.revoked',
];

export function registerWebhooksCommand(program: Command): void {
  const webhooks = program
    .command('webhooks')
    .description('Manage webhook endpoints');

  // LIST
  webhooks
    .command('list')
    .description('List all configured webhooks')
    .action(async () => {
      let apiKey: string;
      try {
        apiKey = requireApiKey();
      } catch (err) {
        printError((err as Error).message);
        process.exit(1);
      }

      const spinner = createSpinner('Loading webhooks…').start();

      try {
        const api = createApiClient(apiKey);
        const hooks = await api.listWebhooks();
        spinner.stop();

        if (hooks.length === 0) {
          console.log('');
          console.log(c.muted('  No webhooks configured. Use `mainlayer webhooks create` to add one.'));
          console.log('');
          return;
        }

        printHeader(`Webhooks (${hooks.length})`);
        printTable(
          [
            { header: 'ID', key: 'id', width: 28 },
            { header: 'URL', key: 'url', width: 38 },
            {
              header: 'Events',
              key: 'events',
              width: 28,
              format: (v) => (v as string[]).join(', '),
            },
            {
              header: 'Status',
              key: 'isActive',
              width: 12,
              format: (v) => statusBadge(v ? 'Active' : 'Inactive'),
            },
            {
              header: 'Created',
              key: 'createdAt',
              width: 16,
              format: (v) => formatDate(String(v)),
            },
          ],
          hooks as unknown as Record<string, unknown>[],
        );
        console.log('');
      } catch (error) {
        spinner.fail('Failed to load webhooks.');
        handleApiError(error);
      }
    });

  // CREATE
  webhooks
    .command('create')
    .description('Register a new webhook endpoint')
    .option('-u, --url <url>', 'Webhook URL')
    .option('-e, --events <events>', 'Comma-separated list of events')
    .action(async (opts: { url?: string; events?: string }) => {
      let apiKey: string;
      try {
        apiKey = requireApiKey();
      } catch (err) {
        printError((err as Error).message);
        process.exit(1);
      }

      let url = opts.url;
      let events: string[] = opts.events
        ? opts.events.split(',').map((e) => e.trim())
        : [];

      if (!url || events.length === 0) {
        console.log('');
        console.log(c.bold('  Create a new webhook'));
        console.log('');

        const answers = await inquirer.prompt([
          ...(url
            ? []
            : [
                {
                  type: 'input',
                  name: 'url',
                  message: 'Webhook URL (must be HTTPS):',
                  validate: (v: string) => {
                    try {
                      const u = new URL(v);
                      return u.protocol === 'https:' || 'URL must use HTTPS.';
                    } catch {
                      return 'Please enter a valid URL.';
                    }
                  },
                },
              ]),
          ...(events.length === 0
            ? [
                {
                  type: 'checkbox',
                  name: 'events',
                  message: 'Select events to subscribe to:',
                  choices: AVAILABLE_EVENTS,
                  validate: (v: string[]) =>
                    v.length > 0 || 'Select at least one event.',
                },
              ]
            : []),
        ]);

        url = url ?? (answers.url as string);
        events = events.length > 0 ? events : (answers.events as string[]);
      }

      const spinner = createSpinner('Creating webhook…').start();

      try {
        const api = createApiClient(apiKey);
        const hook = await api.createWebhook({ url: url!, events });
        spinner.succeed('Webhook created!');

        console.log('');
        printKeyValue('ID', hook.id);
        printKeyValue('URL', hook.url);
        printKeyValue('Events', hook.events.join(', '));
        printKeyValue('Status', statusBadge('Active'));
        console.log('');
        printWarn('Store this webhook secret securely — it will not be shown again:');
        console.log(`  ${c.bold(c.primary(hook.secret))}`);
        console.log('');
        printSuccess('Webhook registered. Mainlayer will send events to your endpoint.');
      } catch (error) {
        spinner.fail('Failed to create webhook.');
        handleApiError(error);
      }
    });

  // DELETE
  webhooks
    .command('delete <id>')
    .description('Delete a webhook by ID')
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
            message: `Delete webhook ${c.bold(id)}?`,
            default: false,
          },
        ]);
        if (!confirm) {
          console.log(c.muted('Aborted.'));
          return;
        }
      }

      const spinner = createSpinner(`Deleting webhook ${id}…`).start();

      try {
        const api = createApiClient(apiKey);
        await api.deleteWebhook(id);
        spinner.succeed(`Webhook ${id} deleted.`);
      } catch (error) {
        spinner.fail('Failed to delete webhook.');
        handleApiError(error);
      }
    });
}
