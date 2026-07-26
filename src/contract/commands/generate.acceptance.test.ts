import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { genTempDir, given, then, useThen, when } from 'test-fns';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
    });

    when('[t1] bin/run generate is executed with valid config', () => {
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
        expect(result.stdout).toMatchSnapshot();
      });

      then('stderr matches snapshot', () => {
        // remove path warning since it contains machine-specific absolute paths
        // the warning spans multiple lines with ANSI codes, so match the full warning text
        const stderrPortable = result.stderr.replace(
          /Warning: Could not find source[\s\S]*?compiled source\.\n?/g,
          '',
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

    when('[t2] bin/run is executed in a clean node environment', () => {
      const result = useThen('help command completes', async () => {
        return await execAsync('unset NODE_PATH && ./bin/run --help', {
          shell: '/bin/bash',
        });
      });

      then('it shows USAGE instructions', () => {
        expect(result.stdout).toContain('USAGE');
      });
    });

    when(
      '[t3] bin/run generate is executed against a primitive-array fixture (the wish day-in-the-life)',
      () => {
        // the headline feature: a consumer models `aliases: string[]` and runs codegen. the generator
        // now emits prop.ARRAY_OF(prop.VARCHAR()), but the installed sql-schema-generator's ARRAY_OF
        // still rejects native primitive/enum arrays — so the current user experience is a helpful,
        // actionable ConstraintError (not a raw subprocess crash). this locks that UX at the cli
        // contract boundary, where a real consumer meets it. see handoff.sql-schema-generator.md
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
          // snapshot the portable helpful prose only. two non-portable envelopes wrap it:
          // - a front oclif "could not find source ... /abs/path/dist ... compiled source." warn,
          //   which embeds this machine's absolute worktree path
          // - a tail `{ "stderr": ... }` node crash dump with abs paths, temp dirs, node version,
          //   and stack line:col
          // drop the front warn at the `ConstraintError:` marker and cut the tail metadata at its
          // boundary. what remains — the cli-formatted ConstraintError message — is fully
          // deterministic and is exactly the UX a real consumer meets.
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
