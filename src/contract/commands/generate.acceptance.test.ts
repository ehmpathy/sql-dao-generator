import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { genTempDir, given, then, useThen, when } from 'test-fns';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * .what = strips the ansi sgr escapes oclif writes into its help text
 * .why  = oclif writes bold and underline codes even to a pipe. escapes make a contract
 *         snapshot unreadable in a pr, and make a plain-text assertion fail
 * .note  = strips presentation only; every character a human reads survives
 */
const asPlainText = (input: string): string =>
  // biome-ignore lint/suspicious/noControlCharactersInRegex: an ansi escape IS a control char
  input.replace(/\u001B\[[0-9;]*m/g, '');

/**
 * .what = acceptance tests for the generate command via built binary
 * .why = verifies the CLI works after build without ts-node at runtime
 */
describe('generate command via bin/run', () => {
  given('[case1] the project is built', () => {
    when('[t0] bin/run is executed with --help', () => {
      const result = useThen('help command completes', async () => {
        return await execAsync('./bin/run --help');
      });

      then('it shows USAGE instructions', () => {
        expect(result.stdout).toContain('USAGE');
      });

      then('the root help output matches snapshot', () => {
        // .why = `--help` is the first surface a consumer meets, and its text drifts silently
        // .note = the VERSION line is machine-specific (version, platform, node), so it is masked
        const stdoutPortable = asPlainText(result.stdout).replace(
          /^ {2}sql-dao-generator\/.*$/m,
          '  sql-dao-generator/{{version}} {{platform}} node-{{node}}',
        );
        expect(stdoutPortable).toMatchSnapshot();
      });
    });

    when('[t1] bin/run generate is executed with --help', () => {
      // .why = the subcommand help documents the flags. `--config` carries a default, so the
      //        help must never also mark it `(required)`
      // .note = unmasked: no version, path, or platform appears in it
      const result = useThen('generate help command completes', async () => {
        return await execAsync('./bin/run generate --help');
      });

      then('it documents the --config flag and its default', () => {
        expect(asPlainText(result.stdout)).toContain('-c, --config=<value>');
        expect(asPlainText(result.stdout)).toContain(
          '[default: codegen.sql.dao.yml]',
        );
      });

      then('it never claims a defaulted flag is also required', () => {
        expect(asPlainText(result.stdout)).not.toContain('(required)');
      });

      then('the generate help output matches snapshot', () => {
        expect(asPlainText(result.stdout)).toMatchSnapshot();
      });
    });

    when('[t2] bin/run generate is executed with valid config', () => {
      const testDir = genTempDir({
        slug: 'generate-acceptance',
        clone: './src/domain.operations/.test.assets/exampleProject',
        symlink: [{ at: 'node_modules', to: 'node_modules' }],
      });
      const configPath = path.join(testDir, 'codegen.sql.dao.yml');
      const daosOutputDir = path.join(testDir, 'src/access/daos');

      const result = useThen('generate command completes', async () => {
        return await execAsync(`./bin/run generate -c ${configPath}`);
      });

      then('stdout matches snapshot', () => {
        // .why = stripped, like every snapshot here: a snapshot shows escape codes, never color
        // .note = cost: a color regression ships with no visual diff
        expect(asPlainText(result.stdout)).toMatchSnapshot();
      });

      then('stderr matches snapshot', () => {
        // drop the oclif source-map warn — it embeds this machine's absolute worktree path.
        // it spans several lines and carries ansi escapes, so the cut matches its full text
        const stderrPortable = asPlainText(
          result.stderr.replace(
            /Warning: Could not find source[\s\S]*?compiled source\.\n?/g,
            '',
          ),
        );
        expect(stderrPortable).toMatchSnapshot();
      });

      then('it generates DAO directories', () => {
        const dirs = fs.readdirSync(daosOutputDir).sort();
        expect(dirs).toContain('trainDao');
        expect(dirs).toContain('locomotiveDao');
        expect(dirs).toContain('invoiceDao');
      });

      then('it generates findById files', () => {
        const trainDaoFiles = fs
          .readdirSync(path.join(daosOutputDir, 'trainDao'))
          .sort();
        expect(trainDaoFiles).toContain('findById.ts');
        expect(trainDaoFiles).toContain('upsert.ts');
        expect(trainDaoFiles).toContain('index.ts');
      });

      then('generated file structure matches snapshot', () => {
        const listFilesRecursively = (dir: string, prefix = ''): string[] => {
          const entries = fs
            .readdirSync(dir, { withFileTypes: true })
            .sort((a, b) => a.name.localeCompare(b.name));
          const files: string[] = [];
          for (const entry of entries) {
            const relativePath = prefix
              ? `${prefix}/${entry.name}`
              : entry.name;
            if (entry.isDirectory()) {
              files.push(
                ...listFilesRecursively(
                  path.join(dir, entry.name),
                  relativePath,
                ),
              );
            } else {
              files.push(relativePath);
            }
          }
          return files;
        };
        const generatedFiles = listFilesRecursively(daosOutputDir);
        expect(generatedFiles).toMatchSnapshot();
      });
    });

    when('[t3] bin/run is executed in a clean node environment', () => {
      const result = useThen('help command completes', async () => {
        return await execAsync('unset NODE_PATH && ./bin/run --help', {
          shell: '/bin/bash',
        });
      });

      then('it shows USAGE instructions', () => {
        expect(result.stdout).toContain('USAGE');
      });

      then('the help output is byte-identical to the [t0] run', () => {
        // .why = the claim is that NODE_PATH does not change the output, so compare it whole
        const stdoutPortable = asPlainText(result.stdout).replace(
          /^ {2}sql-dao-generator\/.*$/m,
          '  sql-dao-generator/{{version}} {{platform}} node-{{node}}',
        );
        expect(stdoutPortable).toMatchSnapshot();
      });
    });

    when(
      '[t4] bin/run generate is executed a SECOND time over its own output',
      () => {
        // .why = consumers re-run `generate` on every schema change; the unit suites prove the
        //        definers pure, and this proves the command idempotent over a dir it already wrote
        const testDir = genTempDir({
          slug: 'generate-acceptance-repeat',
          clone: './src/domain.operations/.test.assets/exampleProject',
          symlink: [{ at: 'node_modules', to: 'node_modules' }],
        });
        const configPath = path.join(testDir, 'codegen.sql.dao.yml');

        const outcome = useThen('both runs complete', async () => {
          const first = await execAsync(`./bin/run generate -c ${configPath}`);
          const second = await execAsync(`./bin/run generate -c ${configPath}`);
          return { first, second };
        });

        then('the second run is byte-identical to the first', () => {
          expect(outcome.second.stdout).toEqual(outcome.first.stdout);
        });

        then('the second run matches snapshot', () => {
          // .why = the equality above cannot see the shape a consumer meets on a re-run
          // .note = the second run is snapped: consumers see it most, and a cache would degrade it
          expect(asPlainText(outcome.second.stdout)).toMatchSnapshot();
        });
      },
    );

    when(
      '[t5] bin/run generate is executed against a primitive-array fixture (the wish day-in-the-life)',
      () => {
        // `aliases: string[]` yields prop.ARRAY_OF(prop.VARCHAR()), which the installed
        // sql-schema-generator rejects; the consumer meets a ConstraintError that names the fix
        const testDir = genTempDir({
          slug: 'generate-acceptance-native-arrays',
          clone: './src/domain.operations/.test.assets/exampleProject',
          symlink: [{ at: 'node_modules', to: 'node_modules' }],
        });
        const configPath = path.join(
          testDir,
          'codegen.sql.dao.nativeArrays.yml',
        );

        const outcome = useThen('the generate command fails loud', async () => {
          return await execAsync(`./bin/run generate -c ${configPath}`)
            .then(() => ({ failed: false, output: '' }))
            .catch((error) => ({
              failed: true,
              // collapse whitespace: the cli word-wraps the error across lines, so a phrase reassembles here
              output: `${error.stderr ?? ''}\n${error.stdout ?? ''}\n${
                error.message ?? ''
              }`.replace(/\s+/g, ' '),
            }));
        });

        then(
          'it surfaces the helpful native-array ConstraintError, not a raw crash',
          () => {
            expect(outcome.failed).toBe(true);
            expect(outcome.output).toContain(
              'can not yet build a native primitive or enum array column',
            );
          },
        );

        then(
          'the error names the fix — upgrade or model as a reference',
          () => {
            expect(outcome.output).toContain('upgrade sql-schema-generator');
          },
        );

        then('the helpful error message matches snapshot', () => {
          // snapshot the portable message only: drop the oclif source-map warn before
          // `ConstraintError:` and the node crash dump after it — both carry absolute paths
          const helpfulMessage = outcome.output
            .replace(/^[\s\S]*?(ConstraintError:)/, '$1')
            .split(/[,{]\s*"?stderr"?/)[0]!
            .trim();
          expect(helpfulMessage).toMatchSnapshot();
        });
      },
    );
  });
});
