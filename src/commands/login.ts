import { Command } from 'commander';
import inquirer from 'inquirer';
import { MainlayerApi } from '../lib/api.js';
import { clearConfig, configFilePath, requireApiKey, saveConfig } from '../lib/config.js';
import {
  c,
  createSpinner,
  handleApiError,
  printError,
  printKeyValue,
  printSuccess,
} from '../lib/output.js';

export function registerLoginCommand(program: Command): void {
  program
    .command('login')
    .description('Authenticate with your Mainlayer API key')
    .option('-k, --key <apiKey>', 'API key (skips interactive prompt)')
    .action(async (opts: { key?: string }) => {
      let apiKey = opts.key;

      if (!apiKey) {
        console.log('');
        console.log(c.bold('  Mainlayer Login'));
        console.log(c.muted('  Get your API key from https://app.mainlayer.xyz/settings/keys'));
        console.log('');

        const answers = await inquirer.prompt([
          {
            type: 'password',
            name: 'apiKey',
            message: 'Enter your API key:',
            mask: '*',
            validate: (input: string) => {
              if (!input || input.trim().length < 10) {
                return 'API key must be at least 10 characters.';
              }
              return true;
            },
          },
        ]);
        apiKey = answers.apiKey as string;
      }

      const key = apiKey.trim();

      const spinner = createSpinner('Verifying API key…').start();

      try {
        const api = new MainlayerApi(key);
        const vendor = await api.whoami();

        saveConfig({ apiKey: key });

        spinner.succeed('API key verified and saved.');

        console.log('');
        printKeyValue('Vendor', vendor.name);
        printKeyValue('Email', vendor.email);
        printKeyValue('ID', vendor.id);
        printKeyValue('Config saved to', configFilePath());
        console.log('');
        printSuccess(`You are now logged in as ${c.bold(vendor.name)}.`);
      } catch (error) {
        spinner.fail('Could not verify API key.');
        const err = error as Error & { status?: number };
        if (err.status === 401) {
          printError('Invalid API key. Check your key and try again.');
          process.exit(1);
        }
        handleApiError(error);
      }
    });

  program
    .command('logout')
    .description('Remove stored API key')
    .action(() => {
      clearConfig();
      printSuccess('Logged out. API key removed from local config.');
    });

  program
    .command('whoami')
    .description('Show the currently authenticated vendor')
    .action(async () => {
      let apiKey: string;
      try {
        apiKey = requireApiKey();
      } catch (error) {
        const err = error as Error;
        printError(err.message);
        process.exit(1);
      }

      const spinner = createSpinner('Fetching account info…').start();

      try {
        const api = new MainlayerApi(apiKey);
        const vendor = await api.whoami();
        spinner.stop();

        console.log('');
        printKeyValue('Name', c.bold(vendor.name));
        printKeyValue('Email', vendor.email);
        printKeyValue('Vendor ID', vendor.id);
        printKeyValue('Member since', new Date(vendor.createdAt).toLocaleDateString());
        console.log('');
      } catch (error) {
        spinner.fail('Failed to fetch account info.');
        handleApiError(error);
      }
    });
}
