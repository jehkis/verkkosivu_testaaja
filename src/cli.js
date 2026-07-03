#!/usr/bin/env node
import { testWebsite } from './index.js';
import { printReport } from './report.js';

function parseArgs(argv) {
  const args = { url: null, json: false, headed: false, timeout: undefined };
  for (const arg of argv) {
    if (arg === '--json') args.json = true;
    else if (arg === '--headed') args.headed = true;
    else if (arg.startsWith('--timeout=')) args.timeout = Number(arg.split('=')[1]);
    else if (!args.url) args.url = arg;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.url) {
    console.error('Käyttö: verkkosivu-testaaja <url> [--json] [--headed] [--timeout=ms]');
    process.exit(1);
  }

  const result = await testWebsite(args.url, {
    headless: !args.headed,
    timeout: args.timeout,
  });

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok && result.links.broken.length === 0 && result.images.broken.length === 0 ? 0 : 1);
  }

  const hasIssues = printReport(result);
  process.exit(hasIssues ? 1 : 0);
}

main().catch((error) => {
  console.error('Testaus epäonnistui:', error.message);
  process.exit(1);
});
