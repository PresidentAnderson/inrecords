#!/usr/bin/env tsx
// Test runner script for inRECORD development

import { runSmokeTests } from '../utils/smokeTests';
import { runDevAgents } from '../utils/devAgents';

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'smoke':
      console.log('Running smoke tests...\n');
      const results = runSmokeTests();
      const hasFailures = results.some((r) => !r.ok);
      process.exit(hasFailures ? 1 : 0);
      break;

    case 'agents':
      console.log('Running development agents...\n');
      await runDevAgents();
      break;

    default:
      console.log('Available commands:');
      console.log('  npm run test:smoke  - Run smoke tests');
      console.log('  npm run test:agents - Run development agents');
      break;
  }
}

main().catch((error) => {
  console.error('Test script failed:', error);
  process.exit(1);
});
