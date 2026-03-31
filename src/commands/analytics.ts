import { Command } from 'commander';
import { createApiClient } from '../lib/api.js';
import { requireApiKey } from '../lib/config.js';
import {
  c,
  createSpinner,
  formatMoney,
  handleApiError,
  printBarChart,
  printDivider,
  printError,
  printHeader,
  printKeyValue,
} from '../lib/output.js';

export function registerAnalyticsCommand(program: Command): void {
  program
    .command('analytics')
    .description('Display revenue dashboard in the terminal')
    .action(async () => {
      let apiKey: string;
      try {
        apiKey = requireApiKey();
      } catch (err) {
        printError((err as Error).message);
        process.exit(1);
      }

      const spinner = createSpinner('Loading analytics…').start();

      try {
        const api = createApiClient(apiKey);
        const data = await api.getAnalytics();
        spinner.stop();

        printHeader('Revenue Dashboard');

        // Summary row
        printKeyValue('Total Revenue', c.money(formatMoney(data.totalRevenue, data.currency)));
        printKeyValue('Total Payments', String(data.totalPayments));
        printKeyValue(
          'Success Rate',
          `${(data.successRate * 100).toFixed(1)}%`,
        );
        console.log('');

        // Daily revenue bar chart
        if (data.byDay && data.byDay.length > 0) {
          const chartEntries = data.byDay.slice(-14).map((day) => ({
            label: formatShortDate(day.date),
            value: day.revenue,
          }));

          printBarChart(chartEntries, {
            title: 'Revenue — Last 14 Days',
            maxWidth: 36,
            formatValue: (v) => formatMoney(v, data.currency),
          });
        }

        // Top resources
        if (data.topResources && data.topResources.length > 0) {
          console.log(c.bold('  Top Resources by Revenue'));
          printDivider();

          data.topResources.slice(0, 5).forEach((resource, i) => {
            const rank = c.muted(`${i + 1}.`);
            const name = resource.name.padEnd(30);
            const revenue = c.money(formatMoney(resource.revenue, data.currency));
            console.log(`  ${rank} ${name} ${revenue}`);
          });
          console.log('');
        } else {
          console.log(c.muted('  No resource revenue data available yet.'));
          console.log('');
        }
      } catch (error) {
        spinner.fail('Failed to load analytics.');
        handleApiError(error);
      }
    });
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr.slice(5); // fallback: MM-DD
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
