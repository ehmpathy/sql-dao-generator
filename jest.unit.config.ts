/**
 * @jest-config-loader esbuild-register
 */
import type { Config } from 'jest';

// ensure tests run in utc, like they will on cicd and on server; https://stackoverflow.com/a/56277249/15593329
process.env.TZ = 'UTC';

// ensure tests run like on local machines, so snapshots are equal on local && cicd
process.env.FORCE_COLOR = 'true';

// https://jestjs.io/docs/configuration
const config: Config = {
  verbose: true,
  reporters: [
    ['default', { summaryThreshold: 0 }], // ensure we always get a failure summary at the bottom, to avoid the hunt
    ['test-fns/slowtest.reporter.jest', { slow: '10s', output: '.log/slowtest/unit.report.json' }],
  ],
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'ts'],
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  transformIgnorePatterns: [
    // here's an example of how to ignore esm module transformation, when needed
    // 'node_modules/(?!(@octokit|universal-user-agent|before-after-hook)/)',
  ],
  testMatch: [
    // note: order matters
    '**/*.test.ts',
    '!**/*.acceptance.test.ts',
    '!**/*.integration.test.ts',
    // .why = `generate.test.ts` runs the real generate command, which WRITES
    //        `.test.assets/exampleProject/src/access/daos/**`. several unit suites import
    //        those generated modules at module load, so while it sat in this suite a writer
    //        and its readers ran concurrently across jest workers with no order guarantee —
    //        `rule.forbid.race-conditions`. it is also an integration test by definition, since
    //        it crosses the filesystem boundary (`rule.forbid.unit.remote-boundaries`)
    // .how = it now runs only as the `test:integration:provision-generated-files-to-import`
    //        step, which `test:unit` and `test:integration` each invoke BEFORE their jest run —
    //        a separate process, sequenced by `&&`, so the fixture is fresh when the suite
    //        starts and no writer mutates it while the suite reads it
    '!**/commands/generate.test.ts',
    '!**/.agent/.cache/**',
    '!**/.yalc/**',
  ],

  // .what = the trees jest must not walk at all — not for tests, and not for snapshots
  // .why  = `testMatch` above already drops `.agent/.cache/**`, and that covers only half the
  //         hazard: it decides which files RUN, never which `__snapshots__` are scanned for
  //         obsolescence. `rmsafe` moves a deleted file into `.agent/.cache/**/trash/`, which is
  //         inside the repo — so to delete a `.snap` with it leaves a copy jest still finds,
  //         reports as obsolete, and (since an obsolete file sets `snapshot.failure`) FAILS the
  //         run on. the suite then exits 1 while every line above it reads `1 passed`, which is
  //         the worst shape a failure can take
  // .note  = `.yalc` is here for the same reason one rung over — a yalc-linked package brings its
  //          own `__snapshots__`, and those belong to its repo rather than to this run
  modulePathIgnorePatterns: ['/\\.agent/\\.cache/', '/\\.yalc/'],
  setupFilesAfterEnv: ['./jest.unit.env.ts'],

  // use 50% of threads to leave headroom for other processes
  maxWorkers: '50%', // https://stackoverflow.com/questions/71287710/why-does-jest-run-faster-with-maxworkers-50
};

// eslint-disable-next-line import/no-default-export
export default config;
