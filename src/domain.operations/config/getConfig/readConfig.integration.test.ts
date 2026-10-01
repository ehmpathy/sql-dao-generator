import { writeFileSync } from 'fs';
import { join } from 'path';
import { genTempDir, getError, given, then, useThen, when } from 'test-fns';

import { GeneratorConfig } from '@src/domain';
import { UserInputError } from '@src/domain.operations/UserInputError';

import { readConfig } from './readConfig';

/**
 * .what = writes a config yml into a fresh temp dir and hands back its path
 * .why  = each guard needs a config that parses but lacks one key; a temp dir keeps each case
 *         hermetic
 */
const genConfigAt = (input: { slug: string; yml: string }): string => {
  const dir = genTempDir({ slug: input.slug });
  const path = join(dir, 'codegen.sql.dao.yml');
  writeFileSync(path, input.yml);
  return path;
};

describe('readConfig', () => {
  given(
    '[case1] a config path that points at no file — the commonest first-run failure',
    () => {
      // .why = a path typo or a run from the wrong directory must name the `-c` flag, not a raw ENOENT
      when('[t0] the config is read', () => {
        // .note = wrapped in a record: `useThen` copies own-enumerable properties onto a plain
        //         `{}`, which drops an Error's prototype and its non-enumerable `message`
        const outcome = useThen('the config read fails loud', async () => ({
          error: await getError(
            readConfig({ configPath: `${__dirname}/does-not-exist.yml` }),
          ),
        }));

        then('it throws a UserInputError, never a raw ENOENT', () => {
          expect(outcome.error).toBeInstanceOf(UserInputError);
          expect(outcome.error.message).not.toContain('ENOENT');
        });

        then(
          'the message names the absent path, so the typo is visible',
          () => {
            expect(outcome.error.message).toContain('does-not-exist.yml');
          },
        );

        then(
          'the message names the fix — the flag, and the directory it is relative to',
          () => {
            expect(outcome.error.message).toContain('--config (-c)');
            expect(outcome.error.message).toContain(
              'the directory it is relative to',
            );
            expect(outcome.error.message).toContain(
              'sql-dao-generator generate --config',
            );
          },
        );

        then(
          'it carries no `undefined` subject, since a config names no domain object',
          () => {
            expect(outcome.error.message).not.toContain('undefined');
          },
        );

        then('the message matches snapshot', () => {
          // .why = the fragments above pin phrases; the snapshot pins line order and indent
          // .note = the absent path is this file's own `__dirname`, so it is masked
          const messagePortable = outcome.error.message.replace(
            new RegExp(__dirname, 'g'),
            '{{dir}}',
          );
          expect(messagePortable).toMatchSnapshot();
        });
      });
    },
  );

  given('[case2] a config that parses but declares no `language`', () => {
    // .why = the first guard a hand-written config meets; it names the one accepted value
    const configPath = genConfigAt({
      slug: 'read-config-absent-language',
      yml: 'dialect: "10.7"\n',
    });

    when('[t0] the config is read', () => {
      const outcome = useThen('the config read fails loud', async () => ({
        error: await getError(readConfig({ configPath })),
      }));

      then('it names the one accepted value, so no search is owed', () => {
        expect(outcome.error).toBeInstanceOf(UserInputError);
        expect(outcome.error.message).toContain(
          'config.language must be defined',
        );
        expect(outcome.error.message).toContain('language: postgres');
      });

      then('the message matches snapshot', () => {
        // deterministic end to end — this guard names no path, so no mask is owed
        expect(outcome.error.message).toMatchSnapshot();
      });
    });
  });

  given('[case3] a config that declares `language` but no `dialect`', () => {
    // .why = the dialect shape is not guessable, so the message shows the readme's `dialect: 10.7`
    const configPath = genConfigAt({
      slug: 'read-config-absent-dialect',
      yml: 'language: postgres\n',
    });

    when('[t0] the config is read', () => {
      const outcome = useThen('the config read fails loud', async () => ({
        error: await getError(readConfig({ configPath })),
      }));

      then('it names the key and shows a value in the right shape', () => {
        expect(outcome.error).toBeInstanceOf(UserInputError);
        expect(outcome.error.message).toContain(
          'config.dialect must be defined',
        );
        expect(outcome.error.message).toContain('dialect: 10.7');
      });

      then('the message matches snapshot', () => {
        // deterministic end to end — this guard names no path, so no mask is owed
        expect(outcome.error.message).toMatchSnapshot();
      });
    });
  });

  given('[case4] a config that declares no `generates` key', () => {
    // .why = its fix is a structure, so it owes a skeleton and a pointer at the readme
    const configPath = genConfigAt({
      slug: 'read-config-absent-generates',
      yml: 'language: postgres\ndialect: "10.7"\n',
    });

    when('[t0] the config is read', () => {
      const outcome = useThen('the config read fails loud', async () => ({
        error: await getError(readConfig({ configPath })),
      }));

      then('it shows the skeleton of the key it wants', () => {
        expect(outcome.error).toBeInstanceOf(UserInputError);
        expect(outcome.error.message).toContain(
          'config.generates key must be defined',
        );
        expect(outcome.error.message).toContain('to: src/access/daos');
        expect(outcome.error.message).toContain(
          'config: codegen.sql.schema.yml',
        );
      });

      then('it points at the readme, since the full shape is larger', () => {
        expect(outcome.error.message).toContain('Define a config yml');
      });

      then('the message matches snapshot', () => {
        // .why = a fragment cannot pin the skeleton's indent, and the indent is what makes it parse
        expect(outcome.error.message).toMatchSnapshot();
      });
    });
  });

  given('[case5] the example config provisioned in .test.assets', () => {
    when('[t0] the config is read', () => {
      // .note = wrapped in a record, as in case1, to keep the GeneratorConfig prototype
      const outcome = useThen('the config read succeeds', async () => ({
        config: await readConfig({
          configPath: `${__dirname}/../../.test.assets/exampleProject/codegen.sql.dao.yml`,
        }),
      }));

      then(
        'it hydrates a GeneratorConfig with the declared language and dialect',
        () => {
          expect(outcome.config).toBeInstanceOf(GeneratorConfig);
          expect(outcome.config.language).toEqual('postgres');
          expect(outcome.config.dialect).toEqual('10.7');
        },
      );

      then('it hydrates every `generates` target the config declares', () => {
        expect(outcome.config.generates).toMatchObject({
          daos: {
            to: 'src/access/daos',
            using: {
              log: 'src/util/log#log',
              DatabaseConnection:
                'src/util/database/getDbConnection#DatabaseConnection',
            },
          },
          schema: {
            config: {
              path: 'codegen.sql.schema.yml',
              content: expect.anything(),
            },
          },
          control: {
            config: {
              path: 'provision/schema/control.yml',
              content: expect.anything(),
            },
          },
          code: {
            config: {
              path: 'codegen.sql.types.yml',
              content: expect.anything(),
            },
          },
        });
      });

      then('it finds every declared domain object', () => {
        expect(outcome.config.for.objects.length).toEqual(12);
      });

      then('the hydrated config matches snapshot', () => {
        // .note = the rootDir is machine-specific, so it is masked
        expect(outcome.config).toMatchSnapshot({ rootDir: expect.anything() });
      });
    });
  });
});
