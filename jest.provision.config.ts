/**
 * @jest-config-loader esbuild-register
 */
import type { Config } from 'jest';

import unitConfig from './jest.unit.config';

/**
 * .what = the config for the one test that PROVISIONS the generated fixture
 * .why  = `commands/generate.test.ts` WRITES `.test.assets/exampleProject/src/access/daos/**`,
 *         which other suites import at module load. run inside those suites, writer and readers
 *         race across jest workers. so it runs alone, first: `test:unit` and `test:integration`
 *         each invoke this step with `&&` before their own jest run
 * .note  = it inherits the unit config and overrides only testMatch and the slowtest report path
 */
const config: Config = {
  ...unitConfig,
  testMatch: ['**/src/domain.operations/commands/generate.test.ts'],
  reporters: [
    ['default', { summaryThreshold: 0 }],
    [
      'test-fns/slowtest.reporter.jest',
      { slow: '30s', output: '.log/slowtest/provision.report.json' },
    ],
  ],
};

// eslint-disable-next-line import/no-default-export
export default config;
