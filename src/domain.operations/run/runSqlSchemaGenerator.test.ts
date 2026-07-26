import { ConstraintError, MalfunctionError } from 'helpful-errors';
import { given, then, when } from 'test-fns';

import { DatabaseLanguage } from '@src/domain.objects/constants';
import type { GeneratorConfig } from '@src/domain.objects/GeneratorConfig';

import {
  runSqlSchemaGenerator,
  type SqlSchemaGeneratorShell,
} from './runSqlSchemaGenerator';

// a minimal but complete GeneratorConfig; only rootDir + generates.schema.config.path are read by runSqlSchemaGenerator, the rest satisfy the type
const genExampleConfig = (): GeneratorConfig => ({
  rootDir: '/tmp/example-root',
  language: DatabaseLanguage.POSTGRES,
  dialect: 'postgres',
  for: { objects: [] },
  generates: {
    daos: {
      to: 'src/daos',
      using: { log: './log', DatabaseConnection: './db' },
    },
    schema: {
      config: {
        path: 'provision/schema/config.yml',
        content: { declarations: '', generates: { sql: { to: './sql' } } },
      },
    },
    control: {
      config: {
        path: 'provision/control/config.yml',
        content: { definitions: [] },
      },
    },
    code: {
      config: {
        path: 'provision/code/config.yml',
        content: {
          resources: [],
          queries: [],
          generates: { types: './types', queryFunctions: './fns' },
        },
      },
    },
  },
});

// a fake shell that records its cd target and returns a caller-provided result — a real fake, not a mock of the system under test (rule.forbid.unit.remote-boundaries)
const genFakeShell = (result: {
  stderr: string;
  stdout: string;
}): { shell: SqlSchemaGeneratorShell; cdTargets: string[] } => {
  const cdTargets: string[] = [];
  return {
    cdTargets,
    shell: {
      cd: (dir: string) => {
        cdTargets.push(dir);
      },
      exec: () => result,
    },
  };
};

describe('runSqlSchemaGenerator', () => {
  given(
    '[case1] the shell reports the native-array-unsupported stderr signal',
    () => {
      // this is the one path a real consumer hits today: a primitive/enum array (tags: string[])
      // makes sql-schema-generator's ARRAY_OF reject the column, so the shell reports this on stderr
      const stderr =
        'Error: only arrays of REFERENCEs or UUIDs are supported\n    at ARRAY_OF (.../defineProperty.ts:367)';

      when('[t0] the generator is run', () => {
        then(
          'it throws the helpful ConstraintError, not a raw crash',
          async () => {
            const fake = genFakeShell({ stderr, stdout: '' });
            let errorThrown: Error | null = null;
            await runSqlSchemaGenerator(
              { config: genExampleConfig() },
              { shell: fake.shell },
            ).catch((error) => {
              errorThrown = error;
            });
            expect(errorThrown).toBeInstanceOf(ConstraintError);
            expect(errorThrown!.message).toContain(
              'can not yet build a native primitive or enum array column',
            );
            expect(errorThrown!.message).toContain(
              'upgrade sql-schema-generator',
            );
          },
        );

        then('it cd-ed into the config rootDir before the run', async () => {
          const fake = genFakeShell({ stderr, stdout: '' });
          await runSqlSchemaGenerator(
            { config: genExampleConfig() },
            { shell: fake.shell },
          ).catch(() => undefined);
          expect(fake.cdTargets).toEqual(['/tmp/example-root']);
        });
      });
    },
  );

  given('[case2] the shell reports an unrelated stderr', () => {
    const stderr = 'Error: could not connect to config at ./absent.yml';

    when('[t0] the generator is run', () => {
      then('it throws a MalfunctionError with the raw stderr', async () => {
        const fake = genFakeShell({ stderr, stdout: '' });
        let errorThrown: Error | null = null;
        await runSqlSchemaGenerator(
          { config: genExampleConfig() },
          { shell: fake.shell },
        ).catch((error) => {
          errorThrown = error;
        });
        expect(errorThrown).toBeInstanceOf(MalfunctionError);
        expect(errorThrown!.message).toContain('sql-schema-generator failed');
        expect(errorThrown!.message).toContain(
          'could not connect to config at ./absent.yml',
        );
      });
    });
  });

  given('[case3] the shell reports success with no stderr', () => {
    when('[t0] the generator is run', () => {
      then('it resolves without a throw', async () => {
        const fake = genFakeShell({
          stderr: '',
          stdout:
            'some preamble\n  [completed] generate for [table] provider\ntail line',
        });
        await expect(
          runSqlSchemaGenerator(
            { config: genExampleConfig() },
            { shell: fake.shell },
          ),
        ).resolves.toBeUndefined();
      });
    });
  });
});
