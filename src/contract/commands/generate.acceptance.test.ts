import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import { genTempDir, given, then, useThen, when } from 'test-fns';

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
        clone: './src/logic/__test_assets__/exampleProject',
        symlink: [{ at: 'node_modules', to: 'node_modules' }],
      });
      const configPath = path.join(testDir, 'codegen.sql.dao.yml');
      const daosOutputDir = path.join(testDir, 'src/data/dao');

      const result = useThen('generate command completes', async () => {
        return await execAsync(`./bin/run generate -c ${configPath}`);
      });

      then('stdout matches snapshot', () => {
        expect(result.stdout).toMatchSnapshot();
      });

      then('stderr matches snapshot', () => {
        expect(result.stderr).toMatchSnapshot();
      });

      then('it generates DAO directories', () => {
        const dirs = fs.readdirSync(daosOutputDir).sort();
        expect(dirs).toContain('trainDao');
        expect(dirs).toContain('locomotiveDao');
        expect(dirs).toContain('invoiceDao');
      });

      then('it generates findById files', () => {
        const trainDaoFiles = fs.readdirSync(
          path.join(daosOutputDir, 'trainDao'),
        ).sort();
        expect(trainDaoFiles).toContain('findById.ts');
        expect(trainDaoFiles).toContain('upsert.ts');
        expect(trainDaoFiles).toContain('index.ts');
      });

      then('generated file structure matches snapshot', () => {
        const listFilesRecursively = (dir: string, prefix = ''): string[] => {
          const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
          const files: string[] = [];
          for (const entry of entries) {
            const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
            if (entry.isDirectory()) {
              files.push(...listFilesRecursively(path.join(dir, entry.name), relativePath));
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
  });
});
